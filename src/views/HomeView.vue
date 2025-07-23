<script setup lang="ts">
import {
  getHighestRole,
  getToken,
  getTokenInfo,
  getUserInfo,
  getUserRoles,
  hasPermission,
  keycloak,
} from '@/auth/keycloak'
import ApiKeyCreateModal from '@/components/apikey/ApiKeyCreateModal.vue'
import ApiKeyEditModal from '@/components/apikey/ApiKeyEditModal.vue'
import ApiKeyTable from '@/components/apikey/ApiKeyTable.vue'
import UsageCapabilitiesGrid from '@/components/usage/UsageCapabilitiesGrid.vue'
import UsageHeader from '@/components/usage/UsageHeader.vue'
import UsageSidebarPanel from '@/components/usage/UsageSidebarPanel.vue'
import UsageSpendChart from '@/components/usage/UsageSpendChart.vue'
import { apiKeyService } from '@/services/apiService'
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

const keys = ref<ApiKey[]>([])
const isLoading = ref(false)
const error = ref('')
const showSuccessMessage = ref(false)
const isCreating = ref(false)

const newKeyName = ref('')
const newKeyPermissions = ref<string[]>(['read'])
const createdSecret = ref('')
const createdKeyName = ref('')
const createdKeyPermissions = ref<string[]>([])
const createdKeyValidUntil = ref('')
const createdKeyCreatedBy = ref('')
const activeSidebar = ref<'api' | 'usage' | 'admin-keys' | 'admin-usage' | 'user-management'>('api')
const editingKey = ref<string | null>(null)
const editingName = ref('')
const showRevokeSuccessMessage = ref(false)

const permissionOptions = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'admin', label: 'Admin' },
  { value: 'delete', label: 'Delete' },
]

// Benutzerinformationen aus Keycloak
const userProfile = computed(() => {
  const userInfo = getUserInfo()
  if (userInfo) {
    const name =
      userInfo.name || userInfo.preferred_username || userInfo.email || 'Unbekannter Benutzer'
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`
    return { name, avatar }
  }
  return {
    name: 'Unbekannter Benutzer',
    avatar: 'https://ui-avatars.com/api/?name=Unknown&background=0D8ABC&color=fff',
  }
})

// Rollenbasierte Computed Properties
const userRoles = computed(() => getUserRoles())
const highestRole = computed(() => getHighestRole())
const isAdmin = computed(() => hasPermission('canViewAdminUsage'))
const isSuperAdmin = computed(() => hasPermission('canManageUsers'))
const canCreateKeys = computed(() => hasPermission('canCreateKeys'))
const canEditKeys = computed(() => hasPermission('canEditOwnKeys'))
const canDeactivateKeys = computed(() => hasPermission('canDeactivateOwnKeys'))
const canViewUsage = computed(() => hasPermission('canViewOwnUsage'))

// Rollen-basierte UI-Elemente
const showAdminSection = computed(() => isAdmin.value)
const showSuperAdminSection = computed(() => isSuperAdmin.value)
const showUserManagement = computed(() => isSuperAdmin.value)

// Rollen-Farben für Template
const getRoleColor = (role: string) => {
  switch (role) {
    case 'user':
      return 'bg-blue-100 text-blue-800'
    case 'admin':
      return 'bg-green-100 text-green-800'
    case 'super_admin':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Debug-Funktionen für Entwicklung
const showDebugInfo = ref(false)
const tokenInfo = ref<any>(null)
const isDevelopment = computed(() => import.meta.env.DEV)

const loadTokenInfo = async () => {
  if (isDevelopment.value) {
    const token = await getToken()
    if (token) {
      tokenInfo.value = getTokenInfo(token)
    }
  }
}

const toggleDebugInfo = () => {
  showDebugInfo.value = !showDebugInfo.value
  if (showDebugInfo.value) {
    loadTokenInfo()
  }
}

// Logout-Funktion
const handleLogout = () => {
  keycloak.logout({
    redirectUri: window.location.origin,
  })
}

// Legacy-Kompatibilität für bestehende Komponenten
const legacyKeys = computed(() => {
  return keys.value.map((key: ApiKey) => ({
    id: key.id,
    apiKey: key.secret || key.id,
    name: key.name,
    permissions: key.permissions.join(', '),
    createdAt: key.created_at,
    createdBy: userProfile.value.name,
    validUntil: key.expires_at,
    lastUsed: 'Never',
    status: key.is_active ? 'active' : 'revoked',
  }))
})

const loadKeys = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const data = await apiKeyService.getApiKeys()
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
    const data = await apiKeyService.createApiKey(newKeyName.value, newKeyPermissions.value)

    createdSecret.value = data.secret || ''
    createdKeyName.value = data.name
    createdKeyPermissions.value = data.permissions
    createdKeyValidUntil.value = data.expires_at
    createdKeyCreatedBy.value = userProfile.value.name
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
    await apiKeyService.deactivateApiKey(keyId)
    await loadKeys()
    showRevokeSuccessMessage.value = true
    setTimeout(() => {
      showRevokeSuccessMessage.value = false
    }, 3000)
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
    const data = await apiKeyService.rotateApiKey(
      editModalKey.value.id,
      editModalName.value,
      editModalPermissions.value,
    )
    await loadKeys()
    showEditSuccessMessage.value = true
    setTimeout(() => {
      showEditSuccessMessage.value = false
    }, 3000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Aktualisieren'
  }
  showEditModal.value = false
  editModalKey.value = null
}

const showCreateModal = ref(false)
const showKeyDisplayModal = ref(false)

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

function closeKeyDisplayModal() {
  showKeyDisplayModal.value = false
  createdSecret.value = ''
  createdKeyName.value = ''
  createdKeyPermissions.value = []
  createdKeyValidUntil.value = ''
  createdKeyCreatedBy.value = ''
}

async function createKeyModal() {
  await createKey()
  showCreateModal.value = false
  showKeyDisplayModal.value = true
  showCreateSuccessMessage.value = true
  setTimeout(() => {
    showCreateSuccessMessage.value = false
  }, 3000)
}

const copyApiKey = async (apiKey: string) => {
  try {
    await navigator.clipboard.writeText(apiKey)
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
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
        <button
          @click="activeSidebar = 'api'"
          :class="
            activeSidebar === 'api' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
          "
          class="flex items-center gap-3 px-3 py-2 rounded transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2a4 4 0 014-4h4" />
          </svg>
          API keys
        </button>
        <button
          @click="activeSidebar = 'usage'"
          :class="
            activeSidebar === 'usage' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
          "
          class="flex items-center gap-3 px-3 py-2 rounded transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          Usage
        </button>

        <!-- Admin-Bereich -->
        <div v-if="showAdminSection" class="mt-4 pt-4 border-t border-gray-200">
          <div class="text-xs font-medium text-gray-500 mb-2 px-3">Admin</div>
          <button
            @click="activeSidebar = 'admin-keys'"
            :class="
              activeSidebar === 'admin-keys'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-700'
            "
            class="flex items-center gap-3 px-3 py-2 rounded transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Alle API Keys
          </button>
          <button
            @click="activeSidebar = 'admin-usage'"
            :class="
              activeSidebar === 'admin-usage'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-700'
            "
            class="flex items-center gap-3 px-3 py-2 rounded transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Alle Usage
          </button>
        </div>

        <!-- Super Admin-Bereich -->
        <div v-if="showSuperAdminSection" class="mt-4 pt-4 border-t border-gray-200">
          <div class="text-xs font-medium text-gray-500 mb-2 px-3">Super Admin</div>
          <button
            @click="activeSidebar = 'user-management'"
            :class="
              activeSidebar === 'user-management'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-700'
            "
            class="flex items-center gap-3 px-3 py-2 rounded transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            Benutzer-Verwaltung
          </button>
        </div>
      </nav>
    </aside>
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Topbar mit Profil rechts oben -->
      <header class="flex items-center justify-end bg-white border-b px-8 py-4">
        <div class="flex items-center gap-3">
          <!-- Debug-Button (nur in Entwicklung) -->
          <button
            v-if="isDevelopment"
            @click="toggleDebugInfo"
            class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
            title="Debug Info"
          >
            🔧 Debug
          </button>

          <!-- Rollen-Anzeige -->
          <div class="flex items-center gap-2">
            <span class="text-gray-700 font-medium text-sm">{{ userProfile.name }}</span>
            <div class="flex gap-1">
              <span
                v-for="role in userRoles"
                :key="role"
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="getRoleColor(role)"
              >
                {{ role }}
              </span>
            </div>
          </div>
          <img :src="userProfile.avatar" alt="avatar" class="w-9 h-9 rounded-full border" />
          <button
            @click="handleLogout"
            class="ml-3 px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Abmelden"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </header>

      <!-- Debug Panel (nur in Entwicklung) -->
      <div
        v-if="showDebugInfo && isDevelopment"
        class="bg-yellow-50 border-b border-yellow-200 p-4"
      >
        <div class="max-w-6xl mx-auto">
          <h3 class="text-sm font-semibold text-yellow-800 mb-2">🔧 Debug Information</h3>
          <div v-if="tokenInfo" class="text-xs text-yellow-700 space-y-1">
            <div><strong>User ID:</strong> {{ tokenInfo.userId }}</div>
            <div><strong>Email:</strong> {{ tokenInfo.email }}</div>
            <div><strong>Name:</strong> {{ tokenInfo.name }}</div>
            <div><strong>Roles:</strong> {{ tokenInfo.roles.join(', ') }}</div>
            <div><strong>Client Roles:</strong> {{ tokenInfo.clientRoles.join(', ') }}</div>
            <div><strong>Issued At:</strong> {{ tokenInfo.issuedAt?.toLocaleString() }}</div>
            <div><strong>Expires At:</strong> {{ tokenInfo.expiresAt?.toLocaleString() }}</div>
            <div><strong>Is Expired:</strong> {{ tokenInfo.isExpired ? 'Yes' : 'No' }}</div>
          </div>
          <div v-else class="text-xs text-yellow-600">Token-Informationen werden geladen...</div>
        </div>
      </div>
      <main class="flex-1 bg-gray-50 p-10">
        <!-- API Keys Section -->
        <div v-if="activeSidebar === 'api'">
          <div class="flex justify-between items-center mb-6 max-w-6xl mx-auto">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 mb-1">API keys</h1>
              <p class="text-gray-600 text-sm max-w-2xl">
                As an owner of this project, you can view and manage all API keys in this
                project.<br />Do not share your API key with others or expose it in the browser or
                other client-side code. To protect your account's security, API keys may
                automatically be disabled if they have leaked publicly.
              </p>
            </div>
            <button
              @click="openModal"
              class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 text-sm"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
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
              @name-input="(val) => (editingName = val)"
            />
          </div>
          <div
            v-if="error"
            class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-6xl mx-auto"
          >
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
          <!-- Edit Modal -->
          <ApiKeyEditModal
            :model-value="showEditModal"
            :name="editModalName"
            :permissions="editModalPermissions.join(', ')"
            :permission-options="permissionOptions.map((p: any) => p.label)"
            @update:name="(val) => (editModalName = val)"
            @update:permissions="
              (val) => (editModalPermissions = val.split(', ').map((p: any) => p.trim()))
            "
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
            @update:name="(val) => (newKeyName = val)"
            @update:permissions="
              (val) => (newKeyPermissions = val.split(', ').map((p: any) => p.trim()))
            "
            @cancel="closeCreateModal"
            @create="createKeyModal"
          />

          <!-- Key Display Modal -->
          <div
            v-if="showKeyDisplayModal"
            class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          >
            <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
              <h3 class="text-xl font-bold mb-2">Speichern Sie Ihren Key</h3>
              <p class="mb-4 text-gray-600 text-sm">
                Bitte speichern Sie Ihren Secret Key an einem sicheren Ort, da
                <b>Sie ihn nicht mehr anzeigen können</b>.
              </p>
              <div class="mb-4 flex items-center border rounded px-3 py-2 bg-gray-50">
                <input
                  :value="createdSecret"
                  readonly
                  class="flex-1 bg-transparent font-mono text-xs select-all outline-none"
                />
                <button
                  @click="copyApiKey(createdSecret)"
                  class="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                >
                  Kopieren
                </button>
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
                <div class="font-medium">
                  {{
                    createdKeyValidUntil ? new Date(createdKeyValidUntil).toLocaleDateString() : '—'
                  }}
                </div>
              </div>
              <div class="mb-6">
                <label class="block text-xs text-gray-500">Erstellt von</label>
                <div class="font-medium">{{ createdKeyCreatedBy }}</div>
              </div>
              <button
                @click="closeKeyDisplayModal"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Fertig
              </button>
            </div>
          </div>
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

        <!-- Admin: Alle API Keys Section -->
        <div v-else-if="activeSidebar === 'admin-keys'" class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 mb-1">Alle API Keys (Admin)</h1>
              <p class="text-gray-600 text-sm max-w-2xl">
                Als Administrator können Sie alle API-Keys aller Benutzer einsehen und verwalten.
              </p>
            </div>
          </div>
          <div class="overflow-x-auto">
            <div class="bg-white rounded-lg shadow">
              <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Admin API Keys Übersicht</h3>
                <p class="text-gray-600 mb-4">
                  Hier werden alle API-Keys aller Benutzer angezeigt.
                </p>
                <!-- Hier würde die Admin API Keys Tabelle kommen -->
                <div class="text-center py-8 text-gray-500">
                  <svg
                    class="w-12 h-12 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <p>Admin API Keys Verwaltung</p>
                  <p class="text-sm">Implementierung in Entwicklung...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin: Alle Usage Section -->
        <div v-else-if="activeSidebar === 'admin-usage'" class="max-w-7xl mx-auto">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 mb-1">Alle Usage (Admin)</h1>
              <p class="text-gray-600 text-sm max-w-2xl">
                Als Administrator können Sie den API-Verbrauch aller Benutzer einsehen.
              </p>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Admin Usage Übersicht</h3>
            <p class="text-gray-600 mb-4">Hier werden alle Usage-Daten aller Benutzer angezeigt.</p>
            <!-- Hier würde die Admin Usage Übersicht kommen -->
            <div class="text-center py-8 text-gray-500">
              <svg
                class="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p>Admin Usage Verwaltung</p>
              <p class="text-sm">Implementierung in Entwicklung...</p>
            </div>
          </div>
        </div>

        <!-- Super Admin: Benutzer-Verwaltung Section -->
        <div v-else-if="activeSidebar === 'user-management'" class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-800 mb-1">
                Benutzer-Verwaltung (Super Admin)
              </h1>
              <p class="text-gray-600 text-sm max-w-2xl">
                Als Super Administrator können Sie alle Benutzer verwalten und deren Rollen ändern.
              </p>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Benutzer-Verwaltung</h3>
            <p class="text-gray-600 mb-4">
              Hier können Sie alle Benutzer einsehen und deren Rollen verwalten.
            </p>
            <!-- Hier würde die Benutzer-Verwaltung kommen -->
            <div class="text-center py-8 text-gray-500">
              <svg
                class="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <p>Benutzer-Verwaltung</p>
              <p class="text-sm">Implementierung in Entwicklung...</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Snackbar -->
    <div
      v-if="showSuccessMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300"
      :class="showSuccessMessage ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
    >
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          ></path>
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
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          ></path>
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
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          ></path>
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
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
        <span>API-Key erfolgreich deaktiviert!</span>
      </div>
    </div>
  </div>
</template>
