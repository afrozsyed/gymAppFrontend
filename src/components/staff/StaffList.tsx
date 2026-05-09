import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaff, useDeleteStaff } from '../../hooks/useStaff'
import type { Staff, StaffStatus, StaffRole } from '../../types/staff.types'
import Pagination from '../common/Pagination'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBanner from '../common/ErrorBanner'
import AttendanceModal from './AttendanceModal'

const STATUS_COLORS: Record<StaffStatus, string> = {
  ACTIVE:    'bg-green-100 text-green-700',
  INACTIVE:  'bg-gray-100  text-gray-600',
  ON_LEAVE:  'bg-yellow-100 text-yellow-700',
}

const STATUS_LABELS: Record<StaffStatus, string> = {
  ACTIVE:   'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On Leave',
}

const ROLE_LABELS: Record<StaffRole, string> = {
  TRAINER:      'Trainer',
  RECEPTIONIST: 'Receptionist',
  MANAGER:      'Manager',
  CLEANER:      'Cleaner',
  OTHER:        'Other',
}

const inputCls  = 'bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
const selectCls = inputCls + ' cursor-pointer'

export default function StaffList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const [nameInput,   setNameInput]   = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [attendanceStaff, setAttendanceStaff] = useState<Staff | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedName(nameInput)
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [nameInput])

  const handleRoleChange = useCallback((v: string) => {
    setRoleFilter(v)
    setPage(0)
  }, [])

  const handleStatusChange = useCallback((v: string) => {
    setStatusFilter(v)
    setPage(0)
  }, [])

  const filters = {
    name:   debouncedName || undefined,
    role:   roleFilter    || undefined,
    status: statusFilter  || undefined,
  }

  const hasFilters = !!(debouncedName || roleFilter || statusFilter)

  const { data, isLoading, isError } = useStaff(page, 20, filters)
  const deleteStaff = useDeleteStaff()

  const clearFilters = () => {
    setNameInput('')
    setRoleFilter('')
    setStatusFilter('')
    setPage(0)
  }

  const handleDelete = (staff: Staff) => {
    if (window.confirm(`Delete ${staff.name}? This cannot be undone.`)) {
      deleteStaff.mutate(staff.id)
    }
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-36">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Search by name..."
            className={inputCls + ' pl-8 w-full'}
          />
        </div>

        <select value={roleFilter} onChange={(e) => handleRoleChange(e.target.value)} className={selectCls}>
          <option value="">All Roles</option>
          <option value="TRAINER">Trainer</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="MANAGER">Manager</option>
          <option value="CLEANER">Cleaner</option>
          <option value="OTHER">Other</option>
        </select>

        <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)} className={selectCls}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>

        {hasFilters && (
          <button onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Clear
          </button>
        )}

        <button
          onClick={() => navigate('/staff/new')}
          className="ml-auto px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap"
        >
          + Add Staff
        </button>
      </div>

      {/* Count */}
      {data && (
        <p className="text-xs text-gray-500 mb-3">
          {hasFilters
            ? `${data.totalElements} result${data.totalElements !== 1 ? 's' : ''} found`
            : `${data.totalElements} staff member${data.totalElements !== 1 ? 's' : ''}`}
        </p>
      )}

      {isLoading && <div className="py-10 flex justify-center"><LoadingSpinner /></div>}
      {isError   && <ErrorBanner message="Failed to load staff members" />}

      {!isLoading && !isError && data && (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Phone', 'Email', 'Role', 'Join Date', 'Salary (₹)', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.content.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-900">{s.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{s.phone ?? '—'}</td>
                    <td className="py-3 pr-4 text-gray-600 max-w-[180px] truncate">{s.email ?? '—'}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                        {ROLE_LABELS[s.role]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{s.joinDate}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {s.salary != null ? `₹${Number(s.salary).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[s.status]}`}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/staff/${s.id}/edit`)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setAttendanceStaff(s)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors">
                          Attendance
                        </button>
                        <button onClick={() => handleDelete(s)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {data.content.map((s) => (
              <div key={s.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.phone ?? s.email ?? '—'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
                  <span><span className="text-gray-400">Role:</span> {ROLE_LABELS[s.role]}</span>
                  <span><span className="text-gray-400">Joined:</span> {s.joinDate}</span>
                  {s.salary != null && (
                    <span><span className="text-gray-400">Salary:</span> ₹{Number(s.salary).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/staff/${s.id}/edit`)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors text-center">
                    Edit
                  </button>
                  <button onClick={() => setAttendanceStaff(s)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors text-center">
                    Attendance
                  </button>
                  <button onClick={() => handleDelete(s)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors text-center">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.content.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">👨‍💼</p>
              <p className="font-medium">
                {hasFilters ? 'No staff match your filters' : 'No staff members yet'}
              </p>
              {!hasFilters && (
                <p className="text-sm mt-1">Click "+ Add Staff" to get started</p>
              )}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                page={data.number}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {attendanceStaff && (
        <AttendanceModal
          staff={attendanceStaff}
          onClose={() => setAttendanceStaff(null)}
        />
      )}
    </>
  )
}
