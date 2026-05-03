export interface GymDetailResponse {
  gymId: number
  gymName: string
  gymPhone: string | null
  status: 'ACTIVE' | 'INACTIVE'
  ownerName: string | null
  ownerEmail: string | null
  ownerPhone: string | null
  createdAt: string
}

export interface CreateGymRequest {
  gymName: string
  ownerName: string
  email: string
  phone?: string
  password: string
}

export interface ResetPasswordRequest {
  newPassword: string
}
