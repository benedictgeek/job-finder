import { Router } from 'express'
import { applicationsDb, jobsDb } from '../db/index.js'

const router = Router()

router.get('/', (_req, res) => {
  try {
    const applications = applicationsDb.getAll()
    res.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    res.status(500).json({ error: 'Failed to fetch applications' })
  }
})

router.post('/', (req, res) => {
  try {
    const { job_id } = req.body

    if (!job_id || typeof job_id !== 'number') {
      return res.status(400).json({ error: 'job_id is required and must be a number' })
    }

    const job = jobsDb.getById(job_id)
    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    const application = applicationsDb.create(job_id)
    res.status(201).json(application)
  } catch (error) {
    console.error('Error creating application:', error)
    res.status(500).json({ error: 'Failed to create application' })
  }
})

router.patch('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { status, notes, applied_date } = req.body

    const validStatuses = ['saved', 'applied', 'interviewing', 'offered', 'rejected']
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
    }

    const updated = applicationsDb.update(id, { status, notes, applied_date })

    if (!updated) {
      return res.status(404).json({ error: 'Application not found' })
    }

    res.json(updated)
  } catch (error) {
    console.error('Error updating application:', error)
    res.status(500).json({ error: 'Failed to update application' })
  }
})

router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const deleted = applicationsDb.delete(id)

    if (!deleted) {
      return res.status(404).json({ error: 'Application not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting application:', error)
    res.status(500).json({ error: 'Failed to delete application' })
  }
})

export default router
