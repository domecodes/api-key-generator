import Keycloak from 'keycloak-js'

// Development Mode: Mock Keycloak für lokale Entwicklung
const isDevelopment = import.meta.env.DEV
const useMockAuth = isDevelopment && import.meta.env.VITE_USE_MOCK_AUTH === 'true'

// Keycloak-Konfiguration
const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'api-key-generator',
  clientId: 'api-key-generator-frontend',
}

// Mock Keycloak für Entwicklung
class MockKeycloak {
  private _authenticated = false
  private _token: string | null = null
  private _tokenParsed: any = null

  constructor() {
    // Mock-Token für Entwicklung
    this._tokenParsed = {
      sub: 'mock-user-123',
      email: 'dev@example.com',
      name: 'Development User',
      preferred_username: 'devuser',
      realm_access: {
        roles: ['user'],
      },
      resource_access: {
        'api-key-generator-frontend': {
          roles: ['user'],
        },
      },
    }
  }

  async init(options: any): Promise<boolean> {
    console.log('Mock Keycloak: Initialisierung...')

    // Simuliere Login-Formular für verschiedene Rollen
    if (options.onLoad === 'login-required') {
      const role = localStorage.getItem('mock-role') || 'user'
      this.setMockRole(role)
    }

    this._authenticated = true
    console.log('Mock Keycloak: Authentifiziert als', this._tokenParsed.realm_access.roles[0])
    return true
  }

  setMockRole(role: string) {
    const roles = [role]
    this._tokenParsed = {
      ...this._tokenParsed,
      realm_access: { roles },
      resource_access: {
        'api-key-generator-frontend': { roles },
      },
    }
    localStorage.setItem('mock-role', role)
  }

  async updateToken(minValidity: number): Promise<boolean> {
    return true
  }

  logout(options?: any) {
    this._authenticated = false
    this._token = null
    console.log('Mock Keycloak: Logout')
  }

  get authenticated(): boolean {
    return this._authenticated
  }

  get token(): string | null {
    return this._token
  }

  get tokenParsed(): any {
    return this._tokenParsed
  }
}

// Rollen-Definitionen
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// API-Berechtigungen pro Rolle
export const ROLE_PERMISSIONS = {
  [UserRole.USER]: {
    canViewOwnKeys: true,
    canCreateKeys: true,
    canEditOwnKeys: true,
    canDeactivateOwnKeys: true,
    canViewOwnUsage: true,
    canViewAdminUsage: false,
    canManageUsers: false,
  },
  [UserRole.ADMIN]: {
    canViewOwnKeys: true,
    canCreateKeys: true,
    canEditOwnKeys: true,
    canDeactivateOwnKeys: true,
    canViewOwnUsage: true,
    canViewAdminUsage: true,
    canManageUsers: false,
  },
  [UserRole.SUPER_ADMIN]: {
    canViewOwnKeys: true,
    canCreateKeys: true,
    canEditOwnKeys: true,
    canDeactivateOwnKeys: true,
    canViewOwnUsage: true,
    canViewAdminUsage: true,
    canManageUsers: true,
  },
}

// Keycloak-Instanz erstellen (Mock oder echt)
const keycloak = useMockAuth ? new MockKeycloak() : new Keycloak(keycloakConfig)

// Keycloak initialisieren
export const initKeycloak = async (): Promise<boolean> => {
  try {
    if (useMockAuth) {
      console.log('🔧 Mock Keycloak wird verwendet (Entwicklungsmodus)')
      console.log('💡 Tipp: Setze localStorage.setItem("mock-role", "admin") für Admin-Rolle')
      console.log(
        '💡 Tipp: Setze localStorage.setItem("mock-role", "super_admin") für Super-Admin-Rolle',
      )
    }

    const authenticated = await keycloak.init({
      onLoad: 'login-required', // Erzwingt Login beim Laden
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      checkLoginIframe: false, // Deaktiviert iframe-basierte Token-Überprüfung
      enableLogging: true, // Für Debugging
    })

    console.log('Keycloak initialisiert:', authenticated)
    return authenticated
  } catch (error) {
    console.error('Fehler bei Keycloak-Initialisierung:', error)

    // Fallback zu Mock-Auth wenn Keycloak nicht verfügbar
    if (isDevelopment && !useMockAuth) {
      console.log('🔄 Fallback zu Mock-Auth (Keycloak nicht verfügbar)')
      const mockKeycloak = new MockKeycloak()
      const authenticated = await mockKeycloak.init({ onLoad: 'login-required' })
      Object.assign(keycloak, mockKeycloak)
      return authenticated
    }

    return false
  }
}

// JWT Token Utilities
function parseJwtToken(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Fehler beim Parsen des JWT-Tokens:', error)
    return null
  }
}

// Token für API-Requests abrufen
export const getToken = async (): Promise<string | null> => {
  try {
    if (useMockAuth || keycloak instanceof MockKeycloak) {
      // Mock-Token mit echten JWT-Struktur
      const mockPayload = {
        sub: keycloak.tokenParsed?.sub || 'mock-user-123',
        email: keycloak.tokenParsed?.email || 'dev@example.com',
        name: keycloak.tokenParsed?.name || 'Development User',
        realm_access: keycloak.tokenParsed?.realm_access || { roles: ['user'] },
        resource_access: keycloak.tokenParsed?.resource_access || {
          'api-key-generator-frontend': { roles: ['user'] },
        },
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 Stunde gültig
      }

      // Erstelle Mock-JWT (Header.Payload.Signature)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      const payload = btoa(JSON.stringify(mockPayload))
      const signature = 'mock-signature'

      return `${header}.${payload}.${signature}`
    }

    await keycloak.updateToken(30) // Token erneuern wenn es in 30 Sekunden abläuft
    return keycloak.token || null
  } catch (error) {
    console.error('Fehler beim Token-Update:', error)
    return null
  }
}

// JWT-Token validieren und parsen
export const validateAndParseToken = (token: string): any => {
  if (!token) return null

  const parsed = parseJwtToken(token)
  if (!parsed) return null

  // Prüfe Token-Ablauf
  const now = Math.floor(Date.now() / 1000)
  if (parsed.exp && parsed.exp < now) {
    console.warn('JWT-Token ist abgelaufen')
    return null
  }

  return parsed
}

// Token-Informationen für Debugging
export const getTokenInfo = (token: string): any => {
  const parsed = validateAndParseToken(token)
  if (!parsed) return null

  return {
    userId: parsed.sub,
    email: parsed.email,
    name: parsed.name,
    roles: parsed.realm_access?.roles || [],
    clientRoles: parsed.resource_access?.['api-key-generator-frontend']?.roles || [],
    issuedAt: parsed.iat ? new Date(parsed.iat * 1000) : null,
    expiresAt: parsed.exp ? new Date(parsed.exp * 1000) : null,
    isExpired: parsed.exp ? parsed.exp < Math.floor(Date.now() / 1000) : false,
  }
}

// Benutzerinformationen abrufen
export const getUserInfo = () => {
  return keycloak.tokenParsed
}

// Benutzer-Rollen abrufen
export const getUserRoles = (): UserRole[] => {
  if (!keycloak.tokenParsed) return []

  // Rollen aus dem JWT-Token extrahieren
  const realmAccess = keycloak.tokenParsed.realm_access
  const resourceAccess = keycloak.tokenParsed.resource_access

  const roles: UserRole[] = []

  // Realm-Rollen prüfen (filtere System-Rollen)
  if (realmAccess?.roles) {
    const realmRoles = realmAccess.roles.filter(
      (role: string) =>
        !role.startsWith('offline_access') &&
        !role.startsWith('default-roles') &&
        !role.startsWith('uma_authorization') &&
        !role.startsWith('realm-management'),
    )

    if (realmRoles.includes('super_admin')) {
      roles.push(UserRole.SUPER_ADMIN)
    } else if (realmRoles.includes('admin')) {
      roles.push(UserRole.ADMIN)
    } else if (realmRoles.includes('user')) {
      roles.push(UserRole.USER)
    }
  }

  // Client-spezifische Rollen prüfen
  if (resourceAccess && resourceAccess['api-key-generator-frontend']?.roles) {
    const clientRoles = resourceAccess['api-key-generator-frontend'].roles
    if (clientRoles.includes('super_admin') && !roles.includes(UserRole.SUPER_ADMIN)) {
      roles.push(UserRole.SUPER_ADMIN)
    } else if (clientRoles.includes('admin') && !roles.includes(UserRole.ADMIN)) {
      roles.push(UserRole.ADMIN)
    } else if (clientRoles.includes('user') && !roles.includes(UserRole.USER)) {
      roles.push(UserRole.USER)
    }
  }

  // Fallback: Wenn keine Rollen gefunden, Standard-User-Rolle
  if (roles.length === 0) {
    console.warn('Keine gültigen Rollen gefunden, verwende Standard-User-Rolle')
    console.log('Verfügbare Realm-Rollen:', realmAccess?.roles || [])
    console.log(
      'Verfügbare Client-Rollen:',
      resourceAccess?.['api-key-generator-frontend']?.roles || [],
    )
    roles.push(UserRole.USER)
  }

  console.log('Gefilterte Rollen:', roles)
  return roles
}

// Höchste Rolle des Benutzers abrufen
export const getHighestRole = (): UserRole => {
  const roles = getUserRoles()

  if (roles.includes(UserRole.SUPER_ADMIN)) {
    return UserRole.SUPER_ADMIN
  } else if (roles.includes(UserRole.ADMIN)) {
    return UserRole.ADMIN
  } else {
    return UserRole.USER
  }
}

// Berechtigung prüfen
export const hasPermission = (permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]): boolean => {
  const userRole = getHighestRole()
  return ROLE_PERMISSIONS[userRole][permission] || false
}

// Mehrere Berechtigungen prüfen (alle müssen erfüllt sein)
export const hasAllPermissions = (
  permissions: (keyof (typeof ROLE_PERMISSIONS)[UserRole])[],
): boolean => {
  return permissions.every((permission) => hasPermission(permission))
}

// Mindestens eine Berechtigung prüfen
export const hasAnyPermission = (
  permissions: (keyof (typeof ROLE_PERMISSIONS)[UserRole])[],
): boolean => {
  return permissions.some((permission) => hasPermission(permission))
}

// Benutzer-ID abrufen
export const getUserId = (): string | null => {
  return keycloak.tokenParsed?.sub || null
}

// Benutzer-E-Mail abrufen
export const getUserEmail = (): string | null => {
  return keycloak.tokenParsed?.email || null
}

// Mock-Rolle für Entwicklung setzen
export const setMockRole = (role: string) => {
  if (keycloak instanceof MockKeycloak) {
    keycloak.setMockRole(role)
  }
}

// Keycloak-Instanz exportieren (für erweiterte Funktionen)
export { keycloak }

export default keycloak
