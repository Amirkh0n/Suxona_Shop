/**
 * uiStore — global UI state.
 *
 * Owns: modal visibility, search panel, location selection, mobile menu.
 * Not persisted (UI state resets on page load).
 *
 * IMPORTANT: No server data lives here. selectedVillage is a UI choice that
 * filters the location selector — the Village list is fetched by TanStack
 * Query; only the selected item is stored here for filtering purposes.
 */
import { create } from 'zustand'
import type { Village } from '@/types'

interface UIState {
  // State
  isAuthModalOpen: boolean
  isSearchOpen: boolean
  selectedVillage: Village | null
  selectedLocation: string | null
  isMobileMenuOpen: boolean

  // Actions
  openAuthModal: () => void
  closeAuthModal: () => void
  toggleAuthModal: () => void
  openSearch: () => void
  closeSearch: () => void
  setVillage: (village: Village | null) => void
  setLocation: (location: string | null) => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  // Initial state
  isAuthModalOpen: false,
  isSearchOpen: false,
  selectedVillage: null,
  selectedLocation: null,
  isMobileMenuOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  toggleAuthModal: () =>
    set((s) => ({ isAuthModalOpen: !s.isAuthModalOpen })),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  setVillage: (village) => set({ selectedVillage: village }),
  setLocation: (location) => set({ selectedLocation: location }),

  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}))
