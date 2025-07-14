<template>
  <div class="flex-1 bg-white rounded-xl shadow p-6">
    <div class="flex items-center justify-between mb-2">
      <div>
        <div class="text-xs text-gray-500">Total Spend</div>
        <div class="text-2xl font-bold">$0.73</div>
        <div class="text-xs text-purple-600">$0.57</div>
      </div>
      <div class="text-xs text-gray-500">Group by <b>1d</b></div>
    </div>
    <!-- Dummy Chart -->
    <div class="h-32 w-full flex items-end gap-1 mt-4">
      <div v-for="n in 10" :key="n" :style="{height: (n === 5 ? '80%' : n % 3 === 0 ? '40%' : '20%'), background: '#a78bfa'}" class="flex-1 rounded-t"></div>
    </div>
    <div class="flex justify-between text-xs text-gray-400 mt-2">
      <span>Mar 01</span>
      <span>Mar 31</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dummy-Daten, keine Logik nötig
</script> 