import { useSendReminder } from '../../hooks/useMembers'
import type { Member } from '../../types/member.types'

const statusBadge: Record<string, string> = {
  ACTIVE:         'bg-green-100 text-green-700',
  EXPIRED:        'bg-red-100 text-red-700',
  EXPIRING_TODAY: 'bg-yellow-100 text-yellow-700',
}

const paymentBadge = (s: string) =>
  s === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'

interface Props {
  members: Member[]
}

export default function MemberTable({ members }: Props) {
  const sendReminder = useSendReminder()

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-3xl mb-2">✅</div>
        <p className="text-sm">No members require attention right now.</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Phone</th>
              <th className="pb-3 font-medium">Plan</th>
              <th className="pb-3 font-medium">Expiry</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Payment</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 font-semibold text-gray-900">{m.name}</td>
                <td className="py-3 text-gray-500">{m.phone || '—'}</td>
                <td className="py-3 text-gray-600">{m.plan.name}</td>
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
                  <button
                    onClick={() => sendReminder.mutate(m.id)}
                    disabled={sendReminder.isPending}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                  >
                    Remind
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-3">
        {members.map((m) => (
          <div key={m.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.phone || 'No phone'}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[m.status] || ''}`}>
                {m.status.replace('_', ' ')}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                <p className="text-gray-400 mb-0.5">Plan</p>
                <p className="font-medium text-gray-700">{m.plan.name}</p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                <p className="text-gray-400 mb-0.5">Expires</p>
                <p className="font-medium text-gray-700">{m.expiryDate}</p>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentBadge(m.paymentStatus)}`}>
                {m.paymentStatus}
              </span>
              <button
                onClick={() => sendReminder.mutate(m.id)}
                disabled={sendReminder.isPending}
                className="text-xs px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
              >
                Send Reminder
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
