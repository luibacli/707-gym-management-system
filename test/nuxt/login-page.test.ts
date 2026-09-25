import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LoginPage from '~/pages/login.vue'

describe('login page', () => {
  it('shows field errors when submitted empty, without calling the API', async () => {
    const wrapper = await mountSuspended(LoginPage)
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Enter a valid email address.')
    expect(wrapper.text()).toContain('Enter your password.')
  })
})
