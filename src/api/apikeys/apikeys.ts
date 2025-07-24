import api from '@/axios/api'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  CreateApiKeyV1Result,
  DeactivateKeyV1Result,
  DekaRagApiKey,
  DekaRagApiKeyRequest,
  DekaRagApiKeyWithSecret,
  GetAllApiKeysV1Result,
  GetApiKeyV1Result,
  RotateKeyV1Result,
} from '../types/types'

/**
 * Create a new API token
 * @summary Create a new API token
 */
export const createApiKeyV1 = <TData = AxiosResponse<DekaRagApiKeyWithSecret>>(
  dekaRagApiKeyRequest: DekaRagApiKeyRequest,
  options?: AxiosRequestConfig,
): Promise<TData> => {
  return api.post('/apikeys', dekaRagApiKeyRequest, options)
}

/**
 * List all API tokens for the current user
 * @summary List all API tokens for the current user
 */
export const getAllApiKeysV1 = <TData = AxiosResponse<DekaRagApiKey[]>>(
  options?: AxiosRequestConfig,
): Promise<TData> => {
  return api.get('/apikeys', options)
}

/**
 * Get a single API token by ID
 * @summary Get a single API token by ID
 */
export const getApiKeyV1 = <TData = AxiosResponse<DekaRagApiKey>>(
  id: string,
  options?: AxiosRequestConfig,
): Promise<TData> => {
  return api.get(`/apikeys/${id}`, options)
}

/**
 * Rotate an API token (deactivates old, creates new)
 * @summary Rotate an API token (deactivates old, creates new)
 * @description Deactivates the given API token and creates a new one with the provided parameters.
 */
export const rotateKeyV1 = <TData = AxiosResponse<DekaRagApiKeyWithSecret>>(
  id: string,
  dekaRagApiKeyRequest: DekaRagApiKeyRequest,
  options?: AxiosRequestConfig,
): Promise<TData> => {
  return api.post(`/apikeys/${id}/rotate`, dekaRagApiKeyRequest, options)
}

/**
 * Deactivate an API token
 * @summary Deactivate an API token
 */
export const deactivateKeyV1 = <TData = AxiosResponse<void>>(
  id: string,
  options?: AxiosRequestConfig,
): Promise<TData> => {
  return api.put(`/apikeys/${id}/deactivate`, undefined, options)
}

// Export types for convenience
export type {
  CreateApiKeyV1Result,
  DeactivateKeyV1Result,
  DekaRagApiKeyRequest,
  GetAllApiKeysV1Result,
  GetApiKeyV1Result,
  RotateKeyV1Result,
}
