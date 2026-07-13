/**
 * Smoke test — confirms the Vitest + Testing Library + fast-check harness
 * loads and the foundation modules (tokens, query keys, normalizeError,
 * sellerAccess) are importable and correct.
 */
import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { COLORS } from '@/constants/tokens'
import { queryKeys } from '@/constants/queryKeys'
import { normalizeError } from '@/utils/normalizeError'
import { canAccessSellerRoutes } from '@/utils/sellerAccess'

describe('test harness', () => {
  it('exposes design tokens and the query key factory', () => {
    expect(COLORS.primary).toBe('#22C55E')
    expect(queryKeys.cart()).toEqual(['cart'])
    expect(queryKeys.product(1)).toEqual(['product', 1])
  })

  it('normalizeError returns an AppError for an unknown throw', () => {
    const err = normalizeError(new Error('boom'))
    expect(typeof err.message).toBe('string')
    expect(err.message.length).toBeGreaterThan(0)
    expect(typeof err.status).toBe('number')
  })

  it('canAccessSellerRoutes returns REDIRECT_LOGIN for unauthenticated users', () => {
    expect(
      canAccessSellerRoutes({ isAuthenticated: false, hasActiveStore: false }),
    ).toBe('REDIRECT_LOGIN')
  })

  it('runs fast-check property tests (commutativity smoke)', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => a + b === b + a),
    )
  })
})
