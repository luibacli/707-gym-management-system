<script setup lang="ts">
// Label, optional marker, and error text for one form control (docs/ui-design.md → Forms).
defineProps<{
  label: string
  inputId: string
  error?: string
  optional?: boolean
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      :for="inputId"
      class="text-sm font-medium"
    >
      {{ label }}
      <span
        v-if="optional"
        class="font-normal text-surface-500"
      >(optional)</span>
    </label>
    <slot />
    <small
      v-if="error"
      :id="`${inputId}-error`"
      class="text-red-600"
    >{{ error }}</small>
  </div>
</template>
