export type StaffRole = 'TRAINER' | 'RECEPTIONIST' | 'MANAGER' | 'CLEANER' | 'OTHER'
export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
export type IdProofType = 'AADHAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'VOTER_ID'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'

export interface Staff {
  id: number
  name: string
  phone: string | null
  email: string | null
  idProofType: IdProofType | null
  idProofNumber: string | null
  address: string | null
  salary: number | null
  role: StaffRole
  status: StaffStatus
  joinDate: string
  createdAt: string
}

export interface StaffRequest {
  name: string
  phone?: string
  email?: string
  idProofType?: IdProofType | ''
  idProofNumber?: string
  address?: string
  salary?: number | null
  role: StaffRole
  status: StaffStatus
  joinDate: string
}

export interface PagedStaff {
  content: Staff[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface AttendanceRecord {
  id: number
  staffId: number
  date: string
  status: AttendanceStatus
  notes: string | null
  createdAt: string
}

export interface AttendanceRequest {
  date: string
  status: AttendanceStatus
  notes?: string
}
