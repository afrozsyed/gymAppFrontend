import axiosInstance from './axiosInstance'
import type { Member, MemberRequest, PagedMembers } from '../types/member.types'

export const membersApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance
      .get<PagedMembers>('/members', { params: { page, size, sort: 'createdAt,desc' } })
      .then((r) => r.data),

  getById: (id: number) =>
    axiosInstance.get<Member>(`/members/${id}`).then((r) => r.data),

  create: (data: MemberRequest) =>
    axiosInstance.post<Member>('/members', data).then((r) => r.data),

  update: (id: number, data: MemberRequest) =>
    axiosInstance.put<Member>(`/members/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete(`/members/${id}`).then((r) => r.data),
}
