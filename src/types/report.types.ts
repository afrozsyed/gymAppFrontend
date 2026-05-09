export interface PlanStat {
  planName: string
  renewalCount: number
  revenue: number
}

export interface StaffAttendanceStat {
  staffName: string
  role: string
  presentDays: number
  absentDays: number
  halfDays: number
  leaveDays: number
  totalMarked: number
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
  staffAttendance: StaffAttendanceStat[]
}

export interface MonthlyBreakdown {
  month: number
  monthLabel: string
  newJoiners: number
  renewals: number
  revenue: number
}

export interface YearlyReport {
  year: number
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  pendingAmount: number
  totalNewJoiners: number
  totalRenewals: number
  totalRevenue: number
  monthlyBreakdown: MonthlyBreakdown[]
  planBreakdown: PlanStat[]
  staffAttendance: StaffAttendanceStat[]
}
