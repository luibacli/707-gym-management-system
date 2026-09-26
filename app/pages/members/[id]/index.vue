<script setup lang="ts">
import type { Member, Membership } from '#shared/types/member'

const { $api } = useNuxtApp()

const route = useRoute()
const id = route.params.id as string

// Both requests start together. lazy: on client-side navigation the page renders at once
// with skeletons; a full page load still arrives server-rendered with data.
const [
  { data: member, error, refresh },
  { data: memberships, error: membershipsError, refresh: refreshMemberships },
] = await Promise.all([
  useApi<Member>(`/api/members/${id}`, { lazy: true }),
  useApi<Membership[]>(`/api/members/${id}/memberships`, { lazy: true }),
])
const notFound = computed(() => error.value?.statusCode === 404)
const fullName = computed(() => (member.value ? `${member.value.firstName} ${member.value.lastName}` : ''))

useHead({ title: () => `${fullName.value || 'Member'} · 707 Gym` })

const confirm = useConfirm()
const toast = useToast()
const updating = ref(false)

async function setArchived(archived: boolean) {
  updating.value = true
  try {
    member.value = await $api<Member>(`/api/members/${id}/${archived ? 'archive' : 'restore'}`, { method: 'POST' })
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

const dialogVisible = ref(false)
const editingMembership = ref<Membership>()
const suggestedStartDate = computed(() => suggestStartDate(memberships.value ?? [], todayInGymTimeZone()))
const hasMemberships = computed(() => !!memberships.value?.length)
// Memberships are sorted newest first; renewals default to the latest plan.
const latestPlan = computed(() => memberships.value?.[0]?.plan)

function openMembershipDialog(membership?: Membership) {
  editingMembership.value = membership
  dialogVisible.value = true
}

// Dashboard "Renew" links open the renewal dialog directly (?renew=1), once memberships have loaded.
const router = useRouter()
if (import.meta.client && route.query.renew === '1') {
  let opened = false
  watch(memberships, (loaded) => {
    if (opened || !loaded) return
    opened = true
    openMembershipDialog()
    router.replace({ query: { ...route.query, renew: undefined } })
  }, { immediate: true })
}

async function onMembershipSaved() {
  // The member's status depends on their memberships.
  await Promise.all([refreshMemberships(), refresh()])
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

    <div
      v-else-if="!member"
      class="flex flex-col gap-4"
      aria-hidden="true"
    >
      <Skeleton
        width="16rem"
        height="1.75rem"
      />
      <div class="grid gap-4 rounded-lg border border-surface-200 bg-surface-0 p-4 sm:grid-cols-2 sm:p-6">
        <div
          v-for="n in 6"
          :key="n"
          class="flex flex-col gap-2"
        >
          <Skeleton
            width="30%"
            height="0.875rem"
          />
          <Skeleton
            width="60%"
            height="1rem"
          />
        </div>
      </div>
    </div>

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-xl font-semibold">
            {{ fullName }}
          </h1>
          <StatusTag :status="member.status" />
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
            icon="pi pi-replay"
            severity="secondary"
            outlined
            :loading="updating"
            @click="setArchived(false)"
          />
          <Button
            v-else
            label="Archive"
            icon="pi pi-inbox"
            severity="secondary"
            outlined
            :loading="updating"
            @click="confirmArchive"
          />
          <Button
            as="router-link"
            :to="`/members/${member.id}/edit`"
            label="Edit"
            icon="pi pi-pencil"
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

      <section
        aria-labelledby="memberships-heading"
        class="rounded-lg border border-surface-200 bg-surface-0"
      >
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-surface-200 p-4 sm:px-6">
          <h2
            id="memberships-heading"
            class="font-semibold"
          >
            Memberships
          </h2>
          <Button
            :label="hasMemberships ? 'Renew' : 'Add membership'"
            :icon="hasMemberships ? 'pi pi-refresh' : 'pi pi-plus'"
            size="small"
            :disabled="!memberships"
            @click="openMembershipDialog()"
          />
        </div>

        <div
          v-if="membershipsError"
          class="flex flex-col items-start gap-3 p-4 sm:px-6"
        >
          <Message
            severity="error"
            size="small"
          >
            {{ getApiErrorMessage(membershipsError) }}
          </Message>
          <Button
            label="Try again"
            severity="secondary"
            outlined
            size="small"
            @click="refreshMemberships()"
          />
        </div>
        <div
          v-else-if="!memberships"
          class="flex flex-col gap-3 p-4 sm:px-6"
          aria-hidden="true"
        >
          <Skeleton
            v-for="n in 3"
            :key="n"
            height="2.5rem"
          />
        </div>
        <p
          v-else-if="!memberships.length"
          class="p-4 text-surface-600 sm:px-6"
        >
          No memberships yet.
        </p>
        <ul
          v-else
          class="divide-y divide-surface-200"
        >
          <li
            v-for="(item, index) in memberships"
            :key="item.id"
            class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6"
          >
            <div class="flex min-w-0 flex-col">
              <span class="font-medium">{{ PLAN_LABELS[item.plan] }}</span>
              <span class="text-sm text-surface-600">
                {{ formatCalendarDate(item.startDate) }} – {{ formatCalendarDate(item.expiryDate) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <!-- Past periods followed by a newer membership are history, not a problem. -->
              <Tag
                v-if="item.status === 'expired' && index > 0"
                value="Ended"
                severity="secondary"
                icon="pi pi-check"
                class="whitespace-nowrap"
              />
              <StatusTag
                v-else
                :status="item.status"
              />
              <Button
                label="Edit"
                severity="secondary"
                size="small"
                text
                :aria-label="`Edit ${PLAN_LABELS[item.plan]} membership starting ${formatCalendarDate(item.startDate)}`"
                @click="openMembershipDialog(item)"
              />
            </div>
          </li>
        </ul>
      </section>

      <MembershipDialog
        v-model:visible="dialogVisible"
        :member-id="member.id"
        :membership="editingMembership"
        :suggested-start-date="suggestedStartDate"
        :default-plan="latestPlan"
        :renewal="hasMemberships"
        @saved="onMembershipSaved"
      />
    </template>
  </div>
</template>
