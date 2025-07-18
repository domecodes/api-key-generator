import { getToken } from '@/auth/keycloak'
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

// Axios-Instanz erstellen
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080/v1',
  timeout: 10000,
})

// Request-Interceptor: Token automatisch hinzufügen
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Fehler beim Token-Abruf:', error)
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// Response-Interceptor: Token-Erneuerung bei 401-Fehlern
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.log('Token abgelaufen, versuche Erneuerung...')
      try {
        const token = await getToken()
        if (token && error.config) {
          // Request mit neuem Token wiederholen
          const originalRequest = error.config
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (tokenError) {
        console.error('Token-Erneuerung fehlgeschlagen:', tokenError)
      }
    }
    return Promise.reject(error)
  },
)

export default api
