<template>
  <tr class="border-b last:border-0 hover:bg-gray-50 group">
    <td class="py-3 px-4 text-sm">
      <div>{{ keyData.name }}</div>
    </td>
    <td class="py-3 px-4 font-mono text-xs break-all">
      <span v-if="keyData.status === 'active'">sk-•••{{ keyData.apiKey.slice(-4) }}</span>
      <span v-else class="text-gray-400">sk-•••{{ keyData.apiKey.slice(-4) }}</span>
    </td>
    <td class="py-3 px-4 text-xs">{{ new Date(keyData.createdAt).toLocaleDateString() }}</td>
    <td class="py-3 px-4 text-xs">{{ keyData.lastUsed }}</td>
    <td class="py-3 px-4 text-xs">{{ keyData.validUntil ? new Date(keyData.validUntil).toLocaleDateString() : '—' }}</td>
    <td class="py-3 px-4 text-xs">{{ keyData.createdBy }}</td>
    <td class="py-3 px-4 text-xs">{{ keyData.permissions }}</td>
    <td class="py-3 px-4 text-xs text-right">
      <div class="flex justify-end gap-1">
        <button v-if="keyData.status === 'active'" @click="$emit('edit', keyData)" class="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600" title="Edit">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button v-if="keyData.status === 'active'" @click="$emit('revoke', keyData.id)" class="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600" title="Delete">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
// Legacy interface for backward compatibility
interface LegacyApiKey {
  id: string
  apiKey: string
  name: string
  permissions: string
  createdAt: string
  createdBy: string
  validUntil: string
  lastUsed: string
  status: string
}

const props = defineProps<{
  keyData: LegacyApiKey
  editing: boolean
  editingName: string
}>()

const emits = defineEmits<{
  edit: [key: LegacyApiKey]
  save: [apiKey: string]
  cancel: []
  revoke: [keyId: string]
  'name-input': [value: string]
}>()
</script> 