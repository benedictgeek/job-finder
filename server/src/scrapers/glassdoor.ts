import puppeteer from 'puppeteer'
import type { Scraper, SearchOptions, ScrapedJob } from './types.js'

const GLASSDOOR_BASE_URL = 'https://www.glassdoor.com'

export const glassdoorScraper: Scraper = {
  name: 'glassdoor',

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

      // Glassdoor job search URL
      const searchUrl = `${GLASSDOOR_BASE_URL}/Job/jobs.htm?sc.keyword=${encodeURIComponent(query)}&locT=C&locKeyword=${encodeURIComponent(location)}`
      console.log(`Scraping Glassdoor: ${searchUrl}`)

      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 })

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Try to close any modals/popups
      const closeButtons = await page.$$('button[aria-label="Close"], [data-test="close-modal"], .modal-close, [class*="CloseButton"]')
      for (const btn of closeButtons) {
        try {
          await btn.click()
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (e) {
          // Modal might already be closed
        }
      }

      // Scroll to load more content
      await page.evaluate(async () => {
        for (let i = 0; i < 3; i++) {
          window.scrollBy(0, 600)
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

        // Strategy 1: Job listing cards with data attributes
        const jobCards = document.querySelectorAll('[data-test="jobListing"], [data-id], li[class*="JobsList"], .JobCard, .react-job-listing')
        jobCards.forEach(card => {
          if (jobs.length >= maxResults) return

          // Multiple selectors for title
          const titleEl = card.querySelector('[data-test="job-title"], [class*="jobTitle"], a[class*="JobCard_jobTitle"], h2 a, .job-title a')
          // Multiple selectors for company
          const companyEl = card.querySelector('[data-test="employer-name"], [class*="EmployerProfile"], [class*="companyName"], .employer-name')
          // Multiple selectors for location
          const locationEl = card.querySelector('[data-test="emp-location"], [class*="location"], .job-location')
          // Multiple selectors for salary
          const salaryEl = card.querySelector('[data-test="detailSalary"], [class*="salary"], .salary-estimate')

          const title = titleEl?.textContent?.trim() || ''
          const company = companyEl?.textContent?.trim() || ''
          const url = titleEl?.getAttribute('href') || card.querySelector('a')?.getAttribute('href') || null

          if (title && company) {
            jobs.push({
              title,
              company,
              location: locationEl?.textContent?.trim() || null,
              url,
              salary: salaryEl?.textContent?.trim() || null
            })
          }
        })

        // Strategy 2: Look for job links directly
        if (jobs.length === 0) {
          const jobLinks = document.querySelectorAll('a[href*="/job-listing/"], a[href*="/Jobs/"]')
          const seen = new Set<string>()

          jobLinks.forEach(link => {
            if (jobs.length >= maxResults) return

            const href = link.getAttribute('href')
            if (!href || seen.has(href)) return
            seen.add(href)

            const card = link.closest('li, div[class*="job"], article')
            if (!card) return

            const titleText = link.textContent?.trim() || ''
            const companyEl = card.querySelector('[class*="employer"], [class*="company"]')
            const locationEl = card.querySelector('[class*="location"]')

            if (titleText && companyEl) {
              jobs.push({
                title: titleText,
                company: companyEl.textContent?.trim() || '',
                location: locationEl?.textContent?.trim() || null,
                url: href,
                salary: null
              })
            }
          })
        }

        // Strategy 3: Generic card pattern matching
        if (jobs.length === 0) {
          const cards = document.querySelectorAll('[class*="JobCard"], [class*="jobCard"], [class*="job-card"]')
          cards.forEach(card => {
            if (jobs.length >= maxResults) return

            const headings = card.querySelectorAll('h2, h3, a')
            const texts = Array.from(headings).map(h => h.textContent?.trim()).filter(Boolean)

            if (texts.length >= 2) {
              const link = card.querySelector('a')?.getAttribute('href') || null
              jobs.push({
                title: texts[0] || '',
                company: texts[1] || '',
                location: texts[2] ?? null,
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
          url = `${GLASSDOOR_BASE_URL}${url}`
        }
        jobs.push({
          title: job.title,
          company: job.company,
          location: job.location,
          description: null,
          url,
          source: 'glassdoor',
          salary: job.salary,
          posted_date: null
        })
      }

      console.log(`Glassdoor found ${jobs.length} jobs`)
      return jobs
    } catch (error) {
      console.error('Glassdoor scraping error:', error)
      return []
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }
}
