/**
 * canAccessSellerRoutes — pure decision function for seller route access.
 *
 * This is a side-effect-free function so it can be property-tested (Property 5)
 * and reused by both the SellerRoute guard and the Profile page entry point.
 *
 * Decision rules (from the spec):
 *   - Access is granted iff the user is authenticated AND has an active store.
 *   - An authenticated user without an active store is sent to onboarding,
 *     regardless of any pending or approved application.
 *   - Active store ownership takes precedence over a separate pending application.
 *   - An approved application without an active store does NOT grant access.
 */

/** Context passed to the decision function. */
export interface SellerAccessContext {
  isAuthenticated: boolean
  /** True when GET /api/v1/stores/my returned a store successfully. */
  hasActiveStore: boolean
}

export type SellerAccessDecision =
  | 'GRANT'        // Render the seller route.
  | 'REDIRECT_LOGIN'   // Send to /login.
  | 'REDIRECT_ONBOARDING' // Send to seller onboarding.

/**
 * Returns the access decision for the given context.
 *
 * Note: the caller is responsible for handling the loading state while
 * `hasActiveStore` is being resolved (the SellerRoute guard shows a skeleton
 * during that window).
 */
export function canAccessSellerRoutes(
  ctx: SellerAccessContext,
): SellerAccessDecision {
  if (!ctx.isAuthenticated) return 'REDIRECT_LOGIN'
  if (!ctx.hasActiveStore) return 'REDIRECT_ONBOARDING'
  return 'GRANT'
}
