<script setup lang="ts">
import type { MemberInput } from '#shared/schemas/member'
import type { FieldErrors } from '#shared/types/api'
import type { Member } from '#shared/types/member'

useHead({ title: 'Add member · 707 Gym' })

const toast = useToast()
const submitting = ref(false)
const formError = ref('')
const serverErrors = ref<FieldErrors>({})

async function create(input: MemberInput) {
  submitting.value = true
  formError.value = ''
  serverErrors.value = {}
  try {
    const member = await $fetch<Member>('/api/members', { method: 'POST', body: input })
    toast.add({ severity: 'success', summary: 'Member added', life: 3000 })
    await navigateTo(`/members/${member.id}`, { replace: true })
  }
  catch (error) {
    formError.value = getApiErrorMessage(error)
    serverErrors.value = getApiFieldErrors(error)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-4">
    <NuxtLink
      to="/members"
      class="text-sm text-surface-600 hover:text-surface-900"
    >
      ← Members
    </NuxtLink>
    <h1 class="text-xl font-semibold">
      Add member
    </h1>
    <MemberForm
      submit-label="Add member"
      cancel-to="/members"
      :submitting="submitting"
      :form-error="formError"
      :server-errors="serverErrors"
      @submit="create"
    />
  </div>
</template>
