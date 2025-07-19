import { hasPermission } from '@/auth/keycloak'
import api from '@/axios/api'

// API-Service für API-Keys
export const apiKeyService = {
  // Alle API-Keys abrufen (rollenbasiert)
  async getApiKeys() {
    // Prüfe Berechtigung
    if (!hasPermission('canViewOwnKeys')) {
      throw new Error('Keine Berechtigung zum Anzeigen von API-Keys')
    }

    const response = await api.get('/apikeys')
    return response.data
  },

  // Neuen API-Key erstellen (rollenbasiert)
  async createApiKey(name: string, permissions: string[]) {
    // Prüfe Berechtigung
    if (!hasPermission('canCreateKeys')) {
      throw new Error('Keine Berechtigung zum Erstellen von API-Keys')
    }

    const response = await api.post('/apikeys', {
      name,
      permissions,
    })
    return response.data
  },

  // API-Key deaktivieren (rollenbasiert)
  async deactivateApiKey(keyId: string) {
    // Prüfe Berechtigung
    if (!hasPermission('canDeactivateOwnKeys')) {
      throw new Error('Keine Berechtigung zum Deaktivieren von API-Keys')
    }

    const response = await api.put(`/apikeys/${keyId}/deactivate`)
    return response.data
  },

  // API-Key rotieren (rollenbasiert)
  async rotateApiKey(keyId: string, name: string, permissions: string[]) {
    // Prüfe Berechtigung
    if (!hasPermission('canEditOwnKeys')) {
      throw new Error('Keine Berechtigung zum Bearbeiten von API-Keys')
    }

    const response = await api.post(`/apikeys/${keyId}/rotate`, {
      name,
      permissions,
    })
    return response.data
  },

  // Admin: Alle API-Keys aller Benutzer abrufen
  async getAllApiKeys() {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canViewAdminUsage')) {
      throw new Error('Keine Admin-Berechtigung zum Anzeigen aller API-Keys')
    }

    const response = await api.get('/admin/apikeys')
    return response.data
  },

  // Admin: API-Key für bestimmten Benutzer erstellen
  async createApiKeyForUser(userId: string, name: string, permissions: string[]) {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canManageUsers')) {
      throw new Error('Keine Admin-Berechtigung zum Erstellen von API-Keys für andere Benutzer')
    }

    const response = await api.post('/admin/apikeys', {
      userId,
      name,
      permissions,
    })
    return response.data
  },

  // Admin: API-Key für anderen Benutzer deaktivieren
  async deactivateApiKeyForUser(keyId: string) {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canManageUsers')) {
      throw new Error('Keine Admin-Berechtigung zum Deaktivieren von API-Keys anderer Benutzer')
    }

    const response = await api.put(`/admin/apikeys/${keyId}/deactivate`)
    return response.data
  },
}

// Usage-Service für Verbrauchsdaten
export const usageService = {
  // Eigene Usage-Daten abrufen
  async getOwnUsage(fromDate?: string, toDate?: string) {
    // Prüfe Berechtigung
    if (!hasPermission('canViewOwnUsage')) {
      throw new Error('Keine Berechtigung zum Anzeigen von Usage-Daten')
    }

    const params = new URLSearchParams()
    if (fromDate) params.append('from_date', fromDate)
    if (toDate) params.append('to_date', toDate)

    const response = await api.get(`/usage/ai?${params.toString()}`)
    return response.data
  },

  // Usage-Summary abrufen
  async getUsageSummary(fromDate?: string, toDate?: string, by?: string) {
    // Prüfe Berechtigung
    if (!hasPermission('canViewOwnUsage')) {
      throw new Error('Keine Berechtigung zum Anzeigen von Usage-Daten')
    }

    const params = new URLSearchParams()
    if (fromDate) params.append('from_date', fromDate)
    if (toDate) params.append('to_date', toDate)
    if (by) params.append('by', by)

    const response = await api.get(`/usage/ai/summarize?${params.toString()}`)
    return response.data
  },

  // Admin: Alle Usage-Daten abrufen
  async getAllUsage(fromDate?: string, toDate?: string) {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canViewAdminUsage')) {
      throw new Error('Keine Admin-Berechtigung zum Anzeigen aller Usage-Daten')
    }

    const params = new URLSearchParams()
    if (fromDate) params.append('from_date', fromDate)
    if (toDate) params.append('to_date', toDate)

    const response = await api.get(`/admin/usage/ai?${params.toString()}`)
    return response.data
  },

  // Admin: Usage-Summary für alle Benutzer
  async getAdminUsageSummary(fromDate?: string, toDate?: string, by?: string) {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canViewAdminUsage')) {
      throw new Error('Keine Admin-Berechtigung zum Anzeigen der Admin-Usage-Summary')
    }

    const params = new URLSearchParams()
    if (fromDate) params.append('from_date', fromDate)
    if (toDate) params.append('to_date', toDate)
    if (by) params.append('by', by)

    const response = await api.get(`/admin/usage/ai/summarize?${params.toString()}`)
    return response.data
  },
}

// User-Management-Service (nur für Super-Admins)
export const userService = {
  // Alle Benutzer abrufen
  async getAllUsers() {
    // Prüfe Super-Admin-Berechtigung
    if (!hasPermission('canManageUsers')) {
      throw new Error('Keine Super-Admin-Berechtigung zum Anzeigen aller Benutzer')
    }

    const response = await api.get('/admin/users')
    return response.data
  },

  // Benutzer-Rolle ändern
  async updateUserRole(userId: string, role: string) {
    // Prüfe Super-Admin-Berechtigung
    if (!hasPermission('canManageUsers')) {
      throw new Error('Keine Super-Admin-Berechtigung zum Ändern von Benutzer-Rollen')
    }

    const response = await api.put(`/admin/users/${userId}/role`, {
      role,
    })
    return response.data
  },

  // Benutzer deaktivieren
  async deactivateUser(userId: string) {
    // Prüfe Super-Admin-Berechtigung
    if (!hasPermission('canManageUsers')) {
      throw new Error('Keine Super-Admin-Berechtigung zum Deaktivieren von Benutzern')
    }

    const response = await api.put(`/admin/users/${userId}/deactivate`)
    return response.data
  },
}

export default apiKeyService
