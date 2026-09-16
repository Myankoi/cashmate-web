import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullPageError } from '../components/FullPageLoader.jsx'
import FullPageLoader from '../components/FullPageLoader.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function OwnerRoute() {
  const { status, authError, retryBootstrap } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'error') return <FullPageError message={authError} onRetry={retryBootstrap} />
  if (status === 'forbidden') return <Navigate to="/forbidden" replace />
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
