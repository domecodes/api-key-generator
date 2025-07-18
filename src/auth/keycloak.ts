import Keycloak from 'keycloak-js'

// Keycloak-Konfiguration
const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'api-key-generator',
  clientId: 'api-key-generator-frontend',
}

// Keycloak-Instanz erstellen
const keycloak = new Keycloak(keycloakConfig)

// Keycloak initialisieren
export const initKeycloak = async (): Promise<boolean> => {
  try {
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
    return false
  }
}

// Token für API-Requests abrufen
export const getToken = async (): Promise<string | null> => {
  try {
    await keycloak.updateToken(30) // Token erneuern wenn es in 30 Sekunden abläuft
    return keycloak.token || null
  } catch (error) {
    console.error('Fehler beim Token-Update:', error)
    return null
  }
}

// Benutzerinformationen abrufen
export const getUserInfo = () => {
  return keycloak.tokenParsed
}

// Keycloak-Instanz exportieren (für erweiterte Funktionen)
export { keycloak }

export default keycloak
