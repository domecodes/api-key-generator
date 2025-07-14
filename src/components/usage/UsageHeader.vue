<template>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
    <h1 class="text-2xl font-bold text-gray-800">Usage</h1>
    <div class="flex items-center gap-2">
      <select class="border rounded px-2 py-1 text-sm">
        <option>Default project</option>
      </select>
      <input type="text" class="border rounded px-2 py-1 text-sm w-40" value="03/01/25 - 07/10/25" readonly />
      <button class="border rounded px-3 py-1 text-sm bg-white hover:bg-gray-100">Export</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Keine Logik nötig, alles statisch/dummy
</script> 