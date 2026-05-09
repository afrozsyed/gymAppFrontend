import axiosInstance from './axiosInstance'
import type {
  CurrentSubscription,
  SubscriptionPlan,
  AssignSubscriptionRequest,
  SubscriptionPlanRequest,
} from '../types/subscription.types'

export const subscriptionApi = {
  // Gym-facing
  getCurrent: (): Promise<CurrentSubscription> =>
    axiosInstance.get('/subscription/current').then(r => r.data),
  getAllPlans: (): Promise<SubscriptionPlan[]> =>
    axiosInstance.get('/subscription/plans').then(r => r.data),

  // Admin-facing
  adminGetAllPlans: (): Promise<SubscriptionPlan[]> =>
    axiosInstance.get('/admin/subscription-plans').then(r => r.data),
  adminUpdatePlan: (id: number, data: SubscriptionPlanRequest): Promise<SubscriptionPlan> =>
    axiosInstance.put(`/admin/subscription-plans/${id}`, data).then(r => r.data),
  adminAssignSubscription: (gymId: number, data: AssignSubscriptionRequest): Promise<void> =>
    axiosInstance.post(`/admin/gyms/${gymId}/subscription`, data).then(r => r.data),
}
