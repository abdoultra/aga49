import api from './api'
import type { Admin, ApiMessage, EntityId } from '../types/api'

type AdminProfilePayload = Partial<
  Pick<Admin, 'nom' | 'prenom' | 'email' | 'telephone' | 'fonction'>
>

type PasswordPayload = {
  currentPassword?: string
  newPassword: string
}

type AdminAccountPayload = AdminProfilePayload & {
  mot_de_passe?: string
  role?: Admin['role']
  actif?: boolean
}

export const updateOwnProfile = async (
  values: AdminProfilePayload,
): Promise<Admin> => {
  const { data } = await api.put('/admin/profile', values)
  return data.admin
}

export const changeOwnPassword = async (
  values: PasswordPayload,
): Promise<ApiMessage> => {
  const { data } = await api.patch('/admin/profile/password', values)
  return data
}

export const getAdminAccounts = async (
  signal?: AbortSignal,
): Promise<Admin[]> => {
  const { data } = await api.get('/admin/accounts', { signal })
  return data.admins
}

export const createAdminAccount = async (
  values: AdminAccountPayload,
): Promise<Admin> => {
  const { data } = await api.post('/admin/register', values)
  return data.admin
}

export const updateAdminAccount = async (
  id: EntityId,
  values: AdminAccountPayload,
): Promise<Admin> => {
  const { data } = await api.put(`/admin/accounts/${id}`, values)
  return data.admin
}

export const resetAdminPassword = async (
  id: EntityId,
  newPassword: string,
): Promise<ApiMessage> => {
  const { data } = await api.patch(`/admin/accounts/${id}/password`, {
    newPassword,
  })
  return data
}

export const deleteAdminAccount = async (id: EntityId): Promise<ApiMessage> => {
  const { data } = await api.delete(`/admin/accounts/${id}`)
  return data
}
