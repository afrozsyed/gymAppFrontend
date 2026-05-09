export interface PlanStat {
  planName: string
  renewalCount: number
  revenue: number
}

export interface ReportResponse {
  year: number
  month: number
  monthLabel: string
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  newJoinersThisMonth: number
  renewedThisMonth: number
  revenueThisMonth: number
  pendingAmount: number
  planBreakdown: PlanStat[]
}
