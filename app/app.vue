<template>
  <div>
    <!-- Top progress bar while navigating, in the brand color. -->
    <NuxtLoadingIndicator
      color="var(--p-primary-500)"
      :height="3"
    />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
