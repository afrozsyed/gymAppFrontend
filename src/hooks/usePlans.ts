import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plansApi } from '../api/plansApi'
import type { PlanRequest } from '../types/plan.types'
import toast from 'react-hot-toast'

export const planKeys = {
  all: ['plans'] as const,
}

export function usePlans() {
  return useQuery({
    queryKey: planKeys.all,
    queryFn: plansApi.getAll,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlanRequest) => plansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all })
      toast.success('Plan created')
    },
    onError: () => toast.error('Failed to create plan'),
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => plansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all })
      toast.success('Plan deleted')
    },
    onError: () => toast.error('Failed to delete plan'),
  })
}
