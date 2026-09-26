import { describe, expect, it } from 'vitest'
import { describeExpiry } from '../../app/utils/format'

describe('describeExpiry', () => {
  it.each([
    [0, 'Expires today'],
    [1, 'Expires tomorrow'],
    [5, 'Expires in 5 days'],
    [-1, 'Expired yesterday'],
    [-12, 'Expired 12 days ago'],
  ])('%i → %s', (days, text) => {
    expect(describeExpiry(days)).toBe(text)
  })
})
