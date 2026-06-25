import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import PageLoader from '../common/PageLoader'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageLoader label="Vérification de la session..." />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        to="/admin/login"
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute
