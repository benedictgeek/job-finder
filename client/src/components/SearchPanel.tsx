import { useState } from 'react'
import type { SearchParams, JobSource } from '../types'

interface SearchPanelProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

function SearchPanel({ onSearch, isLoading }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [sources, setSources] = useState<JobSource[]>(['indeed'])

  const handleSourceToggle = (source: JobSource) => {
    setSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || sources.length === 0) return
    onSearch({ query, location, sources })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Search Jobs</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title / Keywords
            </label>
            <input
              id="query"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g., Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA or Remote"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Sources
          </label>
          <div className="flex flex-wrap gap-3">
            {(['linkedin', 'indeed', 'glassdoor'] as JobSource[]).map(source => (
              <label
                key={source}
                className={`inline-flex items-center px-4 py-2 rounded-full cursor-pointer transition-colors ${
                  sources.includes(source)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={sources.includes(source)}
                  onChange={() => handleSourceToggle(source)}
                  className="sr-only"
                />
                <span className="capitalize">{source}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim() || sources.length === 0}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search Jobs'}
        </button>
      </form>
    </div>
  )
}

export default SearchPanel
