import api from './api'
import type {
  ApiMessage,
  EntityId,
  Publication,
  PublicationPayload,
} from '../types/api'

const toFormData = (publication: PublicationPayload) => {
  const formData = new FormData()

  Object.entries(publication).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  return formData
}

export const getAdminPublications = async (
  signal?: AbortSignal,
): Promise<Publication[]> => {
  const { data } = await api.get('/publications/manage', { signal })
  return data.publications
}

export const createPublication = async (
  publication: PublicationPayload,
): Promise<Publication> => {
  const { data } = await api.post('/publications', toFormData(publication))
  return data.publication
}

export const updatePublication = async (
  id: EntityId,
  publication: PublicationPayload,
): Promise<Publication> => {
  const { data } = await api.put(
    `/publications/${id}`,
    toFormData(publication),
  )
  return data.publication
}

export const deletePublication = async (id: EntityId): Promise<ApiMessage> => {
  const { data } = await api.delete(`/publications/${id}`)
  return data
}
