import axiosInstance from './axiosInstance'
import type { DashboardData } from '../types/dashboard.types'

export const dashboardApi = {
  get: () =>
    axiosInstance.get<DashboardData>('/dashboard').then((r) => r.data),
}
