import * as cheerio from 'cheerio'
import type { Scraper, SearchOptions, ScrapedJob } from './types.js'

const INDEED_BASE_URL = 'https://www.indeed.com'

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      })
      if (response.ok) {
        return await response.text()
      }
      if (response.status === 403) {
        console.warn(`Indeed returned 403 on attempt ${i + 1}`)
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
      }
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('Failed to fetch Indeed page')
}

export const indeedScraper: Scraper = {
  name: 'indeed',

  async search(options: SearchOptions): Promise<ScrapedJob[]> {
    const { query, location, maxResults = 15 } = options
    const jobs: ScrapedJob[] = []

    try {
      const searchUrl = `${INDEED_BASE_URL}/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&fromage=14`
      console.log(`Scraping Indeed: ${searchUrl}`)

      const html = await fetchWithRetry(searchUrl)
      const $ = cheerio.load(html)

      // Try to extract job data from the embedded JSON (more reliable than DOM scraping)
      const scripts = $('script').toArray()
      for (const script of scripts) {
        const content = $(script).html() || ''
        if (content.includes('mosaic-provider-jobcards') || content.includes('jobResults')) {
          try {
            // Look for JSON data in script tags
            const jsonMatch = content.match(/window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*({.+?});/s)
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[1])
              const results = data?.metaData?.mosaicProviderJobCardsModel?.results || []
              for (const job of results.slice(0, maxResults)) {
                jobs.push({
                  title: job.title || '',
                  company: job.company || '',
                  location: job.formattedLocation || job.location || null,
                  description: job.snippet || null,
                  url: job.jobkey ? `${INDEED_BASE_URL}/viewjob?jk=${job.jobkey}` : null,
                  source: 'indeed',
                  salary: job.salarySnippet?.text || job.extractedSalary?.text || null,
                  posted_date: job.formattedRelativeTime || null
                })
              }
              if (jobs.length > 0) {
                console.log(`Indeed found ${jobs.length} jobs from JSON data`)
                return jobs
              }
            }
          } catch (e) {
            console.log('Could not parse Indeed JSON data, falling back to DOM')
          }
        }
      }

      // Fallback: DOM-based scraping with multiple selector strategies
      const selectors = [
        'div[data-jk]',
        '.jobsearch-ResultsList > div',
        '.job_seen_beacon',
        '.resultContent',
        '[data-testid="job-card"]',
        '.tapItem'
      ]

      let jobElements: cheerio.Cheerio<cheerio.Element> | null = null
      for (const selector of selectors) {
        const elements = $(selector)
        if (elements.length > 0) {
          console.log(`Indeed: Found ${elements.length} elements with selector: ${selector}`)
          jobElements = elements
          break
        }
      }

      if (!jobElements || jobElements.length === 0) {
        console.log('Indeed: No job elements found with any selector')
        console.log('Page title:', $('title').text())
        return []
      }

      jobElements.each((_, element) => {
        if (jobs.length >= maxResults) return false

        const $el = $(element)

        // Try multiple ways to get each field
        const title = $el.find('h2 a span, h2.jobTitle span, [data-testid="job-title"], .jobTitle').first().text().trim() ||
                      $el.find('a[data-jk] span, a.jcs-JobTitle span').first().text().trim() ||
                      $el.attr('data-title') || ''

        const company = $el.find('[data-testid="company-name"], .companyName, .company_location .companyName, span.css-1h7lukg').first().text().trim() ||
                        $el.find('.company').first().text().trim() || ''

        const locationText = $el.find('[data-testid="text-location"], .companyLocation, .company_location .companyLocation').first().text().trim() ||
                             $el.find('.location').first().text().trim() || ''

        const salary = $el.find('.salary-snippet-container, .salaryOnly, [data-testid="attribute_snippet_testid"], .estimated-salary').first().text().trim() || ''

        const description = $el.find('.job-snippet, .underShelfFooter, [data-testid="job-snippet"]').first().text().trim() || ''

        const jobKey = $el.attr('data-jk') ||
                       $el.find('a[data-jk]').attr('data-jk') ||
                       $el.find('a').attr('href')?.match(/jk=([^&]+)/)?.[1] || ''

        if (title && company) {
          jobs.push({
            title,
            company,
            location: locationText || null,
            description: description || null,
            url: jobKey ? `${INDEED_BASE_URL}/viewjob?jk=${jobKey}` : null,
            source: 'indeed',
            salary: salary || null,
            posted_date: null
          })
        }
      })

      console.log(`Indeed found ${jobs.length} jobs via DOM scraping`)
      return jobs
    } catch (error) {
      console.error('Indeed scraping error:', error)
      return []
    }
  }
}
