import { Link } from 'react-router-dom'

export default function Transactions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg text-headline-lg text-on-surface font-semibold">Transactions</h1>
          <p className="body-md text-body-md text-secondary">
            Track, organize, and understand where your money goes across accounts.
          </p>
        </div>
        <Link to="/dashboard" className="btn-primary">
          <span className="mr-2">←</span> Back to Dashboard
        </Link>
      </div>

      <div className="bg-surface-container-lowest border border-outline/30 rounded-xl shadow-card p-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl mb-4">📋</span>
          <h2 className="headline-md text-headline-md text-on-surface font-semibold mb-2">Transactions</h2>
          <p className="body-md text-body-md text-secondary">
            Full transaction management with filters, pagination, and bulk actions coming in Milestone 2.
          </p>
        </div>
      </div>
    </div>
  )
}