# DekaRAG Mock API

Diese Mock-API implementiert die OpenAPI v1 Spezifikation für DekaRAG und kann als Grundlage für Frontend-Entwicklung verwendet werden.

## Installation

```bash
npm install
```

## Starten der Mock-API

```bash
npm start
```

Die API läuft dann auf `http://localhost:8080`

## Verfügbare Endpunkte

### API Key Management

- `POST /v1/apikeys` - Neuen API Key erstellen
- `GET /v1/apikeys` - Alle API Keys auflisten
- `GET /v1/apikeys/{id}` - Einzelnen API Key abrufen
- `POST /v1/apikeys/{id}/rotate` - API Key rotieren
- `PUT /v1/apikeys/{id}/deactivate` - API Key deaktivieren

### Usage Management

- `GET /v1/usage/ai` - AI Usage Daten abrufen
- `GET /v1/usage/ai/summarize` - Usage Zusammenfassung
- `GET /v1/admin/usage/ai/summarize` - Admin Usage Zusammenfassung

### Legacy Endpunkte (für Kompatibilität)

- `GET /api/keys` - Legacy Key Liste
- `GET /api/key-stats` - Legacy Key Statistiken
- `GET /api/health` - Health Check

## Beispiel-Requests

### API Key erstellen
```bash
curl -X POST http://localhost:8080/v1/apikeys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test API Key",
    "permissions": ["read", "write"]
  }'
```

### Usage Daten abrufen
```bash
curl "http://localhost:8080/v1/usage/ai?from_date=2024-01-01T00:00:00Z&to_date=2024-12-31T23:59:59Z"
```

### Usage Zusammenfassung
```bash
curl "http://localhost:8080/v1/usage/ai/summarize?by=month"
```

## Frontend-Integration

Die Mock-API ist kompatibel mit der OpenAPI-Spezifikation und kann direkt in Frontend-Anwendungen verwendet werden. Die Response-Formate entsprechen den definierten Schemas in der OpenAPI-Datei.

## Datenstruktur

### API Key Schema
```json
{
  "id": "uuid",
  "name": "string",
  "permissions": ["string"],
  "created_at": "date-time",
  "expires_at": "date-time",
  "is_active": "boolean",
  "secret": "string" // nur bei Erstellung
}
```

### Usage Response
```json
{
  "usage": [
    {
      "model": "string",
      "tokens_used": "integer",
      "cost": "number",
      "timestamp": "date-time"
    }
  ]
}
```

### Summary Response
```json
{
  "summary": {
    "total_tokens": "integer",
    "total_cost": "number",
    "by_model": "object",
    "by_user": "object",
    "by_period": "object"
  }
}
```
