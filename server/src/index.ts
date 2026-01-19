import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import jobsRouter from './routes/jobs.js'
import applicationsRouter from './routes/applications.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3038

app.use(cors())
app.use(express.json())

app.use('/api/jobs', jobsRouter)
app.use('/api/applications', applicationsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../../client/dist')
  app.use(express.static(clientBuild))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('Available endpoints:')
  console.log('  GET  /api/health')
  console.log('  GET  /api/jobs/search?query=...&location=...&sources=...')
  console.log('  GET  /api/jobs')
  console.log('  GET  /api/jobs/:id')
  console.log('  GET  /api/applications')
  console.log('  POST /api/applications')
  console.log('  PATCH /api/applications/:id')
  console.log('  DELETE /api/applications/:id')
})
