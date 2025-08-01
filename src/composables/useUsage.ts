import type {
  EnhancedUsageRecord,
  ModelUsageSummary,
  UsageAggregation,
  UsageFilter,
  UserUsageSummary,
} from '@/api/types/types'
import { usageService } from '@/services/apiService'
import { computed, ref } from 'vue'

export function useUsage() {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const detailedUsageData = ref<EnhancedUsageRecord[]>([])
  const usageAggregation = ref<UsageAggregation | null>(null)
  const userUsageSummary = ref<UserUsageSummary[]>([])
  const modelUsageSummary = ref<ModelUsageSummary[]>([])
  const currentFilter = ref<UsageFilter>({})

  // Computed
  const filteredUsageData = computed(() => {
    let filtered = detailedUsageData.value

    if (currentFilter.value.modelType) {
      filtered = filtered.filter((item) => item.modelType === currentFilter.value.modelType)
    }

    if (currentFilter.value.technicalUserIds && currentFilter.value.technicalUserIds.length > 0) {
      filtered = filtered.filter((item) =>
        currentFilter.value.technicalUserIds!.includes(item.technicalUserId),
      )
    }

    return filtered
  })

  const topUsers = computed(() => {
    return userUsageSummary.value.sort((a, b) => b.totalRequests - a.totalRequests).slice(0, 10)
  })

  const topModels = computed(() => {
    return modelUsageSummary.value.sort((a, b) => b.totalRequests - a.totalRequests).slice(0, 10)
  })

  // Actions
  const loadDetailedUsageData = async (filter?: UsageFilter) => {
    isLoading.value = true
    error.value = null

    try {
      if (filter) {
        currentFilter.value = { ...filter }
      }

      // Prüfe ob Admin-Berechtigung vorhanden ist
      const hasAdminPermission = await import('@/auth/keycloak').then((m) =>
        m.hasPermission('canViewAdminUsage'),
      )

      if (hasAdminPermission) {
        // Lade alle Daten nur wenn Admin-Berechtigung vorhanden
        const [detailedData, aggregation, userSummary, modelSummary] = await Promise.all([
          usageService.getDetailedUsageData(
            currentFilter.value.fromDate,
            currentFilter.value.toDate,
            currentFilter.value.modelType,
          ),
          usageService.getUsageAggregation(
            currentFilter.value.fromDate,
            currentFilter.value.toDate,
          ),
          usageService.getUserUsageSummary(
            currentFilter.value.fromDate,
            currentFilter.value.toDate,
          ),
          usageService.getModelUsageSummary(
            currentFilter.value.fromDate,
            currentFilter.value.toDate,
          ),
        ])

        detailedUsageData.value = detailedData
        usageAggregation.value = aggregation
        userUsageSummary.value = userSummary
        modelUsageSummary.value = modelSummary
      } else {
        // Fallback: Leere Arrays für nicht-Admin Benutzer, aber nicht null
        detailedUsageData.value = []
        usageAggregation.value = {
          totalRequests: 0,
          totalTokensIn: 0,
          totalTokensOut: 0,
          totalTokens: 0,
          totalCost: 0,
          uniqueUsers: 0,
          uniqueModels: 0,
          averageRequestsPerUser: 0,
          averageTokensPerRequest: 0,
          averageCostPerRequest: 0,
        }
        userUsageSummary.value = []
        modelUsageSummary.value = []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Fehler beim Laden der Nutzungsdaten'
      console.error('Fehler beim Laden der Nutzungsdaten:', err)

      // Fallback bei Fehlern - setze nicht auf null
      detailedUsageData.value = []
      usageAggregation.value = {
        totalRequests: 0,
        totalTokensIn: 0,
        totalTokensOut: 0,
        totalTokens: 0,
        totalCost: 0,
        uniqueUsers: 0,
        uniqueModels: 0,
        averageRequestsPerUser: 0,
        averageTokensPerRequest: 0,
        averageCostPerRequest: 0,
      }
      userUsageSummary.value = []
      modelUsageSummary.value = []
    } finally {
      isLoading.value = false
    }
  }

  const exportUsageData = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const data = filteredUsageData.value

      if (format === 'csv') {
        const headers = [
          'Technische User ID',
          'Technischer Benutzername',
          'Modell',
          'Modelltyp',
          'Anfragen',
          'Tag',
          'Tag',
          'Monat',
          'Jahr',
        ]

        const csvContent = [
          headers.join(','),
          ...data.map((item) =>
            [
              item.technicalUserId,
              item.technicalUserName,
              item.modelName,
              item.modelType,
              item.requests,
              item.tag,
              item.day || '',
              item.month || '',
              item.year || '',
            ].join(','),
          ),
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `usage-data-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `usage-data-${new Date().toISOString().split('T')[0]}.json`
        link.click()
      }
    } catch (err) {
      error.value = 'Fehler beim Exportieren der Daten'
      console.error('Fehler beim Exportieren:', err)
    }
  }

  const updateFilter = async (newFilter: Partial<UsageFilter>) => {
    currentFilter.value = { ...currentFilter.value, ...newFilter }
    await loadDetailedUsageData()
  }

  return {
    // State
    isLoading,
    error,
    detailedUsageData,
    usageAggregation,
    userUsageSummary,
    modelUsageSummary,
    currentFilter,

    // Computed
    filteredUsageData,
    topUsers,
    topModels,

    // Actions
    loadDetailedUsageData,
    exportUsageData,
    updateFilter,
  }
}
