const configuredApiOrigin = import.meta.env.VITE_API_URL?.trim()
const configuredApiIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
  configuredApiOrigin || '',
)
const productionDefaultApiOrigin =
  ['aga49.com', 'www.aga49.com'].includes(window.location.hostname)
    ? 'https://api.aga49.com'
    : window.location.origin
const useSameOrigin =
  configuredApiOrigin === 'same-origin' ||
  configuredApiIsLocal

const apiOrigin = (
  import.meta.env.PROD
    ? useSameOrigin
      ? productionDefaultApiOrigin
      : configuredApiOrigin || productionDefaultApiOrigin
    : configuredApiOrigin || 'http://localhost:5000'
).replace(/\/$/, '')

export const env = {
  apiOrigin,
  apiBaseUrl: `${apiOrigin}/api`,
}
