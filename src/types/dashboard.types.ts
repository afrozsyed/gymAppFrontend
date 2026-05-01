import type { Member } from './member.types'

export interface DashboardData {
  expiredCount: number
  expiringToday: number
  pendingPayments: number
  totalMembers: number
  alertMembers: Member[]
}
