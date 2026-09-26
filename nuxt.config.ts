// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    '@pinia/nuxt',
    '@primevue/nuxt-module',
    'nuxt-auth-utils',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  css: ['primeicons/primeicons.css', '~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  primevue: {
    // Theme preset and options live in app/theme (see ADR-004).
    importTheme: { as: 'AppTheme', from: '~/theme/index.ts' },
  },

  runtimeConfig: {
    // Server-only. Set via NUXT_MONGODB_URI.
    mongodbUri: '',
  },

  typescript: {
    typeCheck: false,
    // Typecheck CLI scripts (run directly by Node) with the Node config.
    nodeTsConfig: {
      include: ['../scripts/**/*'],
    },
  },
})
