<script setup lang="ts">
import type { DataTablePageEvent } from 'primevue/datatable'
import type { ListResponse, Member } from '#shared/types/member'

useHead({ title: 'Members · 707 Gym' })

const searchInput = ref('')
const search = ref('')
const archived = ref(false)
const page = ref(1)

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

const { data, status, error, refresh } = await useFetch<ListResponse<Member>>('/api/members', {
  query: { search, archived, page },
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
      />
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <InputText
        v-model="searchInput"
        type="search"
        placeholder="Search name, phone, or email"
        aria-label="Search members"
        class="w-full sm:max-w-sm"
      />
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
        :loading="status === 'pending'"
        @page="onPage"
      >
        <Column header="Name">
          <template #body="{ data: member }">
            <NuxtLink
              :to="`/members/${member.id}`"
              class="font-medium hover:text-primary-700 hover:underline"
            >
              {{ member.lastName }}, {{ member.firstName }}
            </NuxtLink>
          </template>
        </Column>
        <Column
          field="phone"
          header="Phone"
        />
        <Column
          header="Email"
          header-class="hidden md:table-cell"
          body-class="hidden md:table-cell"
        >
          <template #body="{ data: member }">
            <span class="break-all">{{ member.email ?? '—' }}</span>
          </template>
        </Column>
        <Column
          header="Added"
          header-class="hidden lg:table-cell"
          body-class="hidden lg:table-cell"
        >
          <template #body="{ data: member }">
            {{ formatTimestampDate(member.createdAt) }}
          </template>
        </Column>
        <template #empty>
          <div class="py-8 text-center text-surface-600">
            <template v-if="search">
              No members match “{{ search }}”.
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
