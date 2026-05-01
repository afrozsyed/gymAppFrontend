import api from './axiosInstance'
import type { UserProfileResponse, UpdateProfileRequest, ChangePasswordRequest } from '../types/profile.types'

export const profileApi = {
  getProfile: () => api.get<UserProfileResponse>('/profile').then(r => r.data),
  updateProfile: (data: UpdateProfileRequest) =>
    api.put<UserProfileResponse>('/profile', data).then(r => r.data),
  changePassword: (data: ChangePasswordRequest) =>
    api.put('/profile/password', data).then(r => r.data),
}
