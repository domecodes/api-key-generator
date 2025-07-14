<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
      <h3 class="text-xl font-bold mb-4">Edit secret key</h3>
      <label class="block mb-1 text-sm font-medium">Name <span class="text-gray-400 font-normal">Optional</span></label>
      <input
        v-model="localName"
        @input="$emit('update:name', localName)"
        class="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="e.g. My App Key"
      />
      <label class="block mb-2 text-sm font-medium">Permissions</label>
      <div class="flex gap-2 mb-4">
        <button
          v-for="perm in permissionOptions"
          :key="perm"
          :class="[ 'px-4 py-2 rounded font-medium border', localPermissions === perm ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-200 text-gray-500', 'transition-colors']"
          @click="setPermissions(perm)"
          type="button"
        >
          {{ perm }}
        </button>
      </div>
      <div class="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded p-3 mb-6">
        <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"/></svg>
        <span class="text-xs text-gray-600">Permission changes may take a few minutes to take effect.</span>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="$emit('cancel')" class="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium">Cancel</button>
        <button @click="$emit('save')" class="px-4 py-2 rounded bg-green-600 text-white font-medium">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{
  modelValue: boolean,
  name: string,
  permissions: string,
  permissionOptions: string[]
}>()
const emits = defineEmits(['update:name', 'update:permissions', 'cancel', 'save'])
const localName = ref(props.name)
const localPermissions = ref(props.permissions)
watch(() => props.name, val => localName.value = val)
watch(() => props.permissions, val => localPermissions.value = val)
function setPermissions(perm: string) {
  localPermissions.value = perm
  emits('update:permissions', perm)
}
</script> 