import { Router } from 'express'
import { jobsDb } from '../db/index.js'
import { searchJobs, getAvailableScrapers } from '../scrapers/index.js'

const router = Router()

router.get('/search', async (req, res) => {
  try {
    const { query, location = '', sources } = req.query

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    const sourceList = typeof sources === 'string'
      ? sources.split(',').filter(s => s.trim())
      : getAvailableScrapers()

    console.log(`Searching for "${query}" in "${location}" from sources: ${sourceList.join(', ')}`)

    const scrapedJobs = await searchJobs(sourceList, {
      query,
      location: location as string,
      maxResults: 20
    })

    if (scrapedJobs.length === 0) {
      return res.json([])
    }

    const savedJobs = jobsDb.insertMany(scrapedJobs)
    res.json(savedJobs)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Failed to search jobs' })
  }
})

router.get('/', (_req, res) => {
  try {
    const jobs = jobsDb.getAll()
    res.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const job = jobsDb.getById(id)

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    res.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    res.status(500).json({ error: 'Failed to fetch job' })
  }
})

export default router
