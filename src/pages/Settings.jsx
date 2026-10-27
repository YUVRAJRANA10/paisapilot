import { Link } from 'react-router-dom'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg text-headline-lg text-on-surface font-semibold">Settings</h1>
          <p className="body-md text-body-md text-secondary">
            Manage your account preferences and demo data.
          </p>
        </div>
        <Link to="/dashboard" className="btn-primary">
          <span className="mr-2">←</span> Back to Dashboard
        </Link>
      </div>

      <div className="bg-surface-container-lowest border border-outline/30 rounded-xl shadow-card p-6 max-w-md">
        <h2 className="headline-md text-headline-md text-on-surface font-semibold mb-6">Preferences</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <div>
              <p className="text-label-sm text-label-sm text-on-surface font-medium">Demo Mode</p>
              <p className="text-xs text-on-surface-variant">Using demonstration data. Reset to start fresh.</p>
            </div>
            <button className="px-4 py-2 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-low transition-colors">
              Reset Data
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <div>
              <p className="text-label-sm text-label-sm text-on-surface font-medium">Currency</p>
              <p className="text-xs text-on-surface-variant">Indian Rupee (₹)</p>
            </div>
            <select className="bg-transparent border-none text-on-surface text-sm font-medium focus:outline-none">
              <option>INR</option>
              <option>USD</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <div>
              <p className="text-label-sm text-label-sm text-on-surface font-medium">Timezone</p>
              <p className="text-xs text-on-surface-variant">Asia/Kolkata</p>
            </div>
            <select className="bg-transparent border-none text-on-surface text-sm font-medium focus:outline-none">
              <option>Asia/Kolkata</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}