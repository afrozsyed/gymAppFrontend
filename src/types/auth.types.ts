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

<<<<<<< HEAD
=======
export interface RegisterRequest {
  email: string
  password: string
  name: string
  gymName?: string
}

>>>>>>> c4890be581e973935dd3e97b62bd10547ee6752a
export interface DecodedToken {
  sub: string
  gymId?: number
  role: string
  iat: number
  exp: number
}
