import api from '@/axios/api'

// API-Service für API-Keys
export const apiKeyService = {
  // Alle API-Keys abrufen
  async getApiKeys() {
    const response = await api.get('/apikeys')
    return response.data
  },

  // Neuen API-Key erstellen
  async createApiKey(name: string, permissions: string[]) {
    const response = await api.post('/apikeys', {
      name,
      permissions,
    })
    return response.data
  },

  // API-Key deaktivieren
  async deactivateApiKey(keyId: string) {
    const response = await api.put(`/apikeys/${keyId}/deactivate`)
    return response.data
  },

  // API-Key rotieren
  async rotateApiKey(keyId: string, name: string, permissions: string[]) {
    const response = await api.post(`/apikeys/${keyId}/rotate`, {
      name,
      permissions,
    })
    return response.data
  },
}

export default apiKeyService
