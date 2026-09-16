import { Navigate, Outlet } from 'react-router-dom'
import { FullPageError } from '../components/FullPageLoader.jsx'
import FullPageLoader from '../components/FullPageLoader.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function GuestRoute() {
  const { status, authError, retryBootstrap } = useAuth()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'error') return <FullPageError message={authError} onRetry={retryBootstrap} />
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />
  if (status === 'forbidden') return <Navigate to="/forbidden" replace />
  return <Outlet />
}
