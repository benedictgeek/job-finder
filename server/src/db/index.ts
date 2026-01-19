import Database, { type Database as DatabaseType } from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeDatabase } from './schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../../data/jobs.db')

const db: DatabaseType = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

initializeDatabase(db)

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
  is_valid: number
}

export interface Application {
  id: number
  job_id: number
  status: string
  applied_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export const jobsDb = {
  getAll(): Job[] {
    return db.prepare('SELECT * FROM jobs WHERE is_valid = 1 ORDER BY scraped_at DESC').all() as Job[]
  },

  getById(id: number): Job | undefined {
    return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job | undefined
  },

  insert(job: Omit<Job, 'id' | 'scraped_at' | 'is_valid'>): Job {
    const stmt = db.prepare(`
      INSERT INTO jobs (title, company, location, description, url, source, salary, posted_date)
      VALUES (@title, @company, @location, @description, @url, @source, @salary, @posted_date)
      ON CONFLICT(url) DO UPDATE SET
        title = excluded.title,
        company = excluded.company,
        location = excluded.location,
        description = excluded.description,
        salary = excluded.salary,
        posted_date = excluded.posted_date,
        scraped_at = CURRENT_TIMESTAMP
      RETURNING *
    `)
    return stmt.get(job) as Job
  },

  insertMany(jobs: Omit<Job, 'id' | 'scraped_at' | 'is_valid'>[]): Job[] {
    const insertedJobs: Job[] = []
    const insert = db.transaction((jobs: Omit<Job, 'id' | 'scraped_at' | 'is_valid'>[]) => {
      for (const job of jobs) {
        const inserted = this.insert(job)
        insertedJobs.push(inserted)
      }
    })
    insert(jobs)
    return insertedJobs
  }
}

export const applicationsDb = {
  getAll(): (Application & { job?: Job })[] {
    const applications = db.prepare(`
      SELECT a.*, j.title, j.company, j.location, j.url, j.source, j.salary
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      ORDER BY a.updated_at DESC
    `).all() as (Application & Job)[]

    return applications.map(row => ({
      id: row.id,
      job_id: row.job_id,
      status: row.status,
      applied_date: row.applied_date,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      job: row.title ? {
        id: row.job_id,
        title: row.title,
        company: row.company,
        location: row.location,
        url: row.url,
        source: row.source,
        salary: row.salary
      } as unknown as Job : undefined
    }))
  },

  getById(id: number): Application | undefined {
    return db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as Application | undefined
  },

  create(jobId: number): Application {
    const stmt = db.prepare(`
      INSERT INTO applications (job_id) VALUES (?)
      RETURNING *
    `)
    return stmt.get(jobId) as Application
  },

  update(id: number, data: { status?: string; notes?: string; applied_date?: string }): Application | undefined {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const values: (string | number)[] = []

    if (data.status !== undefined) {
      fields.push('status = ?')
      values.push(data.status)
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?')
      values.push(data.notes)
    }
    if (data.applied_date !== undefined) {
      fields.push('applied_date = ?')
      values.push(data.applied_date)
    }

    values.push(id)

    const stmt = db.prepare(`
      UPDATE applications SET ${fields.join(', ')}
      WHERE id = ?
      RETURNING *
    `)
    return stmt.get(...values) as Application | undefined
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM applications WHERE id = ?').run(id)
    return result.changes > 0
  }
}

export default db
