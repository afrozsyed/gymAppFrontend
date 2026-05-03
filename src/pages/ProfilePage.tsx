import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfile, useUpdateProfile } from '../hooks/useProfile'
import { useAuthStore } from '../store/authStore'
import ChangePasswordModal from '../components/profile/ChangePasswordModal'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  gymName: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
const readonlyCls =
  'w-full border border-gray-100 rounded-xl px-3.5 py-3 text-sm bg-gray-50 text-gray-500 outline-none'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

export default function ProfilePage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const role = useAuthStore(s => s.role)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        gymName: profile.gymName ?? '',
      })
    }
  }, [profile, reset])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <form onSubmit={handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
          <div>
            <label className={labelCls}>Name</label>
            <input {...register('name')} className={inputCls} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input value={profile?.email ?? ''} readOnly className={readonlyCls} />
          </div>

          {profile?.phone && (
            <div>
              <label className={labelCls}>Phone</label>
              <input value={profile.phone} readOnly className={readonlyCls} />
            </div>
          )}

          {role === 'ADMIN' && (
            <div>
              <label className={labelCls}>Gym Name</label>
              <input {...register('gymName')} className={inputCls} />
            </div>
          )}

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Password</h2>
        <p className="text-sm text-gray-500 mb-4">Change your account password.</p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Change Password
        </button>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  )
}
