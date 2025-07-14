# Setup Guide - OpenAPI v1 Integration

## Übersicht

Die Anwendung wurde aktualisiert, um mit der OpenAPI v1 Spezifikation zu arbeiten. Die Mock-API implementiert jetzt die standardisierten Endpunkte und Datenstrukturen.

## Installation

### 1. Dependencies installieren

```bash
npm install
```

### 2. Mock-API starten

```bash
npm start
```

Die Mock-API läuft dann auf `http://localhost:8080`

### 3. Frontend starten

In einem neuen Terminal:

```bash
npm run frontend:dev
```

Das Frontend läuft dann auf `http://localhost:5173`

## Konfiguration

### API Base URL

Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
VITE_API_BASE=http://localhost:8080/v1
```

## Neue Features

### API Key Management

- **Erstellen**: `POST /v1/apikeys` mit `{ name, permissions: string[] }`
- **Auflisten**: `GET /v1/apikeys` 
- **Einzeln abrufen**: `GET /v1/apikeys/{id}`
- **Rotieren**: `POST /v1/apikeys/{id}/rotate`
- **Deaktivieren**: `PUT /v1/apikeys/{id}/deactivate`

### Usage Management

- **Usage Daten**: `GET /v1/usage/ai`
- **Usage Zusammenfassung**: `GET /v1/usage/ai/summarize`
- **Admin Usage**: `GET /v1/admin/usage/ai/summarize`

## Datenstruktur-Änderungen

### API Key Schema (neu)
```typescript
interface ApiKey {
  id: string
  name: string
  permissions: string[]  // Array statt String
  created_at: string
  expires_at: string
  is_active: boolean
  secret?: string  // nur bei Erstellung
}
```

### Permissions (neu)
- `read` - Lesezugriff
- `write` - Schreibzugriff  
- `admin` - Administratorzugriff
- `delete` - Löschzugriff

## Frontend-Anpassungen

### 1. Neue Interface-Definitionen
Die TypeScript-Interfaces wurden entsprechend der OpenAPI-Spezifikation aktualisiert.

### 2. API-Calls
Alle API-Calls verwenden jetzt die v1 Endpunkte:
- `http://localhost:8080/v1/apikeys` statt `http://localhost:3000/api/keys`
- Neue Request/Response-Formate

### 3. Permissions
- Checkbox-basierte Auswahl statt Dropdown
- Array-basierte Permissions statt String

### 4. Legacy-Kompatibilität
Die bestehenden Komponenten funktionieren weiterhin durch eine Legacy-Kompatibilitätsschicht.

## Testing

### API Key erstellen
```bash
curl -X POST http://localhost:8080/v1/apikeys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "permissions": ["read", "write"]
  }'
```

### API Keys auflisten
```bash
curl http://localhost:8080/v1/apikeys
```

### Usage Daten abrufen
```bash
curl "http://localhost:8080/v1/usage/ai?from_date=2024-01-01T00:00:00Z"
```

## Troubleshooting

### Port-Konflikte
- Mock-API: Port 8080
- Frontend: Port 5173
- Stelle sicher, dass die Ports frei sind

### CORS-Fehler
Die Mock-API hat CORS aktiviert. Falls Probleme auftreten, prüfe die CORS-Konfiguration.

### TypeScript-Fehler
Falls TypeScript-Fehler auftreten, führe aus:
```bash
npm run type-check
```

### Frontend Build
Für Produktion:
```bash
npm run frontend:build
npm run frontend:preview
```

## Migration von der alten API

### Alte Endpunkte
- `POST /api/generate-key` → `POST /v1/apikeys`
- `GET /api/keys` → `GET /v1/apikeys`
- `POST /api/revoke-key` → `PUT /v1/apikeys/{id}/deactivate`

### Datenstruktur
- `permissions: string` → `permissions: string[]`
- `status: string` → `is_active: boolean`
- `createdAt` → `created_at`
- `validUntil` → `expires_at` 