import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profileApi'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { token, role } = useAuthStore()

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      // Sync name and gymName in auth store so sidebar updates without re-login
      if (token && role) {
        const store = useAuthStore.getState()
        store.login(token, role, data.name, data.gymName ?? '')
      }
      toast.success('Profile updated successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to change password')
    },
  })
}
