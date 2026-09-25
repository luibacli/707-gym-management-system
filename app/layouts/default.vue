<script setup lang="ts">
const { user, clear } = useUserSession()
const signingOut = ref(false)

async function signOut() {
  signingOut.value = true
  try {
    await clear()
    await navigateTo('/login')
  }
  finally {
    signingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-50 text-surface-900">
    <header class="border-b border-surface-200 bg-surface-0">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div class="flex min-w-0 items-center gap-2">
          <img
            src="/logo.jpg"
            alt=""
            class="size-8 shrink-0 rounded"
          >
          <span class="truncate font-semibold">707 Gym</span>
        </div>
        <div class="flex min-w-0 items-center gap-3">
          <span class="hidden truncate text-sm text-surface-600 sm:inline">{{ user?.name }}</span>
          <Button
            label="Sign out"
            severity="secondary"
            size="small"
            text
            :loading="signingOut"
            @click="signOut"
          />
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-6">
      <slot />
    </main>
  </div>
</template>
