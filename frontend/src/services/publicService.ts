import api from './api'
import type {
  Admin,
  Album,
  AlbumDetails,
  EntityId,
  HealthResponse,
  Publication,
  PublicationType,
} from '../types/api'

interface PublicPublicationParams {
  type?: PublicationType
  status?: string
  upcoming?: boolean
}

export const getHealth = async (
  signal?: AbortSignal,
): Promise<HealthResponse> => {
  const { data } = await api.get('/health', { signal })
  return data
}

export const getLatestPublications = async (
  signal?: AbortSignal,
): Promise<Publication[]> => {
  const { data } = await api.get('/publications', {
    params: { status: 'published' },
    signal,
  })
  return data.publications
}

export const getUpcomingEvents = async (
  signal?: AbortSignal,
): Promise<Publication[]> => {
  const { data } = await api.get('/publications', {
    params: { type: 'event', upcoming: true },
    signal,
  })
  return data.publications
}

export const getPublicPublications = async (
  params: PublicPublicationParams,
  signal?: AbortSignal,
): Promise<Publication[]> => {
  const { data } = await api.get('/publications', { params, signal })
  return data.publications
}

export const getPublicPublication = async (
  id: EntityId,
  signal?: AbortSignal,
): Promise<Publication> => {
  const { data } = await api.get(`/publications/${id}`, { signal })
  return data.publication
}

export const getAlbums = async (signal?: AbortSignal): Promise<Album[]> => {
  const { data } = await api.get('/albums', { signal })
  return data.albums
}

export const getBoardMembers = async (
  signal?: AbortSignal,
): Promise<Admin[]> => {
  const { data } = await api.get('/admin/board', { signal })
  return data.admins
}

export const getAlbumDetails = async (
  id: EntityId,
  signal?: AbortSignal,
): Promise<AlbumDetails> => {
  const { data } = await api.get(`/albums/${id}`, { signal })
  return data
}
