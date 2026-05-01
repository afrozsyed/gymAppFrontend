import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import StatCard from '../components/dashboard/StatCard'
import MemberTable from '../components/dashboard/MemberTable'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorBanner from '../components/common/ErrorBanner'

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard()
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Your gym at a glance</p>
        </div>
        <button
          onClick={() => navigate('/members/new')}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          + Add Member
        </button>
      </div>

      {isLoading && <div className="py-16"><LoadingSpinner /></div>}
      {isError && <ErrorBanner />}

      {data && (
        <>
          {/* Stat cards — 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
            <StatCard label="Expired Members"      value={data.expiredCount}                                   icon="🔴" color="red"    />
            <StatCard label="Expiring Today"       value={data.expiringToday}                                  icon="🟡" color="yellow" />
            <StatCard label="Pending Payments (₹)" value={data.pendingPayments.toLocaleString('en-IN')}        icon="💰" color="blue"   />
            <StatCard label="Total Members"        value={data.totalMembers}                                   icon="👥" color="green"  />
          </div>

          {/* Alert members */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">Members Needing Attention</h2>
              <button
                onClick={() => navigate('/members')}
                className="text-xs sm:text-sm text-blue-600 hover:underline font-medium"
              >
                View all →
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <MemberTable members={data.alertMembers} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
