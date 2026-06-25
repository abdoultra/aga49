import api from './api'
import type {
  Album,
  AlbumDetails,
  AlbumPayload,
  ApiMessage,
  EntityId,
  Photo,
  PhotoPayload,
} from '../types/api'

const toFormData = (values: AlbumPayload | PhotoPayload) => {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      formData.append(key, value instanceof File ? value : String(value))
    }
  })

  return formData
}

export const getAlbums = async (signal?: AbortSignal): Promise<Album[]> => {
  const { data } = await api.get('/albums', { signal })
  return data.albums
}

export const getAlbum = async (
  id: EntityId,
  signal?: AbortSignal,
): Promise<AlbumDetails> => {
  const { data } = await api.get(`/albums/${id}`, { signal })
  return data
}

export const createAlbum = async (values: AlbumPayload): Promise<Album> => {
  const { data } = await api.post('/albums', toFormData(values))
  return data.album
}

export const updateAlbum = async (
  id: EntityId,
  values: AlbumPayload,
): Promise<Album> => {
  const { data } = await api.put(`/albums/${id}`, toFormData(values))
  return data.album
}

export const deleteAlbum = async (id: EntityId): Promise<ApiMessage> => {
  const { data } = await api.delete(`/albums/${id}`)
  return data
}

export const createPhoto = async (
  albumId: EntityId,
  values: PhotoPayload,
): Promise<Photo> => {
  const { data } = await api.post(
    `/albums/${albumId}/photos`,
    toFormData(values),
  )
  return data.photo
}

export const updatePhoto = async (
  id: EntityId,
  values: PhotoPayload,
): Promise<Photo> => {
  const { data } = await api.put(`/photos/${id}`, toFormData(values))
  return data.photo
}

export const deletePhoto = async (id: EntityId): Promise<ApiMessage> => {
  const { data } = await api.delete(`/photos/${id}`)
  return data
}
