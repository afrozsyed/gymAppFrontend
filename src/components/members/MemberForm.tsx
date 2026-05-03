import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePlans } from '../../hooks/usePlans'
import type { Member } from '../../types/member.types'
import { format, addDays } from 'date-fns'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  phone: z.string().max(30).optional(),
  joinDate: z.string().min(1, 'Join date is required'),
  planId: z.coerce.number().min(1, 'Select a plan'),
  paymentStatus: z.enum(['PAID', 'PENDING']),
})

export type MemberFormData = z.infer<typeof schema>

interface Props {
  defaultValues?: Member
  onSubmit: (data: MemberFormData) => void
  isLoading?: boolean
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

export default function MemberForm({ defaultValues, onSubmit, isLoading }: Props) {
  const { data: plans = [] } = usePlans()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<MemberFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          phone: defaultValues.phone,
          joinDate: defaultValues.joinDate,
          planId: defaultValues.plan.id,
          paymentStatus: defaultValues.paymentStatus,
        }
      : { joinDate: format(new Date(), 'yyyy-MM-dd'), paymentStatus: 'PENDING' },
  })

  const watchJoinDate = watch('joinDate')
  const watchPlanId = watch('planId')
  const selectedPlan = plans.find((p) => p.id === Number(watchPlanId))
  const computedExpiry =
    watchJoinDate && selectedPlan
      ? format(addDays(new Date(watchJoinDate), selectedPlan.durationDays), 'yyyy-MM-dd')
      : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className={labelCls}>Full Name *</label>
        <input {...register('name')} className={inputCls} placeholder="Rajesh Kumar" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Phone</label>
        <input {...register('phone')} className={inputCls} placeholder="+91-9876543210" />
      </div>

      <div>
        <label className={labelCls}>Join Date *</label>
        <input type="date" {...register('joinDate')} className={inputCls} />
        {errors.joinDate && <p className="text-red-500 text-xs mt-1">{errors.joinDate.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Plan *</label>
        <select {...register('planId')} className={inputCls}>
          <option value="">Select a plan</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} — {plan.durationDays} days @ ₹{plan.price}
            </option>
          ))}
        </select>
        {errors.planId && <p className="text-red-500 text-xs mt-1">{errors.planId.message}</p>}
      </div>

      {computedExpiry && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <span>📅</span>
          <span>Expiry date: <strong>{computedExpiry}</strong></span>
        </div>
      )}

      <div>
        <label className={labelCls}>Payment Status *</label>
        <div className="grid grid-cols-2 gap-3">
          {(['PAID', 'PENDING'] as const).map((status) => (
            <label
              key={status}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                status === 'PAID'
                  ? 'has-[:checked]:border-green-500 has-[:checked]:bg-green-50'
                  : 'has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50'
              } border-gray-200 hover:bg-gray-50`}
            >
              <input type="radio" value={status} {...register('paymentStatus')} className="accent-blue-600" />
              <span className="text-sm font-medium text-gray-700">{status}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm mt-2"
      >
        {isLoading ? 'Saving...' : defaultValues ? 'Update Member' : 'Add Member'}
      </button>
    </form>
  )
}
