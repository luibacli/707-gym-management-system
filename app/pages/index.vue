<script setup lang="ts">
import type { DashboardSummary } from '#shared/types/dashboard'
import type { MemberStatus } from '#shared/utils/membership'

useHead({ title: 'Dashboard · 707 Gym' })

// lazy: on client-side navigation the page renders at once and shows skeletons while loading.
const { data: summary, error, refresh } = await useApi<DashboardSummary>('/api/dashboard', { lazy: true })

interface Tile {
  label: string
  value: number
  to: string
  /** Status tiles show the status icon (in its color) next to the label; never color alone. */
  status?: MemberStatus
}

const tiles = computed<Tile[]>(() => {
  const s = summary.value
  if (!s) return []
  return [
    { label: 'Total members', value: s.totalMembers, to: '/members' },
    { label: 'Active', value: s.active, to: '/members?status=active', status: 'active' },
    { label: 'Near expiry', value: s.nearExpiry, to: '/members?status=near-expiry', status: 'near-expiry' },
    { label: 'Expired', value: s.expired, to: '/members?status=expired', status: 'expired' },
  ]
})

const ICON_COLOR: Record<MemberStatus, string> = {
  'active': 'text-green-600',
  'near-expiry': 'text-orange-600',
  'expired': 'text-red-600',
  'none': 'text-surface-500',
}

const numberFormat = new Intl.NumberFormat('en-US')
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex flex-col gap-1">
        <h1 class="text-xl font-semibold">
          Dashboard
        </h1>
        <p
          v-if="summary"
          class="text-sm text-surface-600"
        >
          Membership status as of {{ formatCalendarDate(summary.asOf) }}. Archived members aren't counted.
        </p>
      </div>
      <Button
        as="router-link"
        to="/members/new"
        label="Add member"
        icon="pi pi-plus"
      />
    </div>

    <div
      v-if="error"
      class="flex flex-col items-start gap-3 rounded-lg border border-surface-200 bg-surface-0 p-6"
    >
      <Message
        severity="error"
        size="small"
      >
        {{ getApiErrorMessage(error) }}
      </Message>
      <Button
        label="Try again"
        severity="secondary"
        outlined
        size="small"
        @click="refresh()"
      />
    </div>

    <template v-else>
      <ul
        class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
        aria-label="Membership summary"
      >
        <template v-if="!summary">
          <li
            v-for="n in 4"
            :key="n"
            class="rounded-lg border border-surface-200 bg-surface-0 p-4"
          >
            <Skeleton
              width="60%"
              height="1rem"
            />
            <Skeleton
              width="40%"
              height="2.25rem"
              class="mt-3"
            />
          </li>
        </template>
        <li
          v-for="tile in tiles"
          :key="tile.label"
        >
          <NuxtLink
            :to="tile.to"
            class="flex h-full flex-col gap-2 rounded-lg border border-surface-200 bg-surface-0 p-4 transition-colors hover:border-surface-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <span class="flex items-center gap-2 text-sm text-surface-600">
              <i
                :class="[tile.status ? STATUS_ICON[tile.status] : 'pi pi-users', tile.status ? ICON_COLOR[tile.status] : 'text-surface-500']"
                aria-hidden="true"
              />
              {{ tile.label }}
            </span>
            <span class="text-3xl font-semibold text-surface-900">{{ numberFormat.format(tile.value) }}</span>
          </NuxtLink>
        </li>
      </ul>

      <p
        v-if="summary && summary.totalMembers === 0"
        class="text-surface-600"
      >
        No members yet.
        <NuxtLink
          to="/members/new"
          class="font-medium text-primary-700 hover:underline"
        >Add the first member</NuxtLink>
      </p>

      <div
        v-else-if="!summary"
        class="grid gap-4 lg:grid-cols-2"
        aria-hidden="true"
      >
        <div
          v-for="n in 2"
          :key="n"
          class="flex flex-col gap-4 rounded-lg border border-surface-200 bg-surface-0 p-4"
        >
          <Skeleton
            width="40%"
            height="1.25rem"
          />
          <div
            v-for="row in 4"
            :key="row"
            class="flex items-center justify-between gap-3"
          >
            <div class="flex w-2/3 flex-col gap-2">
              <Skeleton
                width="60%"
                height="1rem"
              />
              <Skeleton
                width="90%"
                height="0.875rem"
              />
            </div>
            <Skeleton
              width="5rem"
              height="2rem"
            />
          </div>
        </div>
      </div>

      <template v-else>
        <div class="grid gap-4 lg:grid-cols-2">
          <AttentionPanel
            title="Expiring this week"
            icon="pi pi-clock"
            :list="summary.expiringSoon"
            empty-text="No memberships expire in the next 7 days."
            view-all-to="/members?status=near-expiry"
            view-all-label="All near-expiry members"
          />
          <AttentionPanel
            title="Recently expired"
            icon="pi pi-history"
            :list="summary.recentlyExpired"
            empty-text="No memberships expired in the last 30 days."
            view-all-to="/members?status=expired"
            view-all-label="All expired members"
          />
        </div>

        <p
          v-if="summary.noMembership > 0"
          class="text-sm text-surface-600"
        >
          <NuxtLink
            to="/members?status=none"
            class="font-medium text-surface-900 hover:underline"
          >{{ numberFormat.format(summary.noMembership) }} of {{ numberFormat.format(summary.totalMembers) }}
            members have no membership.</NuxtLink>
        </p>
      </template>
    </template>
  </div>
</template>
