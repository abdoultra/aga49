import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { env } from '../config/env'
import {
  clearSession,
  getStoredToken,
} from '../utils/authStorage'
import type { ApiError } from '../types/api'

const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401 && getStoredToken()) {
      clearSession()
      window.dispatchEvent(new Event('aga:unauthorized'))
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Une erreur inattendue est survenue'

    const apiError: ApiError = new Error(message)
    apiError.status = error.response?.status
    apiError.data = error.response?.data

    return Promise.reject(apiError)
  },
)

export default api
