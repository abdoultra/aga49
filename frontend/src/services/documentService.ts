import api from './api'
import type {
  ApiMessage,
  DocumentPayload,
  DocumentResource,
  EntityId,
} from '../types/api'

const toFormData = (values: DocumentPayload) => {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  return formData
}

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = filename
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const getAdminDocuments = async (
  signal?: AbortSignal,
): Promise<DocumentResource[]> => {
  const { data } = await api.get('/documents/manage', { signal })
  return Array.isArray(data.documents) ? data.documents : []
}

export const getPublishedDocuments = async (
  signal?: AbortSignal,
): Promise<DocumentResource[]> => {
  const { data } = await api.get('/documents', { signal })
  return Array.isArray(data.documents) ? data.documents : []
}

export const createDocument = async (
  values: DocumentPayload,
): Promise<DocumentResource> => {
  const { data } = await api.post('/documents', toFormData(values))
  return data.document
}

export const updateDocument = async (
  id: EntityId,
  values: DocumentPayload,
): Promise<DocumentResource> => {
  const { data } = await api.put(`/documents/${id}`, toFormData(values))
  return data.document
}

export const deleteDocument = async (id: EntityId): Promise<ApiMessage> => {
  const { data } = await api.delete(`/documents/${id}`)
  return data
}

export const downloadDocument = async (
  document: DocumentResource,
  { admin = false }: { admin?: boolean } = {},
) => {
  const path = admin
    ? `/documents/manage/${document._id}/download`
    : `/documents/${document._id}/download`
  const { data } = await api.get(path, { responseType: 'blob' })
  saveBlob(data, document.originalName || document.title)
}
