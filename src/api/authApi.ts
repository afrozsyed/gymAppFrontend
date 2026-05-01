import axiosInstance from './axiosInstance'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth.types'

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<AuthResponse>('/auth/register', data).then((r) => r.data),
}
