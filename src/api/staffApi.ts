import axiosInstance from './axiosInstance'
import type { Staff, StaffRequest, PagedStaff, AttendanceRecord, AttendanceRequest } from '../types/staff.types'

export interface StaffFilters {
  name?: string
  role?: string
  status?: string
}

export const staffApi = {
  getAll: (page = 0, size = 20, filters: StaffFilters = {}) =>
    axiosInstance
      .get<PagedStaff>('/staff', {
        params: { page, size, sort: 'createdAt,desc', ...filters },
      })
      .then((r) => r.data),

  getById: (id: number) =>
    axiosInstance.get<Staff>(`/staff/${id}`).then((r) => r.data),

  create: (data: StaffRequest) =>
    axiosInstance.post<Staff>('/staff', data).then((r) => r.data),

  update: (id: number, data: StaffRequest) =>
    axiosInstance.put<Staff>(`/staff/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete(`/staff/${id}`).then((r) => r.data),

  markAttendance: (id: number, data: AttendanceRequest) =>
    axiosInstance
      .post<AttendanceRecord>(`/staff/${id}/attendance`, data)
      .then((r) => r.data),

  getMonthlyAttendance: (id: number, year: number, month: number) =>
    axiosInstance
      .get<AttendanceRecord[]>(`/staff/${id}/attendance`, { params: { year, month } })
      .then((r) => r.data),
}
