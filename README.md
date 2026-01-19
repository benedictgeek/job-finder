# Job Finder Management

A full-stack job application tracking app with web scraping capabilities. Search for jobs across multiple platforms and track your applications in one place.

## Features

- **Job Search**: Search for jobs across LinkedIn, Indeed, and Glassdoor
- **Application Tracking**: Save jobs and track application status (saved, applied, interviewing, offered, rejected)
- **Notes**: Add notes to each application
- **Persistent Storage**: All data stored in SQLite database

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with better-sqlite3
- **Scraping**: Puppeteer (LinkedIn, Glassdoor) + Cheerio (Indeed)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

Start both client and server:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:server  # Backend on http://localhost:3038
npm run dev:client  # Frontend on http://localhost:3037
```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/search` | Search/scrape jobs from selected sources |
| GET | `/api/jobs` | Get all saved jobs |
| GET | `/api/jobs/:id` | Get a specific job |
| GET | `/api/applications` | Get all applications |
| POST | `/api/applications` | Create a new application |
| PATCH | `/api/applications/:id` | Update application status/notes |
| DELETE | `/api/applications/:id` | Delete an application |

### Search Parameters

```
GET /api/jobs/search?query=software+engineer&location=remote&sources=indeed,linkedin,glassdoor
```

- `query` (required): Job title or keywords
- `location`: Location filter
- `sources`: Comma-separated list of sources (indeed, linkedin, glassdoor)

## Project Structure

```
job-finder-management/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI components
│       ├── pages/          # Page components
│       ├── services/       # API client
│       └── types.ts        # TypeScript types
├── server/                 # Express backend
│   └── src/
│       ├── db/             # SQLite database
│       ├── routes/         # API routes
│       └── scrapers/       # Web scrapers
└── package.json            # Monorepo config
```

## Notes on Web Scraping

- Job sites frequently update their HTML structure, so scrapers may need periodic updates
- Rate limiting is applied to avoid being blocked
- LinkedIn and Glassdoor use Puppeteer for JavaScript-rendered content
- Indeed uses Cheerio for faster static HTML parsing

## License

MIT
