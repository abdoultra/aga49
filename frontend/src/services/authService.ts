import api from './api'
import type { Admin, AuthSession, LoginCredentials } from '../types/api'

export const loginAdmin = async (
  credentials: LoginCredentials,
): Promise<AuthSession> => {
  const { data } = await api.post('/admin/login', credentials)
  return data
}

export const getAdminProfile = async (): Promise<Admin> => {
  const { data } = await api.get('/admin/profile')
  return data.admin
}
