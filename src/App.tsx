import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import AppLayout from './components/layout/AppLayout'
import ProtectedRoute, { SuperAdminRoute, GymRoute } from './components/layout/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MembersPage from './pages/MembersPage'
import MemberFormPage from './pages/MemberFormPage'
import PlansPage from './pages/PlansPage'
import ProfilePage from './pages/ProfilePage'
import SuperAdminPage from './pages/SuperAdminPage'
import ReportsPage from './pages/ReportsPage'
import StaffPage from './pages/StaffPage'
import StaffFormPage from './pages/StaffFormPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* All authenticated routes share AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Super Admin only */}
            <Route
              path="/admin"
              element={
                <SuperAdminRoute>
                  <SuperAdminPage />
                </SuperAdminRoute>
              }
            />

            {/* Gym users only (ADMIN / STAFF) */}
            <Route path="/dashboard" element={<GymRoute><DashboardPage /></GymRoute>} />
            <Route path="/members" element={<GymRoute><MembersPage /></GymRoute>} />
            <Route path="/members/new" element={<GymRoute><MemberFormPage /></GymRoute>} />
            <Route path="/members/:id/edit" element={<GymRoute><MemberFormPage /></GymRoute>} />
            <Route path="/plans" element={<GymRoute><PlansPage /></GymRoute>} />
            <Route path="/reports" element={<GymRoute><ReportsPage /></GymRoute>} />
            <Route path="/staff" element={<GymRoute><StaffPage /></GymRoute>} />
            <Route path="/staff/new" element={<GymRoute><StaffFormPage /></GymRoute>} />
            <Route path="/staff/:id/edit" element={<GymRoute><StaffFormPage /></GymRoute>} />

            {/* Available to all authenticated roles */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px' },
        }}
      />
    </QueryClientProvider>
  )
}
