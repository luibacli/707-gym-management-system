<script setup lang="ts">
import type { MemberInput } from '#shared/schemas/member'
import type { FieldErrors } from '#shared/types/api'
import type { Member } from '#shared/types/member'

const { $api } = useNuxtApp()

const route = useRoute()
const id = route.params.id as string
const detailPath = `/members/${id}`

// lazy: on client-side navigation the page renders at once with a skeleton while loading.
const { data: member, error, refresh } = await useApi<Member>(`/api/members/${id}`, { lazy: true })
const notFound = computed(() => error.value?.statusCode === 404)

useHead({ title: 'Edit member · 707 Gym' })

const toast = useToast()
const submitting = ref(false)
const formError = ref('')
const serverErrors = ref<FieldErrors>({})

async function save(input: MemberInput) {
  submitting.value = true
  formError.value = ''
  serverErrors.value = {}
  try {
    await $api<Member>(`/api/members/${id}`, { method: 'PATCH', body: input })
    toast.add({ severity: 'success', summary: 'Changes saved', life: 3000 })
    await navigateTo(detailPath, { replace: true })
  }
  catch (err) {
    formError.value = getApiErrorMessage(err)
    serverErrors.value = getApiFieldErrors(err)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-4">
    <NuxtLink
      :to="notFound ? '/members' : detailPath"
      class="text-sm text-surface-600 hover:text-surface-900"
    >
      ← {{ notFound ? 'Members' : 'Back to member' }}
    </NuxtLink>

    <div
      v-if="notFound"
      class="rounded-lg border border-surface-200 bg-surface-0 p-6"
    >
      <h1 class="text-lg font-semibold">
        Member not found
      </h1>
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
        width="14rem"
        height="1.75rem"
      />
      <Skeleton
        height="18rem"
      />
    </div>

    <template v-else>
      <h1 class="text-xl font-semibold">
        Edit {{ member.firstName }} {{ member.lastName }}
      </h1>
      <MemberForm
        :member="member"
        submit-label="Save changes"
        :cancel-to="detailPath"
        :submitting="submitting"
        :form-error="formError"
        :server-errors="serverErrors"
        @submit="save"
      />
    </template>
  </div>
</template>
