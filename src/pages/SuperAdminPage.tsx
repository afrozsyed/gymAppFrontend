import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAllGyms, useCreateGym, useActivateGym, useDeactivateGym, useResetPassword } from '../hooks/useAdmin'
import type { GymDetailResponse } from '../types/admin.types'

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
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Create New Gym</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* autoComplete="off" on the form prevents browser from autofilling email/password */}
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Gym Name *</label>
              <input
                {...register('gymName')}
                className={inputCls}
                placeholder="FitZone Gym"
                autoComplete="off"
              />
              {errors.gymName && <p className="text-red-500 text-xs mt-1">{errors.gymName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Owner Name *</label>
              <input
                {...register('ownerName')}
                className={inputCls}
                placeholder="John Doe"
                autoComplete="off"
              />
              {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Email *</label>
              <input
                type="text"
                {...register('email')}
                className={inputCls}
                placeholder="owner@gym.com"
                autoComplete="off"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Phone</label>
              <input
                {...register('phone')}
                className={inputCls}
                placeholder="+91-9876543210"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Password *</label>
            <input
              type="password"
              {...register('password')}
              className={inputCls}
              placeholder="Min 6 characters"
              autoComplete="new-password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createGym.isPending}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Set a new password for <span className="font-semibold text-gray-700">{gym.gymName}</span>'s admin.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
          <div>
            <label className={labelCls}>New Password</label>
            <input
              type="password"
              {...register('newPassword')}
              className={inputCls}
              placeholder="Min 6 characters"
              autoComplete="new-password"
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {resetPassword.isPending ? 'Saving...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [resetGym, setResetGym] = useState<GymDetailResponse | null>(null)
  const { data: gyms, isLoading } = useAllGyms()
  const activateGym = useActivateGym()
  const deactivateGym = useDeactivateGym()

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gym Management</h1>
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

      {/* Gym list table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
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
                    {['Gym Name', 'Owner', 'Email', 'Phone', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {gyms.map(gym => (
                    <tr key={gym.gymId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900">{gym.gymName}</td>
                      <td className="px-5 py-4 text-gray-600">{gym.ownerName ?? '—'}</td>
                      <td className="px-5 py-4 text-gray-600">{gym.ownerEmail ?? '—'}</td>
                      <td className="px-5 py-4 text-gray-500">{gym.ownerPhone ?? '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          gym.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {gym.status === 'ACTIVE' ? '● Active' : '● Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {gym.status === 'ACTIVE' ? (
                            <button
                              onClick={() => deactivateGym.mutate(gym.gymId)}
                              disabled={deactivateGym.isPending}
                              className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => activateGym.mutate(gym.gymId)}
                              disabled={activateGym.isPending}
                              className="px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => setResetGym(gym)}
                            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
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
                      {gym.ownerName && (
                        <div className="text-xs text-gray-400 mt-0.5">{gym.ownerName}</div>
                      )}
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      gym.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {gym.status === 'ACTIVE' ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2">
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
                      onClick={() => setResetGym(gym)}
                      className="flex-1 py-2 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showCreateModal && <CreateGymModal onClose={() => setShowCreateModal(false)} />}
      {resetGym && <ResetPasswordModal gym={resetGym} onClose={() => setResetGym(null)} />}
    </div>
  )
}
