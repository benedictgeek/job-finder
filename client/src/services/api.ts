import type { Job, Application, ApplicationStatus, SearchParams } from '../types'

const API_BASE = '/api'

export async function searchJobs(params: SearchParams): Promise<Job[]> {
  const searchParams = new URLSearchParams({
    query: params.query,
    location: params.location,
    sources: params.sources.join(',')
  })

  const response = await fetch(`${API_BASE}/jobs/search?${searchParams}`)
  if (!response.ok) {
    throw new Error('Failed to search jobs')
  }
  return response.json()
}

export async function getJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE}/jobs`)
  if (!response.ok) {
    throw new Error('Failed to fetch jobs')
  }
  return response.json()
}

export async function getApplications(): Promise<Application[]> {
  const response = await fetch(`${API_BASE}/applications`)
  if (!response.ok) {
    throw new Error('Failed to fetch applications')
  }
  return response.json()
}

export async function createApplication(jobId: number): Promise<Application> {
  const response = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId })
  })
  if (!response.ok) {
    throw new Error('Failed to create application')
  }
  return response.json()
}

export async function updateApplication(
  id: number,
  data: { status?: ApplicationStatus; notes?: string | null; applied_date?: string | null }
): Promise<Application> {
  const response = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error('Failed to update application')
  }
  return response.json()
}

export async function deleteApplication(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Failed to delete application')
  }
}
