import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from '../api/subscriptionApi'
import type { AssignSubscriptionRequest, SubscriptionPlanRequest } from '../types/subscription.types'

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: subscriptionApi.getCurrent,
    staleTime: 5 * 60 * 1000,
    // While loading, assume all features available to prevent flicker/blocking
    placeholderData: {
      planName: null,
      displayName: '',
      description: '',
      price: 0,
      startDate: null,
      endDate: null,
      status: 'NONE' as const,
      memberLimit: -1,
      staffLimit: -1,
      currentMemberCount: 0,
      currentStaffCount: 0,
      featureReportsYearly: true,
      featureReportsCustom: true,
      featureStaff: true,
      featureAttendance: true,
      featureReminders: true,
    },
  })
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: subscriptionApi.getAllPlans,
    staleTime: 10 * 60 * 1000,
  })
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin', 'subscription-plans'],
    queryFn: subscriptionApi.adminGetAllPlans,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubscriptionPlanRequest }) =>
      subscriptionApi.adminUpdatePlan(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'subscription-plans'] })
      qc.invalidateQueries({ queryKey: ['subscription', 'plans'] })
    },
  })
}

export function useAssignSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gymId, data }: { gymId: number; data: AssignSubscriptionRequest }) =>
      subscriptionApi.adminAssignSubscription(gymId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'gyms'] })
    },
  })
}
