import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getAdminProfile, loginAdmin } from '../services/authService'
import type { Admin, LoginCredentials } from '../types/api'
import {
  clearSession,
  getStoredAdmin,
  getStoredToken,
  storeSession,
} from '../utils/authStorage'
import { AuthContext } from './authContextObject'
import type { AuthContextValue } from './authContextObject'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(getStoredAdmin)
  const [isLoading, setIsLoading] = useState(Boolean(getStoredToken()))

  useEffect(() => {
    const restoreSession = async () => {
      if (!getStoredToken()) {
        setIsLoading(false)
        return
      }

      try {
        const profile = await getAdminProfile()
        setAdmin(profile)
        const token = getStoredToken()
        if (token) storeSession({ token, admin: profile })
      } catch {
        clearSession()
        setAdmin(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => setAdmin(null)

    window.addEventListener('aga:unauthorized', handleUnauthorized)
    return () =>
      window.removeEventListener('aga:unauthorized', handleUnauthorized)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const session = await loginAdmin(credentials)
    storeSession(session)
    setAdmin(session.admin)
    return session.admin
  }

  const logout = () => {
    clearSession()
    setAdmin(null)
  }

  const updateAdmin = (updatedAdmin: Admin) => {
    const token = getStoredToken()
    setAdmin(updatedAdmin)
    if (token) storeSession({ token, admin: updatedAdmin })
  }

  const value: AuthContextValue = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isLoading,
      login,
      logout,
      updateAdmin,
    }),
    [admin, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
