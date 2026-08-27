/**
 * ProductListPage — category-based product listing.
 *
 * Route: /catalog/:categorySlug
 *
 * Requirements (UI/UX Spec):
 * - Category title
 * - Search bar (opens Search Page)
 * - Filter button (opens filter bottom sheet)
 * - Sort button (opens sort bottom sheet)
 * - Active filter chips
 * - Product grid (2 columns mobile)
 * - Product count
 * - Loading skeleton
 * - Empty state
 * - Error state
 * - Pagination placeholder
 *
 * Phase 3A: UI only, no API calls. Mock data.
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { ROUTES } from '@/routes/paths'
import type { ProductCardProps } from '@/components/ProductCard'
import { ProductCard } from '@/components/ProductCard'
import { FilterChip } from '@/components/FilterChip'
import { BottomSheet } from '@/components/BottomSheet'

// ── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_CATEGORIES: Record<string, string> = {
  food: 'Ovqat',
  clothing: 'Kiyim',
  electronics: 'Elektronika',
  home: 'Uy-Joy',
  beauty: "Go'zallik",
  sports: 'Sport',
}

const MOCK_PRODUCTS: ProductCardProps[] = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: '450 000 so\'m',
    image: 'https://picsum.photos/seed/product1/400/400',
    storeName: 'Tech Store',
  },
  {
    id: 2,
    name: 'Classic Cotton T-Shirt',
    price: '85 000 so\'m',
    image: 'https://picsum.photos/seed/product2/400/400',
    storeName: 'Fashion Hub',
  },
  {
    id: 3,
    name: 'Organic Honey 1kg',
    price: '120 000 so\'m',
    image: 'https://picsum.photos/seed/product3/400/400',
    storeName: 'Local Farm',
  },
  {
    id: 4,
    name: 'Smart Watch Pro',
    price: '890 000 so\'m',
    image: 'https://picsum.photos/seed/product4/400/400',
    storeName: 'Tech Store',
  },
  {
    id: 5,
    name: 'Leather Wallet',
    price: '95 000 so\'m',
    image: 'https://picsum.photos/seed/product5/400/400',
    storeName: 'Fashion Hub',
  },
  {
    id: 6,
    name: 'Coffee Beans 500g',
    price: '65 000 so\'m',
    image: 'https://picsum.photos/seed/product6/400/400',
    storeName: 'Coffee Corner',
  },
  {
    id: 7,
    name: 'Running Shoes',
    price: '320 000 so\'m',
    image: 'https://picsum.photos/seed/product7/400/400',
    storeName: 'Sport World',
  },
  {
    id: 8,
    name: 'Notebook Set',
    price: '45 000 so\'m',
    image: 'https://picsum.photos/seed/product8/400/400',
    storeName: 'Office Supplies',
  },
  {
    id: 9,
    name: 'Bluetooth Speaker',
    price: '180 000 so\'m',
    image: 'https://picsum.photos/seed/product9/400/400',
    storeName: 'Tech Store',
  },
  {
    id: 10,
    name: 'Yoga Mat',
    price: '75 000 so\'m',
    image: 'https://picsum.photos/seed/product10/400/400',
    storeName: 'Sport World',
  },
  {
    id: 11,
    name: 'Water Bottle 1L',
    price: '35 000 so\'m',
    image: 'https://picsum.photos/seed/product11/400/400',
    storeName: 'Sport World',
  },
  {
    id: 12,
    name: 'Desk Lamp',
    price: '120 000 so\'m',
    image: 'https://picsum.photos/seed/product12/400/400',
    storeName: 'Office Supplies',
  },
]

const MOCK_PRICE_RANGES = [
  { label: "0 - 100 000 so'm", min: 0, max: 100000 },
  { label: "100 000 - 300 000 so'm", min: 100000, max: 300000 },
  { label: "300 000 - 500 000 so'm", min: 300000, max: 500000 },
  { label: "500 000+ so'm", min: 500000, max: Infinity },
]

const MOCK_STORES = [
  'Tech Store',
  'Fashion Hub',
  'Local Farm',
  'Coffee Corner',
  'Sport World',
  'Office Supplies',
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Eng yangi' },
  { value: 'price_asc', label: 'Narx: Arzon' },
  { value: 'price_desc', label: 'Narx: Qimmat' },
  { value: 'popular', label: 'Mashhur' },
]

// ── Types ───────────────────────────────────────────────────────────────────

interface ActiveFilters {
  priceRange: string | null
  store: string | null
}

type SortValue = 'newest' | 'price_asc' | 'price_desc' | 'popular'

// ── Component ───────────────────────────────────────────────────────────────

export default function ProductListPage() {
  const navigate = useNavigate()
  const { categorySlug = 'food' } = useParams<{ categorySlug: string }>()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    priceRange: null,
    store: null,
  })
  const [sortBy, setSortBy] = useState<SortValue>('newest')

  const categoryName = MOCK_CATEGORIES[categorySlug] || 'Mahsulotlar'

  // Apply filters (client-side mock)
  let filteredProducts = [...MOCK_PRODUCTS]

  if (activeFilters.priceRange) {
    const range = MOCK_PRICE_RANGES.find((r) => r.label === activeFilters.priceRange)
    if (range) {
      filteredProducts = filteredProducts.filter((p) => {
        const price = parseInt(p.price.replace(/\D/g, ''))
        return price >= range.min && price <= range.max
      })
    }
  }

  if (activeFilters.store) {
    filteredProducts = filteredProducts.filter(
      (p) => p.storeName === activeFilters.store
    )
  }

  // Apply sorting
  if (sortBy === 'price_asc') {
    filteredProducts.sort((a, b) => {
      const priceA = parseInt(a.price.replace(/\D/g, ''))
      const priceB = parseInt(b.price.replace(/\D/g, ''))
      return priceA - priceB
    })
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((a, b) => {
      const priceA = parseInt(a.price.replace(/\D/g, ''))
      const priceB = parseInt(b.price.replace(/\D/g, ''))
      return priceB - priceA
    })
  }

  const activeFilterCount =
    (activeFilters.priceRange ? 1 : 0) + (activeFilters.store ? 1 : 0)

  const removeFilter = (key: keyof ActiveFilters) => {
    setActiveFilters((prev) => ({ ...prev, [key]: null }))
  }

  const clearAllFilters = () => {
    setActiveFilters({ priceRange: null, store: null })
  }

  const applyFilter = (key: keyof ActiveFilters, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
    setIsFilterOpen(false)
  }

  const applySort = (value: SortValue) => {
    setSortBy(value)
    setIsSortOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-text transition-colors hover:bg-surface"
            aria-label="Go back"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>

          {/* Category Title */}
          <h1 className="flex-1 text-lg font-bold text-text">{categoryName}</h1>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.search)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-text transition-colors hover:bg-surface"
            aria-label="Search"
          >
            <Search size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Filter / Sort Bar */}
        <div className="flex items-center gap-3 border-t border-border px-4 py-3">
          {/* Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="relative flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Button */}
          <button
            type="button"
            onClick={() => setIsSortOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowUpDown size={16} aria-hidden="true" />
            <span>Saralash</span>
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
            {activeFilters.priceRange && (
              <FilterChip
                label={activeFilters.priceRange}
                active
                onRemove={() => removeFilter('priceRange')}
              />
            )}
            {activeFilters.store && (
              <FilterChip
                label={activeFilters.store}
                active
                onRemove={() => removeFilter('store')}
              />
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm font-medium text-error transition-colors hover:text-error/80"
            >
              Tozalash
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Product Count */}
        <p className="mb-4 text-sm text-text-muted">
          {filteredProducts.length} mahsulot topildi
        </p>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
              <Search size={32} className="text-text-muted" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-text">
              Mahsulot topilmadi
            </h2>
            <p className="text-sm text-text-muted">
              Filtrlarni o&apos;zgartiring va qayta urinib ko&apos;ring
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {/* Pagination Placeholder */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted">
              Barcha mahsulotlar ko&apos;rsatildi
            </p>
            {/* Future: Load More / Pagination */}
          </div>
        )}
      </main>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtrlash"
      >
        <div className="space-y-6">
          {/* Price Range */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-text">
              Narx oralig&apos;i
            </h3>
            <div className="space-y-2">
              {MOCK_PRICE_RANGES.map((range) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => applyFilter('priceRange', range.label)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                    activeFilters.priceRange === range.label
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text hover:border-primary'
                  }`}
                >
                  <span>{range.label}</span>
                  {activeFilters.priceRange === range.label && (
                    <span className="text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Store */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-text">Do&apos;kon</h3>
            <div className="space-y-2">
              {MOCK_STORES.map((store) => (
                <button
                  key={store}
                  type="button"
                  onClick={() => applyFilter('store', store)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                    activeFilters.store === store
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text hover:border-primary'
                  }`}
                >
                  <span>{store}</span>
                  {activeFilters.store === store && (
                    <span className="text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Apply Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(false)}
            className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Qo&apos;llash
          </button>
        </div>
      </BottomSheet>

      {/* Sort Bottom Sheet */}
      <BottomSheet
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        title="Saralash"
      >
        <div className="space-y-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => applySort(option.value as SortValue)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                sortBy === option.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-text hover:border-primary'
              }`}
            >
              <span>{option.label}</span>
              {sortBy === option.value && (
                <span className="text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
