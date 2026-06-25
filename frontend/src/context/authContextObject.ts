import { createContext } from 'react'
import type { Admin, LoginCredentials } from '../types/api'

export interface AuthContextValue {
  admin: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<Admin>
  logout: () => void
  updateAdmin: (updatedAdmin: Admin) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
