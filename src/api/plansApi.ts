import axiosInstance from './axiosInstance'
import type { Plan, PlanRequest } from '../types/plan.types'

export const plansApi = {
  getAll: () =>
    axiosInstance.get<Plan[]>('/plans').then((r) => r.data),

  create: (data: PlanRequest) =>
    axiosInstance.post<Plan>('/plans', data).then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete(`/plans/${id}`).then((r) => r.data),
}
