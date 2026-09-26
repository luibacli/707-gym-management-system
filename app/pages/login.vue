<script setup lang="ts">
import { z } from 'zod'
import { loginSchema, type LoginInput } from '#shared/schemas/auth'

definePageMeta({ layout: false })
useHead({ title: 'Sign in · 707 Gym' })

const { fetch: refreshSession } = useUserSession()
const route = useRoute()
const sessionEnded = computed(() => route.query.reason === 'session-ended')

// Manila time on both server and client, so the rendered greeting always matches.
const now = new Date()
const greeting = greetingFor(now)
const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: GYM_TIME_ZONE }).format(now)

const form = reactive<LoginInput>({ email: '', password: '' })

// Focus the email field on devices with a mouse/trackpad; on touch screens this
// would pop up the keyboard over the page.
onMounted(() => {
  if (window.matchMedia('(pointer: fine)').matches) document.getElementById('email')?.focus()
})
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
  <div class="grid min-h-screen text-surface-900 lg:grid-cols-2">
    <!-- Brand panel (desktop only). Lists only what the app actually does. -->
    <aside class="hidden flex-col justify-between bg-surface-900 p-12 text-surface-0 lg:flex">
      <div aria-hidden="true" />

      <div class="flex max-w-md flex-col gap-8">
        <div class="flex items-center gap-4">
          <img
            src="/logo.jpg"
            alt="707 Gym logo"
            class="size-20 rounded-xl"
          >
          <span class="text-2xl font-semibold">707 Gym</span>
        </div>
        <p class="text-3xl leading-tight font-semibold">
          Memberships, renewals, and expiry dates at a glance.
        </p>
        <ul class="flex flex-col gap-4 text-surface-300">
          <li class="flex items-start gap-3">
            <i
              class="pi pi-clock mt-1 text-primary-400"
              aria-hidden="true"
            />
            See who's expiring this week, first thing every morning.
          </li>
          <li class="flex items-start gap-3">
            <i
              class="pi pi-refresh mt-1 text-primary-400"
              aria-hidden="true"
            />
            Renew a membership in two clicks.
          </li>
          <li class="flex items-start gap-3">
            <i
              class="pi pi-search mt-1 text-primary-400"
              aria-hidden="true"
            />
            Find any member by name or phone number.
          </li>
        </ul>
      </div>

      <p class="text-sm text-surface-400">
        Membership Management System
      </p>
    </aside>

    <main class="flex flex-col bg-surface-50 px-4">
      <div class="flex flex-1 items-center justify-center py-10">
        <div class="w-full max-w-sm rounded-xl border border-surface-200 bg-surface-0 p-6 shadow-sm sm:p-8">
          <div class="mb-6 flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <img
              src="/logo.jpg"
              alt="707 Gym logo"
              class="size-16 rounded-md lg:hidden"
            >
            <div>
              <p class="text-xs font-semibold tracking-wider text-primary-600 uppercase">
                Staff portal
              </p>
              <h1 class="mt-1 text-3xl font-semibold">
                {{ greeting }}
              </h1>
              <p class="mt-1 text-sm text-surface-600">
                Sign in to 707 Gym
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
            <Message
              v-else-if="sessionEnded"
              severity="info"
              size="small"
            >
              Your session has ended. Please sign in again.
            </Message>

            <div class="flex flex-col gap-1.5">
              <label
                for="email"
                class="text-sm font-medium"
              >Email</label>
              <IconField>
                <InputIcon
                  class="pi pi-envelope"
                  aria-hidden="true"
                />
                <InputText
                  id="email"
                  v-model="form.email"
                  type="email"
                  autocomplete="username"
                  :invalid="!!fieldErrors.email"
                  :aria-describedby="fieldErrors.email ? 'email-error' : undefined"
                  fluid
                />
              </IconField>
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
              <IconField>
                <InputIcon
                  class="pi pi-lock z-10"
                  aria-hidden="true"
                />
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
              </IconField>
              <small
                v-if="fieldErrors.password"
                id="password-error"
                class="text-red-600"
              >{{ fieldErrors.password[0] }}</small>
            </div>

            <Button
              type="submit"
              label="Sign in"
              icon="pi pi-arrow-right"
              icon-pos="right"
              :loading="submitting"
              fluid
              class="mt-2"
            />
          </form>
        </div>
      </div>

      <footer class="flex flex-col items-center gap-1 pb-6 text-center text-sm text-surface-500">
        <p>Forgot your password? Ask the gym owner.</p>
        <p>&copy; {{ year }} 707 Gym</p>
      </footer>
    </main>
  </div>
</template>
