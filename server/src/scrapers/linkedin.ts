import puppeteer from 'puppeteer'
import type { Scraper, SearchOptions, ScrapedJob } from './types.js'

const LINKEDIN_BASE_URL = 'https://www.linkedin.com'

export const linkedinScraper: Scraper = {
  name: 'linkedin',

  async search(options: SearchOptions): Promise<ScrapedJob[]> {
    const { query, location, maxResults = 25 } = options
    const jobs: ScrapedJob[] = []
    let browser

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      })

      const page = await browser.newPage()
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      )
      await page.setViewport({ width: 1920, height: 1080 })

      // LinkedIn public jobs search (no login required)
      const searchUrl = `${LINKEDIN_BASE_URL}/jobs/search?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&f_TPR=r604800&position=1&pageNum=0`
      console.log(`Scraping LinkedIn: ${searchUrl}`)

      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 })

      // Wait for job listings to load
      await page.waitForSelector('.jobs-search__results-list, .base-search-card, ul.jobs-search__results-list', { timeout: 15000 }).catch(() => {
        console.log('LinkedIn: Primary selector not found, trying alternatives')
      })

      // Scroll to load more jobs
      await page.evaluate(async () => {
        for (let i = 0; i < 3; i++) {
          window.scrollBy(0, 800)
          await new Promise(r => setTimeout(r, 500))
        }
      })

      await new Promise(resolve => setTimeout(resolve, 2000))

      // Extract jobs using multiple strategies
      const jobData = await page.evaluate((maxResults) => {
        const jobs: Array<{
          title: string
          company: string
          location: string | null
          url: string | null
          salary: string | null
        }> = []

        // Strategy 1: base-search-card (public LinkedIn jobs page)
        const baseCards = document.querySelectorAll('.base-search-card, .job-search-card, .base-card')
        baseCards.forEach(card => {
          if (jobs.length >= maxResults) return

          const titleEl = card.querySelector('.base-search-card__title, .job-search-card__title, h3, h4')
          const companyEl = card.querySelector('.base-search-card__subtitle, .job-search-card__company-name, h4')
          const locationEl = card.querySelector('.job-search-card__location, .base-search-card__metadata span')
          const linkEl = card.querySelector('a.base-card__full-link, a[data-tracking-control-name]')
          const salaryEl = card.querySelector('.job-search-card__salary-info, .salary')

          const title = titleEl?.textContent?.trim() || ''
          const company = companyEl?.textContent?.trim() || ''

          if (title && company && title !== company) {
            jobs.push({
              title,
              company,
              location: locationEl?.textContent?.trim() || null,
              url: linkEl?.getAttribute('href') || null,
              salary: salaryEl?.textContent?.trim() || null
            })
          }
        })

        // Strategy 2: List items in job results
        if (jobs.length === 0) {
          const listItems = document.querySelectorAll('ul.jobs-search__results-list li, .jobs-search-results__list-item')
          listItems.forEach(item => {
            if (jobs.length >= maxResults) return

            const titleEl = item.querySelector('[class*="title"], h3 a, h3')
            const companyEl = item.querySelector('[class*="company"], h4 a, h4')
            const locationEl = item.querySelector('[class*="location"], span[class*="location"]')
            const linkEl = item.querySelector('a[href*="/jobs/view/"]')

            const title = titleEl?.textContent?.trim() || ''
            const company = companyEl?.textContent?.trim() || ''

            if (title && company && title !== company) {
              jobs.push({
                title,
                company,
                location: locationEl?.textContent?.trim() || null,
                url: linkEl?.getAttribute('href') || null,
                salary: null
              })
            }
          })
        }

        // Strategy 3: Look for any job-like cards
        if (jobs.length === 0) {
          const cards = document.querySelectorAll('[class*="job"][class*="card"], [class*="result"]')
          cards.forEach(card => {
            if (jobs.length >= maxResults) return

            const link = card.querySelector('a')?.getAttribute('href')

            // Try to extract structured data
            const h3 = card.querySelector('h3')?.textContent?.trim()
            const h4 = card.querySelector('h4')?.textContent?.trim()

            if (h3 && h4 && link) {
              jobs.push({
                title: h3,
                company: h4,
                location: null,
                url: link,
                salary: null
              })
            }
          })
        }

        return jobs
      }, maxResults)

      for (const job of jobData) {
        let url = job.url
        if (url && !url.startsWith('http')) {
          url = `${LINKEDIN_BASE_URL}${url}`
        }
        jobs.push({
          title: job.title,
          company: job.company,
          location: job.location,
          description: null,
          url,
          source: 'linkedin',
          salary: job.salary,
          posted_date: null
        })
      }

      console.log(`LinkedIn found ${jobs.length} jobs`)
      return jobs
    } catch (error) {
      console.error('LinkedIn scraping error:', error)
      return []
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }
}
