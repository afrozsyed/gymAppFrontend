import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/adminApi'
import type { ResetPasswordRequest } from '../types/admin.types'
import toast from 'react-hot-toast'

export function useAllGyms() {
  return useQuery({
    queryKey: ['admin', 'gyms'],
    queryFn: adminApi.getAllGyms,
  })
}

export function useCreateGym() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createGym,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gyms'] })
      toast.success('Gym created successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create gym')
    },
  })
}

export function useActivateGym() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.activateGym(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gyms'] })
      toast.success('Gym activated')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to activate gym')
    },
  })
}

export function useDeactivateGym() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deactivateGym(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gyms'] })
      toast.success('Gym deactivated')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to deactivate gym')
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResetPasswordRequest }) =>
      adminApi.resetPassword(id, data),
    onSuccess: () => {
      toast.success('Password reset successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reset password')
    },
  })
}
