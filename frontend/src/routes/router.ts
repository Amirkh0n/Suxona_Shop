/**
 * Browser router instance.
 *
 * This is a plain TypeScript file (no JSX) that creates and exports the
 * browser router from the route configuration array.
 *
 * Dependency chain (no cycles):
 *   router.ts  →  routeConfig.tsx  →  routes.tsx  (components)
 *                                  →  layouts, guards, paths
 */
import { createBrowserRouter } from 'react-router-dom'
import { routeConfig } from './routeConfig'

export const router = createBrowserRouter(routeConfig)
