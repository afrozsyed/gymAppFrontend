import api from './axiosInstance'
import type { GymDetailResponse, CreateGymRequest, ResetPasswordRequest } from '../types/admin.types'

export const adminApi = {
  getAllGyms: () => api.get<GymDetailResponse[]>('/admin/gyms').then(r => r.data),
  createGym: (data: CreateGymRequest) =>
    api.post<GymDetailResponse>('/admin/gyms', data).then(r => r.data),
  activateGym: (id: number) =>
    api.put<GymDetailResponse>(`/admin/gyms/${id}/activate`).then(r => r.data),
  deactivateGym: (id: number) =>
    api.put<GymDetailResponse>(`/admin/gyms/${id}/deactivate`).then(r => r.data),
  resetPassword: (id: number, data: ResetPasswordRequest) =>
    api.put(`/admin/gyms/${id}/reset-password`, data).then(r => r.data),
}
