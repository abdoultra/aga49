import type { Admin, AuthSession } from '../types/api'

const TOKEN_KEY = 'aga_admin_token'
const ADMIN_KEY = 'aga_admin'

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredAdmin = (): Admin | null => {
  const storedAdmin = localStorage.getItem(ADMIN_KEY)

  if (!storedAdmin) return null

  try {
    return JSON.parse(storedAdmin)
  } catch {
    localStorage.removeItem(ADMIN_KEY)
    return null
  }
}

export const storeSession = ({ token, admin }: AuthSession) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_KEY)
}
