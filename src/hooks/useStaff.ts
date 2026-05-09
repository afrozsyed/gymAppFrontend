import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffApi } from '../api/staffApi'
import type { StaffFilters } from '../api/staffApi'
import type { StaffRequest, AttendanceRequest } from '../types/staff.types'
import toast from 'react-hot-toast'

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (page: number, size: number, filters: StaffFilters) =>
    [...staffKeys.lists(), { page, size, ...filters }] as const,
  detail: (id: number) => [...staffKeys.all, 'detail', id] as const,
  attendance: (staffId: number, year: number, month: number) =>
    [...staffKeys.all, 'attendance', staffId, { year, month }] as const,
}

export function useStaff(page = 0, size = 20, filters: StaffFilters = {}) {
  return useQuery({
    queryKey: staffKeys.list(page, size, filters),
    queryFn: () => staffApi.getAll(page, size, filters),
  })
}

export function useStaffMember(id: number) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => staffApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StaffRequest) => staffApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
      toast.success('Staff member added successfully')
    },
    onError: () => toast.error('Failed to add staff member'),
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StaffRequest }) =>
      staffApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
      toast.success('Staff member updated successfully')
    },
    onError: () => toast.error('Failed to update staff member'),
  })
}

export function useDeleteStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => staffApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
      toast.success('Staff member deleted')
    },
    onError: () => toast.error('Failed to delete staff member'),
  })
}

export function useMonthlyAttendance(staffId: number, year: number, month: number) {
  return useQuery({
    queryKey: staffKeys.attendance(staffId, year, month),
    queryFn: () => staffApi.getMonthlyAttendance(staffId, year, month),
    enabled: !!staffId,
  })
}

export function useMarkAttendance(staffId: number, year: number, month: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AttendanceRequest) => staffApi.markAttendance(staffId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.attendance(staffId, year, month) })
      toast.success('Attendance marked')
    },
    onError: () => toast.error('Failed to mark attendance'),
  })
}
