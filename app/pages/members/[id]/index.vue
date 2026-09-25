<script setup lang="ts">
import type { Member } from '#shared/types/member'

const route = useRoute()
const id = route.params.id as string

const { data: member, error, refresh } = await useFetch<Member>(`/api/members/${id}`)
const notFound = computed(() => error.value?.statusCode === 404)
const fullName = computed(() => (member.value ? `${member.value.firstName} ${member.value.lastName}` : ''))

useHead({ title: () => `${fullName.value || 'Member'} · 707 Gym` })

const confirm = useConfirm()
const toast = useToast()
const updating = ref(false)

async function setArchived(archived: boolean) {
  updating.value = true
  try {
    member.value = await $fetch<Member>(`/api/members/${id}/${archived ? 'archive' : 'restore'}`, { method: 'POST' })
    toast.add({ severity: 'success', summary: archived ? 'Member archived' : 'Member restored', life: 3000 })
  }
  catch (err) {
    toast.add({ severity: 'error', summary: getApiErrorMessage(err), life: 5000 })
  }
  finally {
    updating.value = false
  }
}

function confirmArchive() {
  confirm.require({
    header: 'Archive member?',
    message: `${fullName.value} will be hidden from the member list and dashboard. You can restore them later.`,
    acceptProps: { label: 'Archive', severity: 'danger' },
    rejectProps: { label: 'Cancel', severity: 'secondary', text: true },
    accept: () => setArchived(true),
  })
}

const details = computed(() => {
  const m = member.value
  if (!m) return []
  const emergency = [m.emergencyContactName, m.emergencyContactPhone].filter(Boolean).join(' · ')
  return [
    { label: 'Phone', value: m.phone },
    { label: 'Email', value: m.email },
    { label: 'Birth date', value: m.birthDate && formatCalendarDate(m.birthDate) },
    { label: 'Emergency contact', value: emergency },
    { label: 'Address', value: m.address, wide: true },
    { label: 'Notes', value: m.notes, wide: true },
    { label: 'Added', value: formatTimestampDate(m.createdAt) },
    { label: 'Last updated', value: formatTimestampDate(m.updatedAt) },
  ]
})
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-4">
    <NuxtLink
      to="/members"
      class="text-sm text-surface-600 hover:text-surface-900"
    >
      ← Members
    </NuxtLink>

    <div
      v-if="notFound"
      class="rounded-lg border border-surface-200 bg-surface-0 p-6"
    >
      <h1 class="text-lg font-semibold">
        Member not found
      </h1>
      <p class="mt-1 text-surface-600">
        This member doesn't exist or the link is incorrect.
      </p>
    </div>

    <div
      v-else-if="error"
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

    <template v-else-if="member">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-xl font-semibold">
            {{ fullName }}
          </h1>
          <Tag
            v-if="member.archived"
            value="Archived"
            severity="secondary"
          />
        </div>
        <div class="flex gap-2">
          <Button
            v-if="member.archived"
            label="Restore"
            severity="secondary"
            outlined
            :loading="updating"
            @click="setArchived(false)"
          />
          <Button
            v-else
            label="Archive"
            severity="secondary"
            outlined
            :loading="updating"
            @click="confirmArchive"
          />
          <Button
            as="router-link"
            :to="`/members/${member.id}/edit`"
            label="Edit"
          />
        </div>
      </div>

      <dl class="grid gap-x-6 gap-y-4 rounded-lg border border-surface-200 bg-surface-0 p-4 sm:grid-cols-2 sm:p-6">
        <div
          v-for="item in details"
          :key="item.label"
          :class="item.wide ? 'sm:col-span-2' : ''"
        >
          <dt class="text-sm text-surface-600">
            {{ item.label }}
          </dt>
          <dd class="mt-0.5 whitespace-pre-line break-words">
            <template v-if="item.value">
              {{ item.value }}
            </template>
            <span
              v-else
              class="text-surface-400"
            >—</span>
          </dd>
        </div>
      </dl>
    </template>
  </div>
</template>
