import api from './api'
import type {
  ApiMessage,
  ContactMessage,
  ContactMessagePayload,
  ContactMessageStatus,
  EntityId,
} from '../types/api'

export const sendContactMessage = async (
  values: ContactMessagePayload,
): Promise<ApiMessage> => {
  const { data } = await api.post('/contact-messages', values)
  return data
}

export const getContactMessages = async (
  signal?: AbortSignal,
): Promise<ContactMessage[]> => {
  const { data } = await api.get('/contact-messages', { signal })
  return data.messages
}

export const updateContactMessageStatus = async (
  id: EntityId,
  statut: ContactMessageStatus,
): Promise<ContactMessage> => {
  const { data } = await api.patch(`/contact-messages/${id}/status`, {
    statut,
  })
  return data.contactMessage
}

export const deleteContactMessage = async (
  id: EntityId,
): Promise<ApiMessage> => {
  const { data } = await api.delete(`/contact-messages/${id}`)
  return data
}
