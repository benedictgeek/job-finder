import { useState } from 'react'
import Home from './pages/Home'

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'applications'>('search')

  return (
    <div className="min-h-screen">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Job Finder Management</h1>
          <p className="text-blue-100 text-sm">Track your job search and applications</p>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Job Search
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'applications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Applications
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Home activeTab={activeTab} />
      </main>
    </div>
  )
}

export default App
