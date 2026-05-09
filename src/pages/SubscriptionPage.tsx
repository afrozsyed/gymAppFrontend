import { useCurrentSubscription, useSubscriptionPlans } from '../hooks/useSubscription'
import type { SubscriptionPlan } from '../types/subscription.types'

function fmt(amount: number) {
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })
}

function limitLabel(n: number) {
  return n === -1 ? 'Unlimited' : String(n)
}

function UsageBar({ current, limit, label }: { current: number; limit: number; label: string }) {
  if (limit === -1) {
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{label}</span>
          <span>{current} / Unlimited</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full">
          <div className="h-2 bg-green-400 rounded-full w-full opacity-30" />
        </div>
      </div>
    )
  }
  const pct = limit > 0 ? Math.min((current / limit) * 100, 100) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-green-500'
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{current} / {limit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {included
        ? <span className="text-green-500 font-bold">✓</span>
        : <span className="text-gray-300 font-bold">✗</span>}
      <span className={included ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
    </li>
  )
}

function PlanCard({ plan, isCurrent }: { plan: SubscriptionPlan; isCurrent: boolean }) {
  const borderCls = isCurrent
    ? 'border-2 border-blue-500 shadow-lg shadow-blue-100'
    : 'border border-gray-100 shadow-sm'

  return (
    <div className={`bg-white rounded-2xl p-6 flex flex-col relative ${borderCls}`}>
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{plan.displayName}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{plan.description}</p>
        <div className="mt-3">
          <span className="text-3xl font-bold text-gray-900">{fmt(plan.price)}</span>
          <span className="text-sm text-gray-400">/month</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Members</span>
          <span className="font-semibold">{limitLabel(plan.memberLimit)}</span>
        </div>
        <div className="flex justify-between">
          <span>Staff</span>
          <span className="font-semibold">{limitLabel(plan.staffLimit)}</span>
        </div>
      </div>

      <ul className="space-y-2 flex-1">
        <FeatureRow label="Dashboard & Members" included={true} />
        <FeatureRow label="Plans & Payments" included={true} />
        <FeatureRow label="Monthly Reports" included={true} />
        <FeatureRow label="Yearly Reports" included={plan.featureReportsYearly} />
        <FeatureRow label="Custom Date Reports" included={plan.featureReportsCustom} />
        <FeatureRow label="Staff Management" included={plan.featureStaff} />
        <FeatureRow label="Staff Attendance" included={plan.featureAttendance} />
        <FeatureRow label="WhatsApp Reminders" included={plan.featureReminders} />
      </ul>
    </div>
  )
}

export default function SubscriptionPage() {
  const { data: current, isLoading: currentLoading } = useCurrentSubscription()
  const { data: plans,   isLoading: plansLoading }   = useSubscriptionPlans()

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your current plan and available features</p>
      </div>

      {/* Current plan card */}
      {currentLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : current && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{current.displayName || 'No Plan'}</h2>
                {current.status === 'ACTIVE' && (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Active</span>
                )}
                {current.status === 'NONE' && (
                  <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">No Subscription</span>
                )}
                {current.status === 'EXPIRED' && (
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">Expired</span>
                )}
              </div>
              {current.endDate && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Valid until {new Date(current.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              {current.status === 'NONE' && (
                <p className="text-xs text-gray-400 mt-0.5">Contact your administrator to activate a subscription.</p>
              )}
            </div>
            {current.price > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{fmt(current.price)}</div>
                <div className="text-xs text-gray-400">per month</div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <UsageBar current={current.currentMemberCount} limit={current.memberLimit} label="Members" />
            <UsageBar current={current.currentStaffCount}  limit={current.staffLimit}  label="Staff" />
          </div>
        </div>
      )}

      {/* Plan comparison grid */}
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Available Plans</h2>
      {plansLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {(plans ?? []).map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={current?.planName === plan.name && current?.status === 'ACTIVE'}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-8">
        To upgrade or change your plan, contact your gym administrator.
      </p>
    </div>
  )
}
