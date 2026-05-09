import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { membersApi } from '../api/membersApi'
import type { MemberFilters } from '../api/membersApi'
import { remindersApi } from '../api/remindersApi'
import type { MemberRequest } from '../types/member.types'
import toast from 'react-hot-toast'

export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (page: number, size: number, filters: MemberFilters) =>
    [...memberKeys.lists(), { page, size, ...filters }] as const,
  detail: (id: number) => [...memberKeys.all, 'detail', id] as const,
}

export function useMembers(page = 0, size = 20, filters: MemberFilters = {}) {
  return useQuery({
    queryKey: memberKeys.list(page, size, filters),
    queryFn: () => membersApi.getAll(page, size, filters),
  })
}

export function useMember(id: number) {
  return useQuery({
    queryKey: memberKeys.detail(id),
    queryFn: () => membersApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MemberRequest) => membersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() })
      toast.success('Member added successfully')
    },
    onError: () => toast.error('Failed to add member'),
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MemberRequest }) =>
      membersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() })
      toast.success('Member updated successfully')
    },
    onError: () => toast.error('Failed to update member'),
  })
}

export function useDeleteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => membersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() })
      toast.success('Member deleted')
    },
    onError: () => toast.error('Failed to delete member'),
  })
}

export function useSendReminder() {
  return useMutation({
    mutationFn: (memberId: number) => remindersApi.send(memberId),
    onSuccess: () => toast.success('Reminder sent'),
    onError: () => toast.error('Failed to send reminder'),
  })
}
