import { Navigate, Outlet } from 'react-router-dom'
import FullPageLoader from '../components/FullPageLoader.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function GuestRoute() {
  const { status } = useAuth()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />
  if (status === 'forbidden') return <Navigate to="/forbidden" replace />
  return <Outlet />
}
