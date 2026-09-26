<script setup lang="ts">
import { STATUS_LABELS, type MemberStatus, type MembershipStatus } from '#shared/utils/membership'

defineProps<{ status: MemberStatus | MembershipStatus }>()
</script>

<template>
  <Tag
    :value="STATUS_LABELS[status]"
    :severity="STATUS_SEVERITY[status]"
    :icon="STATUS_ICON[status]"
    class="whitespace-nowrap"
  />
</template>
