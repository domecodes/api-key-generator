# Setup Anleitung

## 🚀 Schnellstart

### 1. Dependencies installieren

```bash
npm install
```

### 2. Mock-API Server starten (Port 3001)

```bash
npm run dev
```

### 3. Frontend Development Server starten (Port 5173)

```bash
npm run frontend:dev
```

### 4. Oder beide Server gleichzeitig starten

```bash
npm run dev:all
```

## 🔧 Konfiguration

### Mock-Authentifizierung für Entwicklung

Das System verwendet automatisch Mock-Authentifizierung wenn Keycloak nicht verfügbar ist. Rollen werden aus den `groups` im JWT-Token gelesen:

**Im Browser Console:**

```javascript
// API-Default-Rolle (Standard)
localStorage.setItem('mock-role', 'api-default')

// API-Stream-Rolle
localStorage.setItem('mock-role', 'api-stream')

// API-Admin-Rolle
localStorage.setItem('mock-role', 'api-admin')
```

**Oder direkt in der App:**

```javascript
import { setMockRole } from '@/auth/keycloak'

// Rolle ändern
setMockRole('api-admin')
```

### Ports

- **Mock-API Server**: `http://localhost:3001`
- **Frontend Development**: `http://localhost:5173`
- **Keycloak (Produktion)**: `http://localhost:8080`

## 🎯 Verfügbare Endpunkte

### OpenAPI v1 Endpunkte (mit JWT Auth)

- `POST http://localhost:3001/v1/apikeys` - Create API key
- `GET  http://localhost:3001/v1/apikeys` - List API keys
- `GET  http://localhost:3001/v1/apikeys/:id` - Get single API key
- `POST http://localhost:3001/v1/apikeys/:id/rotate` - Rotate API key
- `PUT  http://localhost:3001/v1/apikeys/:id/deactivate` - Deactivate API key
- `GET  http://localhost:3001/v1/usage/ai` - Get usage data
- `GET  http://localhost:3001/v1/usage/ai/summarize` - Get usage summary

### Admin Endpunkte

- `GET  http://localhost:3001/v1/admin/apikeys` - Get all API keys
- `POST http://localhost:3001/v1/admin/apikeys` - Create API key for user
- `PUT  http://localhost:3001/v1/admin/apikeys/:id/deactivate` - Deactivate any API key
- `GET  http://localhost:3001/v1/admin/usage/ai` - Get all usage data
- `GET  http://localhost:3001/v1/admin/usage/ai/summarize` - Admin usage summary

### Super Admin Endpunkte

- `GET  http://localhost:3001/v1/admin/users` - Get all users
- `PUT  http://localhost:3001/v1/admin/users/:id/role` - Update user role
- `PUT  http://localhost:3001/v1/admin/users/:id/deactivate` - Deactivate user

## 🔐 Rollen und Berechtigungen

### API-Default

- Eigene API-Keys verwalten
- Eigene Usage einsehen
- API-Keys erstellen, bearbeiten, deaktivieren
- Zugriff auf alle APIs außer `/v1/admin/usage/ai/summarize`

### API-Stream

- Eigene API-Keys verwalten
- Eigene Usage einsehen
- API-Keys erstellen, bearbeiten, deaktivieren
- Zugriff auf alle APIs außer `/v1/admin/usage/ai/summarize`

### API-Admin

- Alle API-Keys einsehen
- API-Keys für andere Benutzer erstellen
- Admin Usage einsehen (Nutzung aller Accounts)
- Zugriff auf alle APIs inklusive `/v1/admin/usage/ai/summarize`
- Alle API-Default und API-Stream Funktionen

## 🧪 Testing

### JWT Token Testing

```bash
# API-Default-Rolle (Standard)
curl -H "Authorization: Bearer token" http://localhost:3001/v1/apikeys

# API-Stream-Rolle
curl -H "Authorization: Bearer token" "http://localhost:3001/v1/apikeys?token=api-stream"

# API-Admin-Rolle
curl -H "Authorization: Bearer token" "http://localhost:3001/v1/apikeys?token=api-admin"
```

## 🚨 Troubleshooting

### Keycloak nicht verfügbar

Das System fällt automatisch auf Mock-Authentifizierung zurück. Siehe Mock-Authentifizierung oben.

### Port-Konflikte

- Mock-API läuft auf Port 3001
- Keycloak sollte auf Port 8080 laufen
- Frontend läuft auf Port 5173

### Rollen nicht sichtbar

1. Browser Console öffnen
2. `localStorage.setItem('mock-role', 'admin')` ausführen
3. Seite neu laden
