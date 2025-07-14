<script setup lang="ts">
import ApiKeyCreateModal from '@/components/apikey/ApiKeyCreateModal.vue'
import ApiKeyEditModal from '@/components/apikey/ApiKeyEditModal.vue'
import ApiKeyTable from '@/components/apikey/ApiKeyTable.vue'
import UsageCapabilitiesGrid from '@/components/usage/UsageCapabilitiesGrid.vue'
import UsageHeader from '@/components/usage/UsageHeader.vue'
import UsageSidebarPanel from '@/components/usage/UsageSidebarPanel.vue'
import UsageSpendChart from '@/components/usage/UsageSpendChart.vue'
import { computed, onMounted, ref } from 'vue'

// Legacy interface für Kompatibilität
interface LegacyApiKey {
  apiKey: string
  name: string
  permissions: string
  createdAt: string
  createdBy: string
  validUntil: string
  lastUsed: string
  status: string
}

// Neue OpenAPI v1 Interface
interface ApiKey {
  id: string
  name: string
  permissions: string[]
  created_at: string
  expires_at: string
  is_active: boolean
  secret?: string
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/v1'

const keys = ref<ApiKey[]>([])
const isLoading = ref(false)
const error = ref('')
const showSuccessMessage = ref(false)
const isCreating = ref(false)
const showModal = ref(false)
const newKeyName = ref('')
const newKeyPermissions = ref<string[]>(['read'])
const createdSecret = ref('')
const createdKeyName = ref('')
const createdKeyPermissions = ref<string[]>([])
const createdKeyValidUntil = ref('')
const createdKeyCreatedBy = ref('')
const activeSidebar = ref<'api' | 'usage'>('api')
const editingKey = ref<string | null>(null)
const editingName = ref('')
const showRevokeSuccessMessage = ref(false)

const permissionOptions = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'admin', label: 'Admin' },
  { value: 'delete', label: 'Delete' }
]

const profile = {
  name: 'Domenic Schumacher',
  avatar: 'https://ui-avatars.com/api/?name=Domenic+Schumacher&background=0D8ABC&color=fff',
}

// Legacy-Kompatibilität für bestehende Komponenten
const legacyKeys = computed(() => {
  return keys.value.map((key: ApiKey) => ({
    id: key.id,
    apiKey: key.secret || key.id,
    name: key.name,
    permissions: key.permissions.join(', '),
    createdAt: key.created_at,
    createdBy: profile.name,
    validUntil: key.expires_at,
    lastUsed: 'Never',
    status: key.is_active ? 'active' : 'revoked'
  }))
})

const loadKeys = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/apikeys`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    keys.value = data || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Laden der API-Keys'
  } finally {
    isLoading.value = false
  }
}

const createKey = async () => {
  isCreating.value = true
  error.value = ''
  try {
    const requestBody = {
      name: newKeyName.value,
      permissions: newKeyPermissions.value
    }
    
    const res = await fetch(`${API_BASE}/apikeys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    
    createdSecret.value = data.secret || ''
    createdKeyName.value = data.name
    createdKeyPermissions.value = data.permissions
    createdKeyValidUntil.value = data.expires_at
    createdKeyCreatedBy.value = profile.name
    await loadKeys()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Erstellen des API-Keys'
  } finally {
    isCreating.value = false
  }
}

const revokeKey = async (keyId: string) => {
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/apikeys/${keyId}/deactivate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    await loadKeys()
    showRevokeSuccessMessage.value = true
    setTimeout(() => { showRevokeSuccessMessage.value = false }, 3000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Deaktivieren'
  }
}

const showEditModal = ref(false)
const editModalName = ref('')
const editModalPermissions = ref<string[]>([])
const editModalKey = ref<ApiKey | null>(null)
const showEditSuccessMessage = ref(false)
const showCreateSuccessMessage = ref(false)

function startEditing(key: LegacyApiKey) {
  const newKey = keys.value.find((k: ApiKey) => k.secret === key.apiKey || k.id === key.apiKey)
  if (!newKey) return
  
  editModalName.value = newKey.name
  editModalPermissions.value = [...newKey.permissions]
  editModalKey.value = newKey
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editModalKey.value = null
}

async function saveEditModal() {
  if (!editModalKey.value) return
  error.value = ''
  try {
    const requestBody = {
      name: editModalName.value,
      permissions: editModalPermissions.value
    }
    
    const res = await fetch(`${API_BASE}/apikeys/${editModalKey.value.id}/rotate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    await loadKeys()
    showEditSuccessMessage.value = true
    setTimeout(() => { showEditSuccessMessage.value = false }, 3000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren'
  }
  showEditModal.value = false
  editModalKey.value = null
}

const showCreateModal = ref(false)
function openModal() {
  showCreateModal.value = true
  newKeyName.value = ''
  newKeyPermissions.value = ['read']
  createdSecret.value = ''
  createdKeyName.value = ''
  createdKeyPermissions.value = []
  createdKeyValidUntil.value = ''
  createdKeyCreatedBy.value = ''
}

function closeCreateModal() {
  showCreateModal.value = false
  newKeyName.value = ''
  newKeyPermissions.value = ['read']
  createdSecret.value = ''
  createdKeyName.value = ''
  createdKeyPermissions.value = []
  createdKeyValidUntil.value = ''
  createdKeyCreatedBy.value = ''
}

async function createKeyModal() {
  await createKey()
  showCreateModal.value = false
  showCreateSuccessMessage.value = true
  setTimeout(() => { showCreateSuccessMessage.value = false }, 3000)
}

const copyApiKey = async (apiKey: string) => {
  try {
    await navigator.clipboard.writeText(apiKey)
    showSuccessMessage.value = true
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
  } catch (err) {
    error.value = 'Fehler beim Kopieren'
  }
}

// Legacy-Funktionen für Kompatibilität
const saveEdit = async (apiKey: string) => {
  const key = keys.value.find((k: ApiKey) => k.secret === apiKey || k.id === apiKey)
  if (!key) {
    error.value = 'Key nicht gefunden'
    return
  }
  
  await saveEditModal()
  editingKey.value = null
  editingName.value = ''
}

const cancelEdit = () => {
  editingKey.value = null
  editingName.value = ''
}

onMounted(() => {
  loadKeys()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-56 bg-white border-r flex flex-col py-6 px-4 min-h-screen">
      <div class="mb-8">
        <span class="text-xl font-bold text-blue-700">API Dashboard</span>
      </div>
      <nav class="flex-1 flex flex-col gap-2">
        <button @click="activeSidebar = 'api'" :class="activeSidebar === 'api' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'" class="flex items-center gap-3 px-3 py-2 rounded transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2a4 4 0 014-4h4"/></svg>
          API keys
        </button>
        <button @click="activeSidebar = 'usage'" :class="activeSidebar === 'usage' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'" class="flex items-center gap-3 px-3 py-2 rounded transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>
          Usage
        </button>
      </nav>
    </aside>
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Topbar mit Profil rechts oben -->
      <header class="flex items-center justify-end bg-white border-b px-8 py-4">
        <div class="flex items-center gap-3">
          <span class="text-gray-700 font-medium text-sm">{{ profile.name }}</span>
          <img :src="profile.avatar" alt="avatar" class="w-9 h-9 rounded-full border" />
        </div>
      </header>
      <main class="flex-1 bg-gray-50 p-10">
        <!-- API Keys Section -->
        <div v-if="activeSidebar === 'api'">
          <div class="flex justify-between items-center mb-6 max-w-6xl mx-auto">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 mb-1">API keys</h1>
              <p class="text-gray-600 text-sm max-w-2xl">As an owner of this project, you can view and manage all API keys in this project.<br>Do not share your API key with others or expose it in the browser or other client-side code. To protect your account's security, API keys may automatically be disabled if they have leaked publicly.</p>
            </div>
            <button @click="openModal" class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 text-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              Create new secret key
            </button>
          </div>
          <div class="overflow-x-auto max-w-6xl mx-auto">
            <ApiKeyTable
              :keys="legacyKeys"
              :editingKey="editingKey"
              :editingName="editingName"
              @edit="startEditing"
              @save="saveEdit"
              @cancel="cancelEdit"
              @revoke="revokeKey"
              @name-input="val => editingName = val"
            />
          </div>
          <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-6xl mx-auto">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
          <!-- Edit Modal -->
          <ApiKeyEditModal
            :model-value="showEditModal"
            :name="editModalName"
            :permissions="editModalPermissions.join(', ')"
            :permission-options="permissionOptions.map((p: any) => p.label)"
            @update:name="val => editModalName = val"
            @update:permissions="val => editModalPermissions = val.split(', ').map((p: any) => p.trim())"
            @cancel="closeEditModal"
            @save="saveEditModal"
          />
          <!-- Create Modal -->
          <ApiKeyCreateModal
            :model-value="showCreateModal"
            :name="newKeyName"
            :permissions="newKeyPermissions.join(', ')"
            :permission-options="permissionOptions.map((p: any) => p.label)"
            :is-creating="isCreating"
            @update:name="val => newKeyName = val"
            @update:permissions="val => newKeyPermissions = val.split(', ').map((p: any) => p.trim())"
            @cancel="closeCreateModal"
            @create="createKeyModal"
          />
        </div>

        <!-- Usage Section -->
        <div v-else-if="activeSidebar === 'usage'" class="max-w-7xl mx-auto">
          <UsageHeader />
          <div class="flex flex-col lg:flex-row gap-6 mb-6">
            <UsageSpendChart />
            <UsageSidebarPanel />
          </div>
          <UsageCapabilitiesGrid />
        </div>
      </main>
    </div>

    <!-- Modal für Key-Erstellung -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button @click="closeCreateModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <template v-if="!createdSecret">
          <h3 class="text-xl font-bold mb-2">Neuen Secret Key erstellen</h3>
          <p class="mb-4 text-gray-600 text-sm">Geben Sie optional einen Namen für Ihren Key ein und setzen Sie Berechtigungen.</p>
          <label class="block mb-2 text-sm font-medium">Name (optional)</label>
          <input v-model="newKeyName" class="w-full mb-4 px-3 py-2 border rounded" placeholder="z.B. My App Key" />
          <label class="block mb-2 text-sm font-medium">Berechtigungen</label>
          <div class="mb-6 space-y-2">
            <label v-for="perm in permissionOptions" :key="perm.value" class="flex items-center">
              <input 
                type="checkbox" 
                :value="perm.value"
                v-model="newKeyPermissions"
                class="mr-2"
              />
              {{ perm.label }}
            </label>
          </div>
          <button @click="createKey" :disabled="isCreating" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center">
            <svg v-if="isCreating" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isCreating ? 'Erstelle...' : 'Secret Key erstellen' }}
          </button>
        </template>
        <template v-else>
          <h3 class="text-xl font-bold mb-2">Speichern Sie Ihren Key</h3>
          <p class="mb-4 text-gray-600 text-sm">Bitte speichern Sie Ihren Secret Key an einem sicheren Ort, da <b>Sie ihn nicht mehr anzeigen können</b>.</p>
          <div class="mb-4 flex items-center border rounded px-3 py-2 bg-gray-50">
            <input :value="createdSecret" readonly class="flex-1 bg-transparent font-mono text-xs select-all outline-none" />
            <button @click="copyApiKey(createdSecret)" class="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">Kopieren</button>
          </div>
          <div class="mb-4">
            <label class="block text-xs text-gray-500">Name</label>
            <div class="font-medium">{{ createdKeyName || '—' }}</div>
          </div>
          <div class="mb-4">
            <label class="block text-xs text-gray-500">Berechtigungen</label>
            <div class="font-medium">{{ createdKeyPermissions.join(', ') }}</div>
          </div>
          <div class="mb-4">
            <label class="block text-xs text-gray-500">Gültig bis</label>
            <div class="font-medium">{{ createdKeyValidUntil ? new Date(createdKeyValidUntil).toLocaleDateString() : '—' }}</div>
          </div>
          <div class="mb-6">
            <label class="block text-xs text-gray-500">Erstellt von</label>
            <div class="font-medium">{{ createdKeyCreatedBy }}</div>
          </div>
          <button @click="closeCreateModal" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">Fertig</button>
        </template>
      </div>
    </div>

    <!-- Snackbar -->
    <div
      v-if="showSuccessMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300"
      :class="showSuccessMessage ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
    >
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>API-Key wurde kopiert!</span>
      </div>
    </div>
    <!-- Snackbar für Edit -->
    <div
      v-if="showEditSuccessMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50"
      :class="showEditSuccessMessage ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
    >
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Änderungen gespeichert!</span>
      </div>
    </div>
    <!-- Snackbar für Create -->
    <div
      v-if="showCreateSuccessMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50"
      :class="showCreateSuccessMessage ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
    >
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>API-Key erfolgreich erstellt!</span>
      </div>
    </div>
    <!-- Snackbar für Revoke -->
    <div
      v-if="showRevokeSuccessMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50"
      :class="showRevokeSuccessMessage ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
    >
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>API-Key erfolgreich deaktiviert!</span>
      </div>
    </div>
  </div>
</template>
