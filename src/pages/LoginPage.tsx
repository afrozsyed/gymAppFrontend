import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import axiosInstance from '../api/axiosInstance'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>
type HealthStatus = 'idle' | 'checking' | 'up' | 'down'

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('idle')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.token, data.role, data.name, data.gymName)
      navigate(data.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Invalid email or password'),
  })

  const checkHealth = async () => {
    setHealthStatus('checking')
    try {
      const res = await axiosInstance.get('/health')
      setHealthStatus(res.data?.status === 'UP' ? 'up' : 'down')
    } catch {
      setHealthStatus('down')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-sm p-7 sm:p-8">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl text-2xl mb-3 shadow-lg shadow-blue-200">
            💪
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your gym dashboard</p>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" {...register('email')} className={inputCls} placeholder="admin@fitzone.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" {...register('password')} className={inputCls} placeholder="••••••••" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shadow-blue-200 mt-1"
          >
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Health check */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              {healthStatus === 'idle' && (
                <span className="text-gray-400">Backend status unknown</span>
              )}
              {healthStatus === 'checking' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-yellow-600 font-medium">Checking...</span>
                </>
              )}
              {healthStatus === 'up' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-600 font-medium">Backend connected</span>
                </>
              )}
              {healthStatus === 'down' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-red-600 font-medium">Backend unreachable</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={checkHealth}
              disabled={healthStatus === 'checking'}
              className="shrink-0 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {healthStatus === 'checking' ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Contact your administrator to create a gym account.
        </p>
      </div>
    </div>
  )
}
