import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMembers, useDeleteMember } from '../../hooks/useMembers'
import toast from 'react-hot-toast'
import Pagination from '../common/Pagination'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBanner from '../common/ErrorBanner'
import RecordPaymentModal from './RecordPaymentModal'
import type { Member } from '../../types/member.types'
import { openWhatsApp } from '../../utils/whatsapp'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const handleRemind = (m: Member) => {
  if (!m.phone) {
    toast.error(`No phone number saved for ${m.name}`)
    return
  }
  openWhatsApp(m.phone, m.name, m.expiryDate, m.status)
}

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
                          onClick={() => handleRemind(m)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebe5d] transition-colors"
                        >
                          <WhatsAppIcon />
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
                    onClick={() => handleRemind(m)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-[#25D366] text-white rounded-xl hover:bg-[#1ebe5d] transition-colors"
                  >
                    <WhatsAppIcon />
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
