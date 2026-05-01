export interface UserProfileResponse {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  gymName: string | null
}

export interface UpdateProfileRequest {
  name: string
  gymName?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
