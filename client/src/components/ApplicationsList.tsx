import { useState } from 'react'
import type { Application, ApplicationStatus as Status } from '../types'
import ApplicationStatus from './ApplicationStatus'

interface ApplicationsListProps {
  applications: Application[]
  isLoading: boolean
  onUpdate: (id: number, data: Partial<Application>) => void
  onDelete: (id: number) => void
}

function ApplicationsList({ applications, isLoading, onUpdate, onDelete }: ApplicationsListProps) {
  const [editingNotes, setEditingNotes] = useState<number | null>(null)
  const [notesText, setNotesText] = useState('')

  const handleStatusChange = (id: number, status: Status) => {
    const data: Partial<Application> = { status }
    if (status === 'applied') {
      data.applied_date = new Date().toISOString()
    }
    onUpdate(id, data)
  }

  const handleSaveNotes = (id: number) => {
    onUpdate(id, { notes: notesText })
    setEditingNotes(null)
  }

  const startEditingNotes = (app: Application) => {
    setEditingNotes(app.id)
    setNotesText(app.notes || '')
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading applications...</p>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p>No applications yet. Start by searching for jobs and saving them!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        My Applications ({applications.length})
      </h2>

      <div className="grid gap-4">
        {applications.map(app => (
          <div
            key={app.id}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-600">
                  {app.job?.url ? (
                    <a href={app.job.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {app.job?.title || 'Unknown Position'}
                    </a>
                  ) : (
                    app.job?.title || 'Unknown Position'
                  )}
                </h3>
                <p className="text-gray-800 font-medium">{app.job?.company || 'Unknown Company'}</p>
                {app.job?.location && (
                  <p className="text-gray-600 text-sm">{app.job.location}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <ApplicationStatus
                  status={app.status}
                  onChange={(status) => handleStatusChange(app.id, status)}
                />
                <button
                  onClick={() => onDelete(app.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete application"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {app.applied_date && (
              <p className="text-sm text-gray-500 mt-2">
                Applied: {new Date(app.applied_date).toLocaleDateString()}
              </p>
            )}

            <div className="mt-4">
              {editingNotes === app.id ? (
                <div className="space-y-2">
                  <textarea
                    value={notesText}
                    onChange={e => setNotesText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Add notes about this application..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveNotes(app.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNotes(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => startEditingNotes(app)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {app.notes ? (
                    <span className="text-gray-600">{app.notes}</span>
                  ) : (
                    <span className="italic">+ Add notes</span>
                  )}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Added: {new Date(app.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApplicationsList
