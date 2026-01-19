import { useState, useEffect } from 'react'
import SearchPanel from '../components/SearchPanel'
import JobResults from '../components/JobResults'
import ApplicationsList from '../components/ApplicationsList'
import type { Job, Application, SearchParams } from '../types'
import * as api from '../services/api'

interface HomeProps {
  activeTab: 'search' | 'applications'
}

function Home({ activeTab }: HomeProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications()
    }
  }, [activeTab])

  async function loadApplications() {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.getApplications()
      setApplications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSearch(params: SearchParams) {
    try {
      setIsLoading(true)
      setError(null)
      const results = await api.searchJobs(params)
      setJobs(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveJob(job: Job) {
    try {
      await api.createApplication(job.id)
      await loadApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job')
    }
  }

  async function handleUpdateApplication(id: number, data: Partial<Application>) {
    try {
      await api.updateApplication(id, data)
      await loadApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application')
    }
  }

  async function handleDeleteApplication(id: number) {
    try {
      await api.deleteApplication(id)
      await loadApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application')
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-6">
          <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
          <JobResults
            jobs={jobs}
            isLoading={isLoading}
            onSaveJob={handleSaveJob}
          />
        </div>
      )}

      {activeTab === 'applications' && (
        <ApplicationsList
          applications={applications}
          isLoading={isLoading}
          onUpdate={handleUpdateApplication}
          onDelete={handleDeleteApplication}
        />
      )}
    </div>
  )
}

export default Home
