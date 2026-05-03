import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMembers, useDeleteMember, useSendReminder } from '../../hooks/useMembers'
import Pagination from '../common/Pagination'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBanner from '../common/ErrorBanner'
import RecordPaymentModal from './RecordPaymentModal'
import type { Member } from '../../types/member.types'

const statusBadge: Record<string, string> = {
  ACTIVE:         'bg-green-100 text-green-700',
  EXPIRED:        'bg-red-100 text-red-700',
  EXPIRING_TODAY: 'bg-yellow-100 text-yellow-700',
}

const paymentBadge = (s: string) =>
  s === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'

export default function MemberList() {
  const [page, setPage] = useState(0)
  const [renewingMember, setRenewingMember] = useState<Member | null>(null)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useMembers(page)
  const deleteMember = useDeleteMember()
  const sendReminder = useSendReminder()

  if (isLoading) return <div className="py-16"><LoadingSpinner /></div>
  if (isError) return <ErrorBanner />

  const { content = [], totalPages = 0, totalElements = 0 } = data ?? {}

  return (
    <div>
      {renewingMember && (
        <RecordPaymentModal
          member={renewingMember}
          onClose={() => setRenewingMember(null)}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{totalElements} members</p>
        <button
          onClick={() => navigate('/members/new')}
          className="px-3 py-2 sm:px-4 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          + Add Member
        </button>
      </div>

      {content.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">👥</div>
          <p className="font-medium text-gray-500">No members yet</p>
          <p className="text-sm mt-1">Add your first member to get started.</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Expiry</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {content.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 font-semibold text-gray-900">{m.name}</td>
                    <td className="py-3 text-gray-500">{m.phone || '—'}</td>
                    <td className="py-3 text-gray-600">{m.plan.name}</td>
                    <td className="py-3 text-gray-500">{m.joinDate}</td>
                    <td className="py-3 text-gray-600">{m.expiryDate}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[m.status] || ''}`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentBadge(m.paymentStatus)}`}>
                        {m.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/members/${m.id}/edit`)}
                          className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setRenewingMember(m)}
                          className="text-xs px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Renew
                        </button>
                        <button
                          onClick={() => sendReminder.mutate(m.id)}
                          disabled={sendReminder.isPending}
                          className="text-xs px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                        >
                          Remind
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete ${m.name}?`)) deleteMember.mutate(m.id) }}
                          className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
          <div className="md:hidden space-y-3">
            {content.map((m) => (
              <div key={m.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
                {/* Name + status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.phone || 'No phone'}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[m.status] || ''}`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-gray-400 mb-0.5">Plan</p>
                    <p className="font-semibold text-gray-700">{m.plan.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-gray-400 mb-0.5">Joined</p>
                    <p className="font-semibold text-gray-700">{m.joinDate}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-gray-400 mb-0.5">Expires</p>
                    <p className="font-semibold text-gray-700">{m.expiryDate}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentBadge(m.paymentStatus)}`}>
                      {m.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Actions — 4 buttons in 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/members/${m.id}/edit`)}
                    className="py-2 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setRenewingMember(m)}
                    className="py-2 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    Renew
                  </button>
                  <button
                    onClick={() => sendReminder.mutate(m.id)}
                    disabled={sendReminder.isPending}
                    className="py-2 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 disabled:opacity-50 transition-colors"
                  >
                    Remind
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete ${m.name}?`)) deleteMember.mutate(m.id) }}
                    className="py-2 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
