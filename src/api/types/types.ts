// API Key Types
export interface MobaRagApiKeyRequest {
  name: string
  permissions: string[]
}

export interface MobaRagApiKey {
  id: string
  name: string
  permissions: string[]
  created_at: string
  expires_at: string | null
  is_active: boolean
}

export interface MobaRagApiKeyWithSecret extends MobaRagApiKey {
  secret: string
}

// Usage Types
export interface UsageData {
  model: string
  tokens_used: number
  cost: number
  timestamp: string
}

export interface UsageResponse {
  usage: UsageData[]
}

export interface SummaryUsageResponse {
  summary: {
    total_tokens: number
    total_cost: number
    by_model: Record<string, any>
    by_user: Record<string, any>
    by_period: Record<string, any>
  }
}

// API Parameters
export interface UsageAIGetV1Params {
  from_date?: string
  to_date?: string
  model?: string
}

export interface UsageAISummaryGetV1Params {
  from_date?: string
  to_date?: string
  by?: string
}

export interface AdminUsageAISummaryGetV1Params {
  from_date?: string
  to_date?: string
  by?: string
}

// API Response Types
export interface CreateApiKeyV1Result {
  data: MobaRagApiKeyWithSecret
}

export interface GetAllApiKeysV1Result {
  data: MobaRagApiKey[]
}

export interface GetApiKeyV1Result {
  data: MobaRagApiKey
}

export interface RotateKeyV1Result {
  data: MobaRagApiKeyWithSecret
}

export interface DeactivateKeyV1Result {
  data: void
}

export interface UsageAIGetV1Result {
  data: UsageResponse
}

export interface UsageAISummaryGetV1Result {
  data: SummaryUsageResponse
}

export interface AdminUsageAISummaryGetV1Result {
  data: SummaryUsageResponse
}
