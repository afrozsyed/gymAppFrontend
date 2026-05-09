import { useNavigate } from 'react-router-dom'
import { useCurrentSubscription } from '../../hooks/useSubscription'
import type { CurrentSubscription } from '../../types/subscription.types'

type FeatureKey = keyof Pick<CurrentSubscription,
  'featureStaff' | 'featureAttendance' | 'featureReminders' |
  'featureReportsYearly' | 'featureReportsCustom'>

const FEATURE_LABELS: Record<FeatureKey, { label: string; plan: string }> = {
  featureStaff:          { label: 'Staff Management', plan: 'Pro' },
  featureAttendance:     { label: 'Staff Attendance',  plan: 'Pro' },
  featureReminders:      { label: 'WhatsApp Reminders', plan: 'Pro' },
  featureReportsYearly:  { label: 'Yearly Reports',    plan: 'Pro' },
  featureReportsCustom:  { label: 'Custom Date Reports', plan: 'Pro Plus' },
}

interface Props {
  feature: FeatureKey
  children: React.ReactNode
}

export default function FeatureGate({ feature, children }: Props) {
  const { data: sub, isLoading } = useCurrentSubscription()
  const navigate = useNavigate()

  // While loading, show children (optimistic — backend enforces real limits)
  if (isLoading || !sub) return <>{children}</>

  if (sub[feature]) return <>{children}</>

  const { label, plan } = FEATURE_LABELS[feature]

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{label}</h2>
        <p className="text-gray-500 text-sm mb-6">
          This feature is not included in your current plan.
          Upgrade to <span className="font-semibold text-blue-600">{plan}</span> or higher to unlock it.
        </p>
        <button
          onClick={() => navigate('/subscription')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          View Plans
        </button>
      </div>
    </div>
  )
}
