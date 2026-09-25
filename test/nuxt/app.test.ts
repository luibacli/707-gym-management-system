import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import App from '~/app.vue'

describe('app shell', () => {
  it('renders the application title with PrimeVue available', async () => {
    const wrapper = await mountSuspended(App)
    expect(wrapper.text()).toContain('707 Gym Management System')
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
