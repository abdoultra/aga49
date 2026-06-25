const configuredApiOrigin = import.meta.env.VITE_API_URL?.trim()
const configuredApiIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
  configuredApiOrigin || '',
)
const useSameOrigin =
  !configuredApiOrigin ||
  configuredApiOrigin === 'same-origin' ||
  configuredApiIsLocal

const apiOrigin = (
  import.meta.env.PROD
    ? useSameOrigin
      ? window.location.origin
      : configuredApiOrigin
    : configuredApiOrigin || 'http://localhost:5000'
).replace(/\/$/, '')

export const env = {
  apiOrigin,
  apiBaseUrl: `${apiOrigin}/api`,
}
