<script setup lang="ts">
const route = useRoute()
const { user, clear } = useUserSession()
const signingOut = ref(false)

const navItems = [
  { label: 'Dashboard', to: '/', isActive: (path: string) => path === '/' },
  { label: 'Members', to: '/members', isActive: (path: string) => path.startsWith('/members') },
]

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
        <div class="flex min-w-0 items-center gap-2 sm:gap-6">
          <NuxtLink
            to="/"
            class="flex shrink-0 items-center gap-2"
          >
            <img
              src="/logo.jpg"
              alt=""
              class="size-8 rounded"
            >
            <span class="sr-only font-semibold sm:not-sr-only">707 Gym</span>
          </NuxtLink>
          <nav
            aria-label="Main"
            class="flex items-center gap-1"
          >
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              :aria-current="item.isActive(route.path) ? 'page' : undefined"
              class="rounded-md px-3 py-1.5 text-sm font-medium"
              :class="item.isActive(route.path)
                ? 'bg-primary-50 text-primary-700'
                : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>
        <div class="flex min-w-0 items-center gap-3">
          <span class="hidden truncate text-sm text-surface-600 md:inline">{{ user?.name }}</span>
          <Button
            label="Sign out"
            severity="secondary"
            size="small"
            class="shrink-0 whitespace-nowrap"
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
    <Toast position="bottom-right" />
    <ConfirmDialog />
  </div>
</template>
