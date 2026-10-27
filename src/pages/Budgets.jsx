import { Link } from 'react-router-dom'

export default function Budgets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg text-headline-lg text-on-surface font-semibold">Budgets</h1>
          <p className="body-md text-body-md text-secondary">
            Set monthly budgets per category and track your spending against limits.
          </p>
        </div>
        <Link to="/dashboard" className="btn-primary">
          <span className="mr-2">←</span> Back to Dashboard
        </Link>
      </div>

      <div className="bg-surface-container-lowest border border-outline/30 rounded-xl shadow-card p-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl mb-4">🎯</span>
          <h2 className="headline-md text-headline-md text-on-surface font-semibold mb-2">Budgets</h2>
          <p className="body-md text-body-md text-secondary">
            Monthly budget tracking with progress indicators and over-budget alerts coming in Milestone 2.
          </p>
        </div>
      </div>
    </div>
  )
}