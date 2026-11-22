import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import { ProtectedRoute, SetupRequiredRoute, OnboardingRoute } from './routes/ProtectedRoute'
import Onboarding from './pages/Onboarding'

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><SetupRequiredRoute><PageLayout /></SetupRequiredRoute></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'budgets', element: <Budgets /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  { path: '/onboarding', element: <ProtectedRoute><OnboardingRoute><Onboarding /></OnboardingRoute></ProtectedRoute> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
])

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}