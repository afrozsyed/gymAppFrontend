export interface AuthResponse {
  token: string
  role: string
  name: string
  gymName: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  gymName?: string
}

export interface DecodedToken {
  sub: string
  gymId?: number
  role: string
  iat: number
  exp: number
}
