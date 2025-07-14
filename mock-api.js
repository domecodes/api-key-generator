import cors from 'cors'
import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const port = 8080 // Port auf 8080 geändert, um mit OpenAPI-Spec zu übereinstimmen

app.use(cors())
app.use(express.json())

// Logging Middleware für alle Requests
app.use((req, res, next) => {
  const start = Date.now()
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - Request started`)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[${timestamp}] Request Body:`, JSON.stringify(req.body, null, 2))
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`[${timestamp}] Query Params:`, JSON.stringify(req.query, null, 2))
  }
  if (req.params && Object.keys(req.params).length > 0) {
    console.log(`[${timestamp}] Path Params:`, JSON.stringify(req.params, null, 2))
  }
  
  // Log response
  const originalSend = res.send
  res.send = function(data) {
    const duration = Date.now() - start
    console.log(`[${timestamp}] ${req.method} ${req.path} - Response ${res.statusCode} (${duration}ms)`)
    if (data && typeof data === 'string' && data.length < 1000) {
      console.log(`[${timestamp}] Response Body:`, data)
    } else if (data && typeof data === 'object') {
      console.log(`[${timestamp}] Response Body:`, JSON.stringify(data, null, 2))
    }
    originalSend.call(this, data)
  }
  
  next()
})

// In-Memory-Datenbank für API Keys (entsprechend OpenAPI Schema)
const apiKeys = {} // { [id]: { id, name, permissions, created_at, expires_at, is_active, secret } }
const usageData = {} // { [userId]: [{ model, tokens_used, cost, timestamp }] }

// Hilfsfunktionen
function generateApiKey() {
  return 'dk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function createApiKeyObject(name, permissions) {
  const now = new Date()
  const expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
  
  return {
    id: uuidv4(),
    name: name,
    permissions: permissions,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    is_active: true,
    secret: generateApiKey()
  }
}

// OpenAPI v1 Endpunkte entsprechend der Spezifikation

// POST /v1/apikeys - Create a new API token
app.post('/v1/apikeys', (req, res) => {
  const { name, permissions } = req.body
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Creating new API key with name: "${name}" and permissions:`, permissions)
  
  if (!name || !permissions || !Array.isArray(permissions)) {
    console.log(`[${timestamp}] Validation failed: Invalid request parameters`)
    return res.status(400).json({ 
      error: 'Invalid request. Name and permissions array are required.' 
    })
  }
  
  const apiKey = createApiKeyObject(name, permissions)
  apiKeys[apiKey.id] = apiKey
  
  console.log(`[${timestamp}] API key created successfully with ID: ${apiKey.id}`)
  console.log(`[${timestamp}] Total API keys in database: ${Object.keys(apiKeys).length}`)
  
  // Simuliere Verzögerung
  setTimeout(() => {
    console.log(`[${timestamp}] Sending response for API key creation`)
    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      permissions: apiKey.permissions,
      created_at: apiKey.created_at,
      expires_at: apiKey.expires_at,
      is_active: apiKey.is_active,
      secret: apiKey.secret // Nur bei Erstellung zurückgegeben
    })
  }, 1000)
})

// GET /v1/apikeys - List all API tokens for the current user
app.get('/v1/apikeys', (req, res) => {
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Listing all API keys`)
  console.log(`[${timestamp}] Total API keys in database: ${Object.keys(apiKeys).length}`)
  
  const keys = Object.values(apiKeys).map(key => ({
    id: key.id,
    name: key.name,
    permissions: key.permissions,
    created_at: key.created_at,
    expires_at: key.expires_at,
    is_active: key.is_active
    // secret wird nicht zurückgegeben
  }))
  
  console.log(`[${timestamp}] Returning ${keys.length} API keys`)
  res.status(200).json(keys)
})

// GET /v1/apikeys/{id} - Get a single API token by ID
app.get('/v1/apikeys/:id', (req, res) => {
  const { id } = req.params
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Getting API key with ID: ${id}`)
  
  const apiKey = apiKeys[id]
  
  if (!apiKey) {
    console.log(`[${timestamp}] API key not found with ID: ${id}`)
    return res.status(404).json({ error: 'Token not found' })
  }
  
  console.log(`[${timestamp}] API key found: "${apiKey.name}" (active: ${apiKey.is_active})`)
  res.status(200).json({
    id: apiKey.id,
    name: apiKey.name,
    permissions: apiKey.permissions,
    created_at: apiKey.created_at,
    expires_at: apiKey.expires_at,
    is_active: apiKey.is_active
    // secret wird nicht zurückgegeben
  })
})

// POST /v1/apikeys/{id}/rotate - Rotate an API token
app.post('/v1/apikeys/:id/rotate', (req, res) => {
  const { id } = req.params
  const { name, permissions } = req.body
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Rotating API key with ID: ${id}`)
  console.log(`[${timestamp}] New name: "${name || 'unchanged'}", new permissions:`, permissions || 'unchanged')
  
  const existingKey = apiKeys[id]
  if (!existingKey) {
    console.log(`[${timestamp}] API key not found for rotation: ${id}`)
    return res.status(404).json({ error: 'Token not found or not rotatable' })
  }
  
  console.log(`[${timestamp}] Deactivating existing key: "${existingKey.name}"`)
  // Deaktiviere alten Key
  existingKey.is_active = false
  
  // Erstelle neuen Key
  const newApiKey = createApiKeyObject(
    name || existingKey.name, 
    permissions || existingKey.permissions
  )
  apiKeys[newApiKey.id] = newApiKey
  
  console.log(`[${timestamp}] New API key created with ID: ${newApiKey.id}`)
  console.log(`[${timestamp}] Total API keys after rotation: ${Object.keys(apiKeys).length}`)
  
  setTimeout(() => {
    console.log(`[${timestamp}] Sending rotation response`)
    res.status(201).json({
      id: newApiKey.id,
      name: newApiKey.name,
      permissions: newApiKey.permissions,
      created_at: newApiKey.created_at,
      expires_at: newApiKey.expires_at,
      is_active: newApiKey.is_active,
      secret: newApiKey.secret
    })
  }, 1000)
})

// PUT /v1/apikeys/{id}/deactivate - Deactivate an API token
app.put('/v1/apikeys/:id/deactivate', (req, res) => {
  const { id } = req.params
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Deactivating API key with ID: ${id}`)
  
  const apiKey = apiKeys[id]
  
  if (!apiKey) {
    console.log(`[${timestamp}] API key not found for deactivation: ${id}`)
    return res.status(404).json({ error: 'Token not found' })
  }
  
  console.log(`[${timestamp}] Deactivating API key: "${apiKey.name}"`)
  apiKey.is_active = false
  
  console.log(`[${timestamp}] API key deactivated successfully`)
  res.status(204).send()
})

// GET /v1/usage/ai - Get AI usage data
app.get('/v1/usage/ai', (req, res) => {
  const { from_date, to_date } = req.query
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Getting AI usage data`)
  console.log(`[${timestamp}] Date filter - from: ${from_date || 'none'}, to: ${to_date || 'none'}`)
  
  // Mock usage data
  const mockUsage = [
    {
      model: 'gpt-4',
      tokens_used: 1500,
      cost: 0.045,
      timestamp: new Date().toISOString()
    },
    {
      model: 'gpt-3.5-turbo',
      tokens_used: 2300,
      cost: 0.00345,
      timestamp: new Date(Date.now() - 86400000).toISOString() // 1 Tag zurück
    }
  ]
  
  // Filter by date range if provided
  let filteredUsage = mockUsage
  if (from_date || to_date) {
    filteredUsage = mockUsage.filter(usage => {
      const usageDate = new Date(usage.timestamp)
      const from = from_date ? new Date(from_date) : new Date(0)
      const to = to_date ? new Date(to_date) : new Date()
      return usageDate >= from && usageDate <= to
    })
    console.log(`[${timestamp}] Filtered usage data: ${filteredUsage.length} entries (from ${mockUsage.length} total)`)
  } else {
    console.log(`[${timestamp}] Returning all usage data: ${mockUsage.length} entries`)
  }
  
  res.status(200).json({
    usage: filteredUsage
  })
})

// GET /v1/usage/ai/summarize - Get usage summary
app.get('/v1/usage/ai/summarize', (req, res) => {
  const { from_date, to_date, by } = req.query
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Getting AI usage summary`)
  console.log(`[${timestamp}] Summary parameters - from: ${from_date || 'none'}, to: ${to_date || 'none'}, by: ${by || 'none'}`)
  
  // Mock summary data
  const mockSummary = {
    total_tokens: 3800,
    total_cost: 0.04845,
    by_model: {
      'gpt-4': { tokens: 1500, cost: 0.045 },
      'gpt-3.5-turbo': { tokens: 2300, cost: 0.00345 }
    },
    by_user: {
      'user1': { tokens: 2000, cost: 0.025 },
      'user2': { tokens: 1800, cost: 0.02345 }
    },
    by_period: {
      '2024-01': { tokens: 3800, cost: 0.04845 }
    }
  }
  
  console.log(`[${timestamp}] Summary data - Total tokens: ${mockSummary.total_tokens}, Total cost: $${mockSummary.total_cost}`)
  console.log(`[${timestamp}] Models in summary: ${Object.keys(mockSummary.by_model).join(', ')}`)
  
  res.status(200).json({
    summary: mockSummary
  })
})

// GET /v1/admin/usage/ai/summarize - Admin usage summary (mit Security)
app.get('/v1/admin/usage/ai/summarize', (req, res) => {
  const { from_date, to_date, by } = req.query
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Getting ADMIN AI usage summary`)
  console.log(`[${timestamp}] Admin summary parameters - from: ${from_date || 'none'}, to: ${to_date || 'none'}, by: ${by || 'none'}`)
  
  // Hier würde normalerweise die Authentifizierung geprüft werden
  // Für Mock-Zwecke lassen wir es durch
  console.log(`[${timestamp}] Admin authentication bypassed for mock purposes`)
  
  const adminSummary = {
    total_tokens: 15000,
    total_cost: 0.1875,
    by_model: {
      'gpt-4': { tokens: 8000, cost: 0.24 },
      'gpt-3.5-turbo': { tokens: 7000, cost: 0.0105 }
    },
    by_user: {
      'admin': { tokens: 5000, cost: 0.0625 },
      'user1': { tokens: 4000, cost: 0.05 },
      'user2': { tokens: 6000, cost: 0.075 }
    },
    by_period: {
      '2024-01': { tokens: 15000, cost: 0.1875 }
    }
  }
  
  console.log(`[${timestamp}] Admin summary data - Total tokens: ${adminSummary.total_tokens}, Total cost: $${adminSummary.total_cost}`)
  console.log(`[${timestamp}] Admin users in summary: ${Object.keys(adminSummary.by_user).join(', ')}`)
  
  res.status(200).json({
    summary: adminSummary
  })
})

// Legacy Endpunkte für Kompatibilität (falls noch verwendet)
app.get('/api/keys', (req, res) => {
  const email = req.query.email
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Legacy endpoint: Getting API keys for email: ${email}`)
  
  if (!email) {
    console.log(`[${timestamp}] Legacy endpoint: Email parameter missing`)
    return res.status(400).json({ error: 'E-Mail erforderlich' })
  }
  
  const keys = Object.values(apiKeys).map(key => ({
    apiKey: key.secret,
    name: key.name,
    permissions: key.permissions.join(', '),
    createdAt: key.created_at,
    createdBy: 'Domenic Schumacher',
    validUntil: key.expires_at,
    lastUsed: 'Never',
    status: key.is_active ? 'active' : 'revoked'
  }))
  
  console.log(`[${timestamp}] Legacy endpoint: Returning ${keys.length} API keys`)
  res.json({ keys })
})

app.get('/api/key-stats', (req, res) => {
  const email = req.query.email
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] Legacy endpoint: Getting key stats for email: ${email}`)
  
  if (!email) {
    console.log(`[${timestamp}] Legacy endpoint: Email parameter missing for stats`)
    return res.status(400).json({ error: 'E-Mail erforderlich' })
  }
  
  const keys = Object.values(apiKeys)
  let active = 0, expired = 0, revoked = 0
  
  for (const k of keys) {
    if (k.is_active) active++
    else if (new Date(k.expires_at) < new Date()) expired++
    else revoked++
  }
  
  const stats = {
    total: keys.length,
    active,
    expired,
    revoked,
    costs: (keys.length * 0.05).toFixed(2)
  }
  
  console.log(`[${timestamp}] Legacy endpoint: Key stats - Total: ${stats.total}, Active: ${stats.active}, Expired: ${stats.expired}, Revoked: ${stats.revoked}, Costs: $${stats.costs}`)
  res.json(stats)
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] Health check requested`)
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(port, () => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ========================================`)
  console.log(`[${timestamp}] Mock API Server gestartet`)
  console.log(`[${timestamp}] Server läuft auf http://localhost:${port}`)
  console.log(`[${timestamp}] ========================================`)
  console.log(`[${timestamp}] Verfügbare Endpunkte:`)
  console.log(`[${timestamp}] OpenAPI v1 Endpunkte:`)
  console.log(`[${timestamp}]   POST http://localhost:${port}/v1/apikeys - Create API key`)
  console.log(`[${timestamp}]   GET  http://localhost:${port}/v1/apikeys - List API keys`)
  console.log(`[${timestamp}]   GET  http://localhost:${port}/v1/apikeys/:id - Get single API key`)
  console.log(`[${timestamp}]   POST http://localhost:${port}/v1/apikeys/:id/rotate - Rotate API key`)
  console.log(`[${timestamp}]   PUT  http://localhost:${port}/v1/apikeys/:id/deactivate - Deactivate API key`)
  console.log(`[${timestamp}]   GET  http://localhost:${port}/v1/usage/ai - Get usage data`)
  console.log(`[${timestamp}]   GET  http://localhost:${port}/v1/usage/ai/summarize - Get usage summary`)
  console.log(`[${timestamp}]   GET  http://localhost:${port}/v1/admin/usage/ai/summarize - Admin usage summary`)
  console.log(`[${timestamp}] Legacy Endpunkte:`)
  console.log(`[${timestamp}]   GET  http://localhost:${port}/api/keys - Legacy API keys`)
  console.log(`[${timestamp}]   GET  http://localhost:${port}/api/key-stats - Legacy key stats`)
  console.log(`[${timestamp}]   GET  http://localhost:${port}/api/health - Health check`)
  console.log(`[${timestamp}] ========================================`)
  console.log(`[${timestamp}] Alle Requests werden jetzt geloggt`)
  console.log(`[${timestamp}] ========================================`)
}) 
