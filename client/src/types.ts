export interface Job {
  id: number
  title: string
  company: string
  location: string | null
  description: string | null
  url: string | null
  source: string | null
  salary: string | null
  posted_date: string | null
  scraped_at: string
  is_valid: boolean
}

export interface Application {
  id: number
  job_id: number
  status: ApplicationStatus
  applied_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  job?: Job
}

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected'

export type JobSource = 'linkedin' | 'indeed' | 'glassdoor'

export interface SearchParams {
  query: string
  location: string
  sources: JobSource[]
}
