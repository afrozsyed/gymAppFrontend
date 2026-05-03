import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePlans } from '../../hooks/usePlans'
import { useRecordPayment } from '../../hooks/usePayments'
import type { Member } from '../../types/member.types'
import type { PaymentMode } from '../../types/payment.types'

const schema = z.object({
  planId: z.number({ required_error: 'Select a plan' }),
  amount: z.number({ required_error: 'Amount is required' }).min(0, 'Must be non-negative'),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER']),
  notes: z.string().max(255).optional(),
})

type FormData = z.infer<typeof schema>

const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'OTHER', label: 'Other' },
]

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide'

interface Props {
  member: Member
  onClose: () => void
}

export default function RecordPaymentModal({ member, onClose }: Props) {
  const { data: plans = [] } = usePlans()
  const recordPayment = useRecordPayment()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      planId: member.plan.id,
      paymentMode: 'CASH',
      notes: '',
    },
  })

  const selectedPlanId = watch('planId')

  // Auto-fill amount when plan changes
  useEffect(() => {
    const plan = plans.find((p) => p.id === Number(selectedPlanId))
    if (plan) setValue('amount', plan.price)
  }, [selectedPlanId, plans, setValue])

  const onSubmit = async (data: FormData) => {
    await recordPayment.mutateAsync({
      memberId: member.id,
      data: {
        planId: Number(data.planId),
        amount: data.amount,
        paymentMode: data.paymentMode,
        notes: data.notes || undefined,
      },
    })
    onClose()
  }

  const selectedPlan = plans.find((p) => p.id === Number(selectedPlanId))
  const newExpiry = selectedPlan
    ? new Date(Date.now() + selectedPlan.durationDays * 86400000)
        .toISOString()
        .split('T')[0]
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
            <p className="text-sm text-gray-500 mt-0.5">{member.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current status strip */}
        <div className="mx-5 mt-4 px-4 py-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs text-gray-500">
          <span>Current: <strong className="text-gray-700">{member.plan.name}</strong></span>
          <span>Expires: <strong className="text-gray-700">{member.expiryDate}</strong></span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Plan selector */}
          <div>
            <label className={labelCls}>Plan</label>
            <Controller
              name="planId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className={inputCls}
                >
                  <option value="">Select a plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price} / {p.durationDays} days
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.planId && (
              <p className="text-red-500 text-xs mt-1">{errors.planId.message}</p>
            )}
            {newExpiry && (
              <p className="text-xs text-blue-600 mt-1.5">
                New expiry will be: <strong>{newExpiry}</strong>
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className={labelCls}>Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className={inputCls}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment mode */}
          <div>
            <label className={labelCls}>Payment Mode</label>
            <select {...register('paymentMode')} className={inputCls}>
              {PAYMENT_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Any notes about this payment..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordPayment.isPending}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {recordPayment.isPending ? 'Saving...' : 'Record & Renew'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
