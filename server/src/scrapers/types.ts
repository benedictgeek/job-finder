export interface ScrapedJob {
  title: string
  company: string
  location: string | null
  description: string | null
  url: string | null
  source: string
  salary: string | null
  posted_date: string | null
}

export interface SearchOptions {
  query: string
  location: string
  maxResults?: number
}

export interface Scraper {
  name: string
  search(options: SearchOptions): Promise<ScrapedJob[]>
}
