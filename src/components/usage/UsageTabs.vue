<template>
  <div class="max-w-7xl mx-auto">
    <!-- Tabs Navigation -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'own'"
          :class="[
            activeTab === 'own'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
          ]"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Meine Usage
        </button>

        <button
          v-if="isApiAdmin"
          @click="activeTab = 'admin'"
          :class="[
            activeTab === 'admin'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
          ]"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Admin Usage (Alle Accounts)
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'own'" class="space-y-6">
      <!-- Own Usage Content -->
      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Meine Usage-Daten</h2>
        <p class="text-gray-600 mb-4">Hier sehen Sie Ihre persönlichen API-Nutzungsdaten.</p>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-sm text-blue-600 font-medium">Gesamte Tokens</div>
            <div class="text-2xl font-bold text-blue-800">298,319</div>
            <div class="text-xs text-blue-600 mt-1">+12% vs. letzter Monat</div>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <div class="text-sm text-green-600 font-medium">Gesamte Requests</div>
            <div class="text-2xl font-bold text-green-800">1,247</div>
            <div class="text-xs text-green-600 mt-1">+8% vs. letzter Monat</div>
          </div>

          <div class="bg-purple-50 rounded-lg p-4">
            <div class="text-sm text-purple-600 font-medium">Gesamte Kosten</div>
            <div class="text-2xl font-bold text-purple-800">$45.67</div>
            <div class="text-xs text-purple-600 mt-1">+15% vs. letzter Monat</div>
          </div>
        </div>
      </div>

      <!-- Usage Chart -->
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Usage-Verlauf</h3>
        <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p class="text-gray-500">Usage-Chart wird hier angezeigt</p>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'admin'" class="space-y-6">
      <!-- Admin Usage Content -->
      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Admin Usage - Alle Accounts</h2>
        <p class="text-gray-600 mb-4">Übersicht über die API-Nutzung aller Benutzer.</p>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-sm text-blue-600 font-medium">Aktive Benutzer</div>
            <div class="text-2xl font-bold text-blue-800">24</div>
            <div class="text-xs text-blue-600 mt-1">+3 neue diesen Monat</div>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <div class="text-sm text-green-600 font-medium">Gesamte Tokens</div>
            <div class="text-2xl font-bold text-green-800">1,247,892</div>
            <div class="text-xs text-green-600 mt-1">+18% vs. letzter Monat</div>
          </div>

          <div class="bg-purple-50 rounded-lg p-4">
            <div class="text-sm text-purple-600 font-medium">Gesamte Requests</div>
            <div class="text-2xl font-bold text-purple-800">45,123</div>
            <div class="text-xs text-purple-600 mt-1">+22% vs. letzter Monat</div>
          </div>

          <div class="bg-orange-50 rounded-lg p-4">
            <div class="text-sm text-orange-600 font-medium">Gesamte Kosten</div>
            <div class="text-2xl font-bold text-orange-800">$1,234.56</div>
            <div class="text-xs text-orange-600 mt-1">+25% vs. letzter Monat</div>
          </div>
        </div>
      </div>

      <!-- Top Users Table -->
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Benutzer nach Usage</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Benutzer
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tokens
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Requests
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kosten
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rolle
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-800">DS</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">Domenic Schumacher</div>
                      <div class="text-sm text-gray-500">domenic@example.com</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">298,319</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1,247</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$45.67</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                    >API-Admin</span
                  >
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-green-800">JS</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">John Smith</div>
                      <div class="text-sm text-gray-500">john@example.com</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">156,234</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">892</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$23.45</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >API-Default</span
                  >
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-orange-800">MJ</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">Maria Johnson</div>
                      <div class="text-sm text-gray-500">maria@example.com</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">98,567</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">456</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$12.34</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                    >API-Stream</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Admin Usage Chart -->
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Admin Usage-Verlauf</h3>
        <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p class="text-gray-500">Admin Usage-Chart wird hier angezeigt</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { hasPermission } from '@/auth/keycloak'
import { computed, ref } from 'vue'

const activeTab = ref('own')

// Prüfe ob Benutzer API-Admin ist
const isApiAdmin = computed(() => hasPermission('canViewAdminUsage'))

// Setze Standard-Tab basierend auf Rolle
if (!isApiAdmin.value) {
  activeTab.value = 'own'
}
</script>
