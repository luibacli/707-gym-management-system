<script setup lang="ts">
import type { DataTablePageEvent } from 'primevue/datatable'
import type { ListResponse, Member } from '#shared/types/member'
import { MEMBER_STATUSES, STATUS_LABELS, type MemberStatus } from '#shared/utils/membership'

useHead({ title: 'Members · 707 Gym' })

const route = useRoute()
const router = useRouter()

function statusFromQuery(value: unknown): MemberStatus | null {
  return MEMBER_STATUSES.includes(value as MemberStatus) ? (value as MemberStatus) : null
}

const searchInput = ref('')
const search = ref('')
const archived = ref(false)
const page = ref(1)
// Kept in the URL so dashboard tiles can link to a filtered list.
const status = ref<MemberStatus | null>(statusFromQuery(route.query.status))

const statusOptions = MEMBER_STATUSES.map(value => ({ label: STATUS_LABELS[value], value }))

watch(status, (value) => {
  page.value = 1
  router.replace({ query: { ...route.query, status: value ?? undefined } })
})
watch(() => route.query.status, (value) => {
  status.value = statusFromQuery(value)
})

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = value.trim()
    page.value = 1
  }, 300)
})
watch(archived, () => {
  page.value = 1
})

const { data, status: fetchStatus, error, refresh } = await useApi<ListResponse<Member>>('/api/members', {
  query: { search, archived, page, status: computed(() => status.value ?? undefined) },
})

const pageSize = computed(() => data.value?.pageSize ?? 20)
const viewOptions = [
  { label: 'Active', value: false },
  { label: 'Archived', value: true },
]

function onPage(event: DataTablePageEvent) {
  page.value = event.page + 1
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">
        Members
      </h1>
      <Button
        as="router-link"
        to="/members/new"
        label="Add member"
        icon="pi pi-plus"
      />
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <IconField class="w-full sm:w-72">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchInput"
            type="search"
            placeholder="Search name, phone, or email"
            aria-label="Search members"
            fluid
          />
        </IconField>
        <Select
          v-model="status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="All statuses"
          show-clear
          aria-label="Filter by status"
          class="w-full sm:w-48"
        />
      </div>
      <SelectButton
        v-model="archived"
        :options="viewOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-label="Show active or archived members"
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

    <div
      v-else
      class="overflow-hidden rounded-lg border border-surface-200 bg-surface-0"
    >
      <DataTable
        :value="data?.items ?? []"
        data-key="id"
        lazy
        paginator
        :rows="pageSize"
        :first="(page - 1) * pageSize"
        :total-records="data?.total ?? 0"
        :loading="fetchStatus === 'pending'"
        @page="onPage"
      >
        <Column header="Name">
          <template #body="{ data: member }">
            <NuxtLink
              :to="`/members/${member.id}`"
              class="font-medium wrap-anywhere hover:text-primary-700 hover:underline"
            >
              {{ member.lastName }}, {{ member.firstName }}
            </NuxtLink>
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data: member }">
            <StatusTag :status="member.status" />
          </template>
        </Column>
        <Column
          field="phone"
          header="Phone"
          header-class="hidden sm:table-cell"
          body-class="hidden sm:table-cell"
        />
        <Column
          header="Email"
          header-class="hidden lg:table-cell"
          body-class="hidden lg:table-cell"
        >
          <template #body="{ data: member }">
            <span class="break-all">{{ member.email ?? '—' }}</span>
          </template>
        </Column>
        <Column
          header="Expires"
          header-class="hidden md:table-cell"
          body-class="hidden md:table-cell whitespace-nowrap"
        >
          <template #body="{ data: member }">
            <template v-if="member.currentExpiryDate">
              {{ formatCalendarDate(member.currentExpiryDate) }}
            </template>
            <span
              v-else
              class="text-surface-400"
            >—</span>
          </template>
        </Column>
        <template #empty>
          <div class="py-8 text-center text-surface-600">
            <template v-if="search">
              No members match “{{ search }}”{{ status ? ` with status “${STATUS_LABELS[status]}”` : '' }}.
            </template>
            <template v-else-if="status">
              No {{ archived ? 'archived ' : '' }}members with status “{{ STATUS_LABELS[status] }}”.
            </template>
            <template v-else-if="archived">
              No archived members.
            </template>
            <template v-else>
              No members yet. Use “Add member” to register the first one.
            </template>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
