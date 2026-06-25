import api from './api'
import type { ApiMessage, AuthSession, BootstrapStatus } from '../types/api'

type BootstrapPayload = {
  nom: string
  prenom: string
  email: string
  mot_de_passe: string
  fonction?: string
  telephone?: string
}

export const getBootstrapStatus = async (): Promise<BootstrapStatus> => {
  const { data } = await api.get('/admin/bootstrap/status')
  return data
}

export const bootstrapSuperAdmin = async (
  form: BootstrapPayload,
): Promise<AuthSession & ApiMessage> => {
  const { data } = await api.post('/admin/bootstrap', form)
  return data
}
