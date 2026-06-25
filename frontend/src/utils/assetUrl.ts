import { env } from '../config/env'

export const getAssetUrl = (path?: string | null, fallback = '') => {
  if (!path) return fallback
  if (/^https?:\/\//i.test(path)) return path

  return `${env.apiOrigin}${path.startsWith('/') ? path : `/${path}`}`
}
