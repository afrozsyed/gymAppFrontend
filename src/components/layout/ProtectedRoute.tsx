import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (role !== 'SUPER_ADMIN') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export function GymRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />
  return <>{children}</>
}
