<script setup lang="ts">
import { STATUS_LABELS, type MemberStatus, type MembershipStatus } from '#shared/utils/membership'

const props = defineProps<{ status: MemberStatus | MembershipStatus }>()

// Semantic colors keep their meaning (docs/ui-design.md).
const SEVERITY = {
  'active': 'success',
  'near-expiry': 'warn',
  'expired': 'danger',
  'scheduled': 'info',
  'none': 'secondary',
} as const

const severity = computed(() => SEVERITY[props.status])
</script>

<template>
  <Tag
    :value="STATUS_LABELS[status]"
    :severity="severity"
    class="whitespace-nowrap"
  />
</template>
