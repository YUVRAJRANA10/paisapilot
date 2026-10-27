import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import { ProtectedRoute } from './routes/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'budgets', element: <Budgets /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
])

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}