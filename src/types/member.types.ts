import type { Plan } from './plan.types'

export type PaymentStatus = 'PAID' | 'PENDING'
export type MemberStatus = 'ACTIVE' | 'EXPIRED' | 'EXPIRING_TODAY'

export interface Member {
  id: number
  name: string
  phone: string
  joinDate: string
  plan: Plan
  expiryDate: string
  paymentStatus: PaymentStatus
  status: MemberStatus
  createdAt: string
}

export interface MemberRequest {
  name: string
  phone: string
  joinDate: string
  planId: number
  paymentStatus: PaymentStatus
}

export interface PagedMembers {
  content: Member[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
