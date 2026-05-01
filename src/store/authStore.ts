import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import type { DecodedToken } from '../types/auth.types'

interface AuthState {
  token: string | null
  role: string | null
  name: string | null
  gymId: number | null
  gymName: string | null
  login: (token: string, role: string, name: string, gymName: string | null) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      role: null,
      name: null,
      gymId: null,
      gymName: null,

      login: (token, role, name, gymName) => {
        try {
          const decoded = jwtDecode<DecodedToken>(token)
          set({ token, role, name, gymId: decoded.gymId ?? null, gymName })
        } catch {
          set({ token, role, name, gymId: null, gymName })
        }
      },

      logout: () => {
        set({ token: null, role: null, name: null, gymId: null, gymName: null })
      },

      isAuthenticated: () => {
        const { token } = get()
        if (!token) return false
        try {
          const decoded = jwtDecode<DecodedToken>(token)
          return decoded.exp * 1000 > Date.now()
        } catch {
          return false
        }
      },
    }),
    {
      name: 'gym-crm-auth',
    }
  )
)
