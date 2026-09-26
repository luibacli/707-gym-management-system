<script setup lang="ts">
import type { AttentionList } from '#shared/types/dashboard'
import { PLAN_LABELS } from '#shared/utils/membership'

// A dashboard list of members who need a renewal follow-up.
defineProps<{
  title: string
  icon: string
  list: AttentionList
  emptyText: string
  viewAllTo: string
  viewAllLabel: string
}>()
</script>

<template>
  <section class="flex flex-col rounded-lg border border-surface-200 bg-surface-0">
    <div class="flex items-center justify-between gap-3 border-b border-surface-200 px-4 py-3">
      <h2 class="flex items-center gap-2 font-semibold">
        <i
          :class="icon"
          class="text-surface-500"
          aria-hidden="true"
        />
        {{ title }}
      </h2>
      <span class="text-sm text-surface-600">{{ list.total }}</span>
    </div>

    <p
      v-if="!list.items.length"
      class="px-4 py-6 text-center text-sm text-surface-600"
    >
      {{ emptyText }}
    </p>
    <ul
      v-else
      class="divide-y divide-surface-200"
    >
      <li
        v-for="item in list.items"
        :key="item.memberId"
        class="flex items-center justify-between gap-3 px-4 py-3"
      >
        <div class="flex min-w-0 flex-col">
          <NuxtLink
            :to="`/members/${item.memberId}`"
            class="font-medium wrap-anywhere hover:text-primary-700 hover:underline"
          >
            {{ item.firstName }} {{ item.lastName }}
          </NuxtLink>
          <span class="text-sm text-surface-600">
            {{ describeExpiry(item.daysLeft) }} · {{ PLAN_LABELS[item.plan] }} ·
            <a
              :href="`tel:${item.phone.replace(/[^\d+]/g, '')}`"
              class="whitespace-nowrap hover:text-surface-900 hover:underline"
            >{{ item.phone }}</a>
          </span>
        </div>
        <Button
          as="router-link"
          :to="`/members/${item.memberId}?renew=1`"
          label="Renew"
          icon="pi pi-refresh"
          size="small"
          severity="secondary"
          outlined
          class="shrink-0"
          :aria-label="`Renew ${item.firstName} ${item.lastName}`"
        />
      </li>
    </ul>

    <p
      v-if="list.total > list.items.length"
      class="px-4 pb-2 text-sm text-surface-600"
    >
      Showing {{ list.items.length }} of {{ list.total }}.
    </p>
    <NuxtLink
      :to="viewAllTo"
      class="mt-auto border-t border-surface-200 px-4 py-2.5 text-center text-sm font-medium text-surface-700 hover:bg-surface-50"
    >
      {{ viewAllLabel }}
    </NuxtLink>
  </section>
</template>
