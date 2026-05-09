export interface FeatureSet {
  featureReportsYearly: boolean
  featureReportsCustom: boolean
  featureStaff: boolean
  featureAttendance: boolean
  featureReminders: boolean
}

export interface SubscriptionPlan extends FeatureSet {
  id: number
  name: 'BASIC' | 'PRO' | 'PRO_PLUS'
  displayName: string
  description: string
  price: number
  memberLimit: number   // -1 = unlimited
  staffLimit: number    // -1 = unlimited
  isActive: boolean
  sortOrder: number
}

export interface CurrentSubscription extends FeatureSet {
  planName: string | null
  displayName: string
  description: string
  price: number
  startDate: string | null
  endDate: string | null
  status: 'ACTIVE' | 'EXPIRED' | 'NONE'
  memberLimit: number
  staffLimit: number
  currentMemberCount: number
  currentStaffCount: number
}

export interface AssignSubscriptionRequest {
  planId: number
  durationMonths: number
}

export interface SubscriptionPlanRequest {
  displayName: string
  description: string
  price: number
  memberLimit: number
  staffLimit: number
  featureReportsYearly: boolean
  featureReportsCustom: boolean
  featureStaff: boolean
  featureAttendance: boolean
  featureReminders: boolean
}
