import { indeedScraper } from './indeed.js'
import { linkedinScraper } from './linkedin.js'
import { glassdoorScraper } from './glassdoor.js'
import type { Scraper, SearchOptions, ScrapedJob } from './types.js'

export type { ScrapedJob, SearchOptions, Scraper }

const scrapers: Record<string, Scraper> = {
  indeed: indeedScraper,
  linkedin: linkedinScraper,
  glassdoor: glassdoorScraper
}

export async function searchJobs(
  sources: string[],
  options: SearchOptions
): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = []

  const scrapePromises = sources.map(async (source) => {
    const scraper = scrapers[source]
    if (!scraper) {
      console.warn(`Unknown scraper source: ${source}`)
      return []
    }

    try {
      console.log(`Starting ${source} scraper...`)
      const jobs = await scraper.search(options)
      console.log(`${source} scraper completed with ${jobs.length} results`)
      return jobs
    } catch (error) {
      console.error(`Error with ${source} scraper:`, error)
      return []
    }
  })

  const allResults = await Promise.all(scrapePromises)
  for (const jobs of allResults) {
    results.push(...jobs)
  }

  return results
}

export function getAvailableScrapers(): string[] {
  return Object.keys(scrapers)
}
