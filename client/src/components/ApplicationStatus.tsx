import type { ApplicationStatus as Status } from '../types'

interface ApplicationStatusProps {
  status: Status
  onChange: (status: Status) => void
}

const statusConfig: Record<Status, { label: string; color: string }> = {
  saved: { label: 'Saved', color: 'bg-gray-100 text-gray-700' },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  interviewing: { label: 'Interviewing', color: 'bg-yellow-100 text-yellow-700' },
  offered: { label: 'Offered', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' }
}

const allStatuses: Status[] = ['saved', 'applied', 'interviewing', 'offered', 'rejected']

function ApplicationStatus({ status, onChange }: ApplicationStatusProps) {
  return (
    <select
      value={status}
      onChange={e => onChange(e.target.value as Status)}
      className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${statusConfig[status].color}`}
    >
      {allStatuses.map(s => (
        <option key={s} value={s}>
          {statusConfig[s].label}
        </option>
      ))}
    </select>
  )
}

export default ApplicationStatus
