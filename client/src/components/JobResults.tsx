import type { Job } from '../types'

interface JobResultsProps {
  jobs: Job[]
  isLoading: boolean
  onSaveJob: (job: Job) => void
}

function JobResults({ jobs, isLoading, onSaveJob }: JobResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Searching for jobs...</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p>No jobs found. Try a different search query.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
      </h2>

      <div className="grid gap-4">
        {jobs.map(job => (
          <div
            key={job.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-600">
                  {job.url ? (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {job.title}
                    </a>
                  ) : (
                    job.title
                  )}
                </h3>
                <p className="text-gray-800 font-medium">{job.company}</p>
                {job.location && (
                  <p className="text-gray-600 text-sm">{job.location}</p>
                )}
                {job.salary && (
                  <p className="text-green-600 text-sm font-medium mt-1">{job.salary}</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600 capitalize">
                  {job.source}
                </span>
                <button
                  onClick={() => onSaveJob(job)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Save Job
                </button>
              </div>
            </div>

            {job.description && (
              <div className="mt-4 text-gray-600 text-sm line-clamp-3">
                {job.description}
              </div>
            )}

            {job.posted_date && (
              <p className="mt-2 text-gray-400 text-xs">
                Posted: {new Date(job.posted_date).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobResults
