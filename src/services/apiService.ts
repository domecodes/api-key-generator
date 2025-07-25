import {
  createApiKeyV1,
  deactivateKeyV1,
  getAllApiKeysV1,
  getApiKeyV1,
  rotateKeyV1,
  type DekaRagApiKeyRequest,
} from '@/api/apikeys/apikeys'
import type {
  DekaRagApiKey,
  DekaRagApiKeyWithSecret,
  SummaryUsageResponse,
  UsageResponse,
} from '@/api/types/types'
import {
  adminUsageAISummaryGetV1,
  usageAIGetV1,
  usageAISummaryGetV1,
  type AdminUsageAISummaryGetV1Params,
  type UsageAIGetV1Params,
  type UsageAISummaryGetV1Params,
} from '@/api/usage/usage'
import { hasPermission } from '@/auth/keycloak'

// API-Service für API-Keys
export const apiKeyService = {
  // Alle API-Keys abrufen (rollenbasiert)
  async getApiKeys(): Promise<DekaRagApiKey[]> {
    // Prüfe Berechtigung
    if (!hasPermission('canViewOwnKeys')) {
      throw new Error('Keine Berechtigung zum Anzeigen von API-Keys')
    }

    const response = await getAllApiKeysV1()
    return response.data
  },

  // Neuen API-Key erstellen (rollenbasiert)
  async createApiKey(name: string, permissions: string[]): Promise<DekaRagApiKeyWithSecret> {
    // Prüfe Berechtigung
    if (!hasPermission('canCreateKeys')) {
      throw new Error('Keine Berechtigung zum Erstellen von API-Keys')
    }

    const request: DekaRagApiKeyRequest = { name, permissions }
    const response = await createApiKeyV1(request)
    return response.data
  },

  // API-Key deaktivieren (rollenbasiert)
  async deactivateApiKey(keyId: string): Promise<void> {
    // Prüfe Berechtigung
    if (!hasPermission('canDeactivateOwnKeys')) {
      throw new Error('Keine Berechtigung zum Deaktivieren von API-Keys')
    }

    await deactivateKeyV1(keyId)
  },

  // API-Key rotieren (rollenbasiert)
  async rotateApiKey(
    keyId: string,
    name: string,
    permissions: string[],
  ): Promise<DekaRagApiKeyWithSecret> {
    // Prüfe Berechtigung
    if (!hasPermission('canEditOwnKeys')) {
      throw new Error('Keine Berechtigung zum Bearbeiten von API-Keys')
    }

    const request: DekaRagApiKeyRequest = { name, permissions }
    const response = await rotateKeyV1(keyId, request)
    return response.data
  },

  // Einzelnen API-Key abrufen
  async getApiKey(keyId: string): Promise<DekaRagApiKey> {
    // Prüfe Berechtigung
    if (!hasPermission('canViewOwnKeys')) {
      throw new Error('Keine Berechtigung zum Anzeigen von API-Keys')
    }

    const response = await getApiKeyV1(keyId)
    return response.data
  },

  // Admin: Alle API-Keys aller Benutzer abrufen (gleiche Funktion wie getApiKeys, da alle Benutzer alle Keys sehen)
  async getAllApiKeys(): Promise<DekaRagApiKey[]> {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canViewAdminUsage')) {
      throw new Error('Keine Admin-Berechtigung zum Anzeigen aller API-Keys')
    }

    const response = await getAllApiKeysV1()
    return response.data
  },
}

// Usage-Service für Verbrauchsdaten
export const usageService = {
  // Eigene Usage-Daten abrufen
  async getOwnUsage(fromDate?: string, toDate?: string, model?: string): Promise<UsageResponse> {
    // Prüfe Berechtigung
    if (!hasPermission('canViewOwnUsage')) {
      throw new Error('Keine Berechtigung zum Anzeigen von Usage-Daten')
    }

    const params: UsageAIGetV1Params = {}
    if (fromDate) params.from_date = fromDate
    if (toDate) params.to_date = toDate
    if (model) params.model = model

    const response = await usageAIGetV1(params)
    return response.data
  },

  // Usage-Summary abrufen
  async getUsageSummary(
    fromDate?: string,
    toDate?: string,
    by?: string,
  ): Promise<SummaryUsageResponse> {
    // Prüfe Berechtigung
    if (!hasPermission('canViewOwnUsage')) {
      throw new Error('Keine Berechtigung zum Anzeigen von Usage-Daten')
    }

    const params: UsageAISummaryGetV1Params = {}
    if (fromDate) params.from_date = fromDate
    if (toDate) params.to_date = toDate
    if (by) params.by = by

    const response = await usageAISummaryGetV1(params)
    return response.data
  },

  // Admin: Usage-Summary für alle Benutzer
  async getAdminUsageSummary(
    fromDate?: string,
    toDate?: string,
    by?: string,
  ): Promise<SummaryUsageResponse> {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canViewAdminUsage')) {
      throw new Error('Keine Admin-Berechtigung zum Anzeigen der Admin-Usage-Summary')
    }

    const params: AdminUsageAISummaryGetV1Params = {}
    if (fromDate) params.from_date = fromDate
    if (toDate) params.to_date = toDate
    if (by) params.by = by

    const response = await adminUsageAISummaryGetV1(params)
    return response.data
  },
}

// User-Management-Service (nur für API-Admins)
export const userService = {
  // Alle Benutzer abrufen
  async getAllUsers() {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canManageUsers')) {
      throw new Error('Keine Admin-Berechtigung zum Anzeigen aller Benutzer')
    }

    // TODO: Implementiere User-API-Endpunkte wenn verfügbar
    throw new Error('User-Management-API noch nicht implementiert')
  },

  // Benutzer-Rolle ändern
  async updateUserRole(userId: string, role: string) {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canManageUsers')) {
      throw new Error('Keine Admin-Berechtigung zum Ändern von Benutzer-Rollen')
    }

    // TODO: Implementiere User-API-Endpunkte wenn verfügbar
    throw new Error('User-Management-API noch nicht implementiert')
  },

  // Benutzer deaktivieren
  async deactivateUser(userId: string) {
    // Prüfe Admin-Berechtigung
    if (!hasPermission('canManageUsers')) {
      throw new Error('Keine Admin-Berechtigung zum Deaktivieren von Benutzern')
    }

    // TODO: Implementiere User-API-Endpunkte wenn verfügbar
    throw new Error('User-Management-API noch nicht implementiert')
  },
}

export default apiKeyService
