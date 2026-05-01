import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePlans, useCreatePlan, useDeletePlan } from '../../hooks/usePlans'
import LoadingSpinner from '../common/LoadingSpinner'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  durationDays: z.coerce.number().min(1, 'Min 1 day'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
})

type FormData = z.infer<typeof schema>

export default function PlanList() {
  const { data: plans = [], isLoading } = usePlans()
  const createPlan = useCreatePlan()
  const deletePlan = useDeletePlan()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await createPlan.mutateAsync(data)
    reset()
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Add Plan Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Add New Plan</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
          <div>
            <input
              {...register('name')}
              placeholder="Plan name (e.g. Monthly)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <input
              type="number"
              {...register('durationDays')}
              placeholder="Duration (days)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            {errors.durationDays && <p className="text-red-500 text-xs mt-1">{errors.durationDays.message}</p>}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                {...register('price')}
                placeholder="Price (₹)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <button
              type="submit"
              disabled={createPlan.isPending}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium whitespace-nowrap shadow-sm transition-colors"
            >
              {createPlan.isPending ? 'Adding...' : '+ Add'}
            </button>
          </div>
        </form>
      </div>

      {/* Plans list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16"><LoadingSpinner /></div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium text-gray-500">No plans yet</p>
            <p className="text-sm mt-1">Create your first plan above!</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Plan Name</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{plan.name}</td>
                    <td className="px-6 py-4 text-gray-600">{plan.durationDays} days</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">₹{plan.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { if (confirm(`Delete plan "${plan.name}"?`)) deletePlan.mutate(plan.id) }}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between px-4 py-4 gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{plan.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {plan.durationDays} days · <span className="font-medium text-gray-700">₹{plan.price.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => { if (confirm(`Delete plan "${plan.name}"?`)) deletePlan.mutate(plan.id) }}
                    className="shrink-0 text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
