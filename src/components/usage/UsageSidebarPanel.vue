<template>
  <div class="w-full lg:w-64 flex-shrink-0 bg-white rounded-xl shadow p-6 flex flex-col gap-4">
    <div>
      <div class="text-xs text-gray-500 mb-1">July budget</div>
      <div class="flex items-center justify-between mb-1">
        <span class="font-semibold text-sm">$0.00 / $15</span>
        <span class="text-xs text-gray-400">Resets in 20 days</span>
      </div>
      <div class="w-full h-2 bg-gray-100 rounded">
        <div class="h-2 bg-blue-400 rounded" style="width: 0%"></div>
      </div>
      <a href="#" class="text-xs text-blue-600 hover:underline mt-1 inline-block">Edit budget</a>
    </div>
    <div>
      <div class="text-xs text-gray-500 mb-1">Total tokens</div>
      <div class="font-semibold text-lg">298,319</div>
      <div class="w-full h-8 bg-gray-50 rounded flex items-end">
        <div class="h-6 w-2 bg-orange-400 rounded mr-1"></div>
        <div class="h-3 w-2 bg-orange-200 rounded mr-1"></div>
        <div class="h-5 w-2 bg-orange-400 rounded mr-1"></div>
        <div class="h-2 w-2 bg-orange-200 rounded"></div>
      </div>
    </div>
    <div>
      <div class="text-xs text-gray-500 mb-1">Total requests</div>
      <div class="font-semibold text-lg">64</div>
      <div class="w-full h-8 bg-gray-50 rounded flex items-end">
        <div class="h-4 w-2 bg-purple-400 rounded mr-1"></div>
        <div class="h-7 w-2 bg-purple-200 rounded mr-1"></div>
        <div class="h-3 w-2 bg-purple-400 rounded mr-1"></div>
        <div class="h-6 w-2 bg-purple-200 rounded"></div>
      </div>
    </div>
    <div>
      <div class="text-xs text-gray-500 mb-1">Users</div>
      <div class="flex items-center gap-2 mt-1">
        <span class="inline-flex items-center gap-1 text-sm font-medium"><span class="w-2 h-2 bg-blue-600 rounded-full inline-block"></span> Domenic Schumacher</span>
        <span class="ml-auto text-xs text-gray-500">64</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dummy-Daten, keine Logik nötig
</script> 