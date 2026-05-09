import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAllGyms, useCreateGym, useActivateGym, useDeactivateGym, useResetPassword } from '../hooks/useAdmin'
import { useAdminPlans, useUpdatePlan, useAssignSubscription } from '../hooks/useSubscription'
import type { GymDetailResponse } from '../types/admin.types'
import type { SubscriptionPlan } from '../types/subscription.types'

// ── Schemas ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  gymName:   z.string().min(1, 'Gym name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  email:     z.string().email('Invalid email'),
  phone:     z.string().optional(),
  password:  z.string().min(6, 'Minimum 6 characters'),
})

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Minimum 6 characters'),
})

type CreateFormData = z.infer<typeof createSchema>
type ResetFormData  = z.infer<typeof resetSchema>

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white'
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1.5'

function limitLabel(n: number) {
  return n === -1 ? '∞' : String(n)
}

function fmt(n: number) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })
}

// ── Create Gym Modal ──────────────────────────────────────────────────────────

function CreateGymModal({ onClose }: { onClose: () => void }) {
  const createGym = useCreateGym()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  })

  const onSubmit = async (data: CreateFormData) => {
    await createGym.mutateAsync(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Create New Gym</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Gym Name *</label>
              <input {...register('gymName')} className={inputCls} placeholder="FitZone Gym" autoComplete="off" />
              {errors.gymName && <p className="text-red-500 text-xs mt-1">{errors.gymName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Owner Name *</label>
              <input {...register('ownerName')} className={inputCls} placeholder="John Doe" autoComplete="off" />
              {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="text" {...register('email')} className={inputCls} placeholder="owner@gym.com" autoComplete="off" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input {...register('phone')} className={inputCls} placeholder="+91-9876543210" autoComplete="off" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Password *</label>
            <input type="password" {...register('password')} className={inputCls} placeholder="Min 6 characters" autoComplete="new-password" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={createGym.isPending} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {createGym.isPending ? 'Creating...' : 'Create Gym'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Reset Password Modal ──────────────────────────────────────────────────────

function ResetPasswordModal({ gym, onClose }: { gym: GymDetailResponse; onClose: () => void }) {
  const resetPassword = useResetPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetFormData) => {
    await resetPassword.mutateAsync({ id: gym.gymId, data })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">Reset Password</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">Set a new password for <span className="font-semibold text-gray-700">{gym.gymName}</span>'s admin.</p>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
          <div>
            <label className={labelCls}>New Password</label>
            <input type="password" {...register('newPassword')} className={inputCls} placeholder="Min 6 characters" autoComplete="new-password" />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={resetPassword.isPending} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {resetPassword.isPending ? 'Saving...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit Plan Modal ───────────────────────────────────────────────────────────

function EditPlanModal({ plan, onClose }: { plan: SubscriptionPlan; onClose: () => void }) {
  const updatePlan = useUpdatePlan()
  const [form, setForm] = useState({
    displayName:          plan.displayName,
    description:          plan.description,
    price:                String(plan.price),
    memberLimit:          String(plan.memberLimit),
    staffLimit:           String(plan.staffLimit),
    featureReportsYearly: plan.featureReportsYearly,
    featureReportsCustom: plan.featureReportsCustom,
    featureStaff:         plan.featureStaff,
    featureAttendance:    plan.featureAttendance,
    featureReminders:     plan.featureReminders,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updatePlan.mutateAsync({
      id: plan.id,
      data: {
        displayName:          form.displayName,
        description:          form.description,
        price:                Number(form.price),
        memberLimit:          Number(form.memberLimit),
        staffLimit:           Number(form.staffLimit),
        featureReportsYearly: form.featureReportsYearly,
        featureReportsCustom: form.featureReportsCustom,
        featureStaff:         form.featureStaff,
        featureAttendance:    form.featureAttendance,
        featureReminders:     form.featureReminders,
      },
    })
    onClose()
  }

  const toggle = (key: keyof typeof form) =>
    setForm(f => ({ ...f, [key]: !f[key as keyof typeof form] }))

  const features: { key: keyof typeof form; label: string }[] = [
    { key: 'featureReportsYearly', label: 'Yearly Reports' },
    { key: 'featureReportsCustom', label: 'Custom Date Reports' },
    { key: 'featureStaff',         label: 'Staff Management' },
    { key: 'featureAttendance',    label: 'Staff Attendance' },
    { key: 'featureReminders',     label: 'WhatsApp Reminders' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Edit Plan — {plan.displayName}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Display Name</label>
            <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Price (₹/mo)</label>
              <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Member Limit</label>
              <input type="number" min="-1" value={form.memberLimit} onChange={e => setForm(f => ({ ...f, memberLimit: e.target.value }))} className={inputCls} />
              <p className="text-xs text-gray-400 mt-0.5">-1 = unlimited</p>
            </div>
            <div>
              <label className={labelCls}>Staff Limit</label>
              <input type="number" min="-1" value={form.staffLimit} onChange={e => setForm(f => ({ ...f, staffLimit: e.target.value }))} className={inputCls} />
              <p className="text-xs text-gray-400 mt-0.5">-1 = unlimited</p>
            </div>
          </div>

          <div>
            <p className={labelCls}>Features</p>
            <div className="space-y-2 bg-gray-50 rounded-xl p-3">
              {features.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key] as boolean}
                    onChange={() => toggle(key)}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={updatePlan.isPending} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {updatePlan.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Assign Plan Modal ─────────────────────────────────────────────────────────

function AssignPlanModal({ gym, onClose }: { gym: GymDetailResponse; onClose: () => void }) {
  const { data: plans, isLoading } = useAdminPlans()
  const assignSubscription = useAssignSubscription()
  const [planId, setPlanId] = useState<string>('')
  const [durationMonths, setDurationMonths] = useState<string>('1')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId) return
    await assignSubscription.mutateAsync({
      gymId: gym.gymId,
      data: { planId: Number(planId), durationMonths: Number(durationMonths) },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">Assign Plan</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">Assign a subscription plan to <span className="font-semibold text-gray-700">{gym.gymName}</span>.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Plan</label>
            <select value={planId} onChange={e => setPlanId(e.target.value)} className={inputCls} required>
              <option value="">Select a plan...</option>
              {isLoading ? (
                <option disabled>Loading plans...</option>
              ) : (plans ?? []).map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.displayName} — {fmt(p.price)}/mo
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Duration</label>
            <select value={durationMonths} onChange={e => setDurationMonths(e.target.value)} className={inputCls}>
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={assignSubscription.isPending || !planId} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {assignSubscription.isPending ? 'Assigning...' : 'Assign Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Plan badge helper ─────────────────────────────────────────────────────────

function PlanBadge({ planName, displayName }: { planName: string | null; displayName: string | null }) {
  if (!planName || !displayName) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">No Plan</span>
  }
  const colors: Record<string, string> = {
    BASIC:    'bg-gray-100 text-gray-700',
    PRO:      'bg-blue-100 text-blue-700',
    PRO_PLUS: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[planName] ?? 'bg-gray-100 text-gray-700'}`}>
      {displayName}
    </span>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const [showCreateModal, setShowCreateModal]   = useState(false)
  const [resetGym,        setResetGym]          = useState<GymDetailResponse | null>(null)
  const [editPlan,        setEditPlan]          = useState<SubscriptionPlan | null>(null)
  const [assignGym,       setAssignGym]         = useState<GymDetailResponse | null>(null)

  const { data: gyms,  isLoading: gymsLoading  } = useAllGyms()
  const { data: plans, isLoading: plansLoading } = useAdminPlans()
  const activateGym   = useActivateGym()
  const deactivateGym = useDeactivateGym()

  const featureLabels = [
    { key: 'featureReportsYearly' as const, label: 'Yearly' },
    { key: 'featureReportsCustom' as const, label: 'Custom' },
    { key: 'featureStaff'         as const, label: 'Staff' },
    { key: 'featureAttendance'    as const, label: 'Attend.' },
    { key: 'featureReminders'     as const, label: 'Remind.' },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">

      {/* ── Subscription Plans section ──────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Subscription Plans</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage pricing, limits, and features for each plan</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {plansLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Plan', 'Price/mo', 'Members', 'Staff', ...featureLabels.map(f => f.label), 'Edit'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(plans ?? []).map(plan => (
                    <tr key={plan.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">{plan.displayName}</td>
                      <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{fmt(plan.price)}</td>
                      <td className="px-4 py-3.5 text-gray-600">{limitLabel(plan.memberLimit)}</td>
                      <td className="px-4 py-3.5 text-gray-600">{limitLabel(plan.staffLimit)}</td>
                      {featureLabels.map(({ key }) => (
                        <td key={key} className="px-4 py-3.5">
                          {plan[key]
                            ? <span className="text-green-500 font-bold text-base">✓</span>
                            : <span className="text-gray-300 font-bold text-base">✗</span>}
                        </td>
                      ))}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setEditPlan(plan)}
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Gym Management section ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Gym Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {gyms?.length ?? 0} gym{(gyms?.length ?? 0) !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Gym
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {gymsLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !gyms?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-3">🏢</div>
              <p className="text-gray-700 font-medium">No gyms yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Create New Gym" to add the first one.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Gym Name', 'Owner', 'Email', 'Plan', 'Expires', 'Members', 'Staff', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {gyms.map(gym => (
                      <tr key={gym.gymId} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-4 font-semibold text-gray-900 whitespace-nowrap">{gym.gymName}</td>
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{gym.ownerName ?? '—'}</td>
                        <td className="px-4 py-4 text-gray-600">{gym.ownerEmail ?? '—'}</td>
                        <td className="px-4 py-4">
                          <PlanBadge planName={gym.currentPlan} displayName={gym.planDisplayName} />
                        </td>
                        <td className="px-4 py-4 text-gray-500 whitespace-nowrap text-xs">
                          {gym.planExpiry
                            ? new Date(gym.planExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-4 py-4 text-gray-600 text-center">{gym.memberCount}</td>
                        <td className="px-4 py-4 text-gray-600 text-center">{gym.staffCount}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            gym.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {gym.status === 'ACTIVE' ? '● Active' : '● Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {gym.status === 'ACTIVE' ? (
                              <button
                                onClick={() => deactivateGym.mutate(gym.gymId)}
                                disabled={deactivateGym.isPending}
                                className="px-2.5 py-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => activateGym.mutate(gym.gymId)}
                                disabled={activateGym.isPending}
                                className="px-2.5 py-1.5 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => setAssignGym(gym)}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Assign Plan
                            </button>
                            <button
                              onClick={() => setResetGym(gym)}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Reset PW
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {gyms.map(gym => (
                  <div key={gym.gymId} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{gym.gymName}</div>
                        <div className="text-sm text-gray-500 truncate">{gym.ownerEmail ?? '—'}</div>
                        {gym.ownerName && <div className="text-xs text-gray-400 mt-0.5">{gym.ownerName}</div>}
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        gym.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {gym.status === 'ACTIVE' ? '● Active' : '● Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <PlanBadge planName={gym.currentPlan} displayName={gym.planDisplayName} />
                      {gym.planExpiry && (
                        <span>Expires {new Date(gym.planExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                      <span>👥 {gym.memberCount}</span>
                      <span>👨‍💼 {gym.staffCount}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {gym.status === 'ACTIVE' ? (
                        <button
                          onClick={() => deactivateGym.mutate(gym.gymId)}
                          disabled={deactivateGym.isPending}
                          className="flex-1 py-2 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => activateGym.mutate(gym.gymId)}
                          disabled={activateGym.isPending}
                          className="flex-1 py-2 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => setAssignGym(gym)}
                        className="flex-1 py-2 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Assign Plan
                      </button>
                      <button
                        onClick={() => setResetGym(gym)}
                        className="flex-1 py-2 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Reset PW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Modals */}
      {showCreateModal && <CreateGymModal onClose={() => setShowCreateModal(false)} />}
      {resetGym        && <ResetPasswordModal gym={resetGym} onClose={() => setResetGym(null)} />}
      {editPlan        && <EditPlanModal plan={editPlan} onClose={() => setEditPlan(null)} />}
      {assignGym       && <AssignPlanModal gym={assignGym} onClose={() => setAssignGym(null)} />}
    </div>
  )
}
