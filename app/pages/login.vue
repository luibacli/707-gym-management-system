<script setup lang="ts">
import { z } from 'zod'
import { loginSchema, type LoginInput } from '#shared/schemas/auth'

definePageMeta({ layout: false })
useHead({ title: 'Sign in · 707 Gym' })

const { fetch: refreshSession } = useUserSession()

const form = reactive<LoginInput>({ email: '', password: '' })
const fieldErrors = ref<Partial<Record<keyof LoginInput, string[]>>>({})
const formError = ref('')
const submitting = ref(false)

async function onSubmit() {
  formError.value = ''
  fieldErrors.value = {}

  const parsed = loginSchema.safeParse(form)
  if (!parsed.success) {
    fieldErrors.value = z.flattenError(parsed.error).fieldErrors
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: parsed.data })
    await refreshSession()
    await navigateTo('/')
  }
  catch (error) {
    fieldErrors.value = getApiFieldErrors(error)
    formError.value = getApiErrorMessage(error)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-10 text-surface-900">
    <div class="w-full max-w-sm rounded-lg border border-surface-200 bg-surface-0 p-6 sm:p-8">
      <div class="mb-6 flex flex-col items-center gap-3 text-center">
        <img
          src="/logo.jpg"
          alt="707 Gym logo"
          class="size-16 rounded-md"
        >
        <div>
          <h1 class="text-xl font-semibold">
            Staff sign in
          </h1>
          <p class="mt-1 text-sm text-surface-600">
            707 Gym Management System
          </p>
        </div>
      </div>

      <form
        class="flex flex-col gap-4"
        novalidate
        @submit.prevent="onSubmit"
      >
        <Message
          v-if="formError"
          severity="error"
          size="small"
          role="alert"
        >
          {{ formError }}
        </Message>

        <div class="flex flex-col gap-1.5">
          <label
            for="email"
            class="text-sm font-medium"
          >Email</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="username"
            :invalid="!!fieldErrors.email"
            :aria-describedby="fieldErrors.email ? 'email-error' : undefined"
            fluid
          />
          <small
            v-if="fieldErrors.email"
            id="email-error"
            class="text-red-600"
          >{{ fieldErrors.email[0] }}</small>
        </div>

        <div class="flex flex-col gap-1.5">
          <label
            for="password"
            class="text-sm font-medium"
          >Password</label>
          <Password
            v-model="form.password"
            input-id="password"
            autocomplete="current-password"
            :feedback="false"
            :invalid="!!fieldErrors.password"
            :input-props="{ 'aria-describedby': fieldErrors.password ? 'password-error' : undefined }"
            toggle-mask
            fluid
          />
          <small
            v-if="fieldErrors.password"
            id="password-error"
            class="text-red-600"
          >{{ fieldErrors.password[0] }}</small>
        </div>

        <Button
          type="submit"
          label="Sign in"
          :loading="submitting"
          fluid
        />
      </form>
    </div>
  </div>
</template>
