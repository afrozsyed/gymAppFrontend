import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const gymNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/members', label: 'Members', icon: '👥' },
  { to: '/plans', label: 'Plans', icon: '📋' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

const adminNavItems = [
  { to: '/admin', label: 'Gym Management', icon: '🏢' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const { name, gymName, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const navItems = role === 'SUPER_ADMIN' ? adminNavItems : gymNavItems

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-60 md:flex md:shrink-0
      `}
    >
      {/* Header */}
      <div className="px-5 py-5 border-b border-gray-700/60 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xl font-bold text-blue-400 truncate">
            💪 {role === 'SUPER_ADMIN' ? 'GymCRM Admin' : (gymName || 'GymCRM')}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{name}</div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden ml-2 p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors shrink-0"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-gray-700/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span className="text-base">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
