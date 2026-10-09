/**
 * CategoryPage (Product List) — displays products filtered by category.
 *
 * Route: /category/:slug
 *
 * Requirements (UI/UX Spec):
 * - Search bar at top
 * - Filters (Category, Price Range, Store, Delivery Area)
 * - Sorting (Newest, Price Low to High, Price High to Low, Most Popular)
 * - Active filter chips
 * - Product count display
 * - Product Grid (2-column mobile, 3-column tablet, 4-column desktop)
 * - Loading skeleton, empty state, error state
 * - Mobile-first design
 *
 * Phase 3A: UI only, no API calls. Mock data and client-side filtering/sorting.
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import type { ProductCardProps } from '@/components/ProductCard'
import { ProductCard } from '@/components/ProductCard'
import { ProductGrid } from '@/components/ProductGrid'
import { FilterChip } from '@/components/FilterChip'
import { BottomSheet } from '@/components/BottomSheet'

// ── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: any[] = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: '450 000 so\'m',
    image: 'https://picsum.photos/seed/product1/400/400',
    storeName: 'Tech Store',
    description: 'Premium audio quality headphones',
    status: 'ACTIVE',
    store: { id: 1, name: 'Tech Store', logo: '', banner: '', status: 'ACTIVE' },
    category: { id: 1, name: 'Electronics' },
  },
  {
    id: 2,
    name: 'Classic Cotton T-Shirt',
    price: '85 000 so\'m',
    image: 'https://picsum.photos/seed/product2/400/400',
    storeName: 'Fashion Hub',
    description: 'Comfortable cotton t-shirt',
    status: 'ACTIVE',
    store: { id: 2, name: 'Fashion Hub', logo: '', banner: '', status: 'ACTIVE' },
    category: { id: 2, name: 'Clothing' },
  },
  {
    id: 3,
    name: 'Organic Honey 1kg',
    price: '120 000 so\'m',
    image: 'https://picsum.photos/seed/product3/400/400',
    storeName: 'Local Farm',
    description: 'Pure organic honey from local farms',
    status: 'ACTIVE',
    store: { id: 3, name: 'Local Farm', logo: '', banner: '', status: 'ACTIVE' },
    category: { id: 3, name: 'Food & Beverages' },
  },
  {
    id: 4,
    name: 'Smart Watch Pro',
    price: '890 000 so\'m',
    image: 'https://picsum.photos/seed/product4/400/400',
    storeName: 'Tech Store',
    description: 'Advanced smartwatch with health tracking',
    status: 'ACTIVE',
    store: { id: 1, name: 'Tech Store', logo: '', banner: '', status: 'ACTIVE' },
    category: { id: 1, name: 'Electronics' },
  },
  {
    id: 5,
    name: 'Leather Wallet',
    price: '95 000 so\'m',
    image: 'https://picsum.photos/seed/product5/400/400',
    storeName: 'Fashion Hub',
    description: 'Genuine leather wallet',
    status: 'ACTIVE',
    store: { id: 2, name: 'Fashion Hub', logo: '', banner: '', status: 'ACTIVE' },
    category: { id: 2, name: 'Accessories' },
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
    price: '280 000 so\'m',
    image: 'https://picsum.photos/seed/product9/400/400',
    storeName: 'Tech Store',
  },
  {
    id: 10,
    name: 'Yoga Mat',
    price: '150 000 so\'m',
    image: 'https://picsum.photos/seed/product10/400/400',
    storeName: 'Sport World',
  },
  {
    id: 11,
    name: 'Desk Lamp',
    price: '95 000 so\'m',
    image: 'https://picsum.photos/seed/product11/400/400',
    storeName: 'Office Supplies',
  },
  {
    id: 12,
    name: 'Winter Jacket',
    price: '550 000 so\'m',
    image: 'https://picsum.photos/seed/product12/400/400',
    storeName: 'Fashion Hub',
  },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Yangi mahsulotlar' },
  { value: 'price-asc', label: 'Narx: Arzondan qimmmatga' },
  { value: 'price-desc', label: 'Narx: Qimmatdan arzonga' },
  { value: 'popular', label: 'Mashhur' },
] as const

const PRICE_RANGES = [
  { value: 'all', label: 'Barchasi' },
  { value: '0-100000', label: '0 - 100 000 so\'m' },
  { value: '100000-300000', label: '100 000 - 300 000 so\'m' },
  { value: '300000-500000', label: '300 000 - 500 000 so\'m' },
  { value: '500000+', label: '500 000 so\'m va yuqori' },
] as const

const STORES = [
  'Barchasi',
  'Tech Store',
  'Fashion Hub',
  'Local Farm',
  'Coffee Corner',
  'Sport World',
  'Office Supplies',
]

const DELIVERY_AREAS = [
  'Barchasi',
  'Yunusobod',
  'Chilonzor',
  'Mirzo Ulug\'bek',
  'Yashnobod',
  'Sergeli',
]

// ── Types ───────────────────────────────────────────────────────────────────

type SortValue = typeof SORT_OPTIONS[number]['value']

interface Filters {
  priceRange: string
  store: string
  deliveryArea: string
}

// ── Helper Functions ────────────────────────────────────────────────────────

/** Parse price string to number for sorting/filtering */
function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/\D/g, ''), 10)
}

/** Apply filters to product list */
function applyFilters(products: ProductCardProps[], filters: Filters) {
  return products.filter((product) => {
    // Price range filter
    if (filters.priceRange !== 'all') {
      const price = parsePrice(product.price)
      if (filters.priceRange === '0-100000' && price > 100000) return false
      if (filters.priceRange === '100000-300000' && (price < 100000 || price > 300000))
        return false
      if (filters.priceRange === '300000-500000' && (price < 300000 || price > 500000))
        return false
      if (filters.priceRange === '500000+' && price < 500000) return false
    }

    // Store filter
    if (filters.store !== 'Barchasi' && product.storeName !== filters.store) {
      return false
    }

    // Delivery area filter (mock: all products available everywhere)
    // In real implementation, this would check product.deliveryAreas
    if (filters.deliveryArea !== 'Barchasi') {
      // Mock behavior: filter nothing for now
    }

    return true
  })
}

/** Apply sorting to product list */
function applySort(products: ProductCardProps[], sortBy: SortValue) {
  const sorted = [...products]

  switch (sortBy) {
    case 'newest':
      // Mock: keep original order (assume it's newest first)
      break
    case 'price-asc':
      sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
      break
    case 'price-desc':
      sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
      break
    case 'popular':
      // Mock: reverse order as "popular"
      sorted.reverse()
      break
  }

  return sorted
}

// ── Component ───────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortValue>('newest')
  const [filters, setFilters] = useState<Filters>({
    priceRange: 'all',
    store: 'Barchasi',
    deliveryArea: 'Barchasi',
  })
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [showSortSheet, setShowSortSheet] = useState(false)
  const [isLoading] = useState(false)
  const [hasError] = useState(false)

  // Derived state
  const categoryName = slug
    ? slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Kategoriya'

  // Apply search, filters, and sorting
  let displayedProducts = MOCK_PRODUCTS
  if (searchQuery.trim()) {
    displayedProducts = displayedProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  displayedProducts = applyFilters(displayedProducts, filters)
  displayedProducts = applySort(displayedProducts, sortBy)

  // Active filters count
  const activeFilterCount = [
    filters.priceRange !== 'all',
    filters.store !== 'Barchasi',
    filters.deliveryArea !== 'Barchasi',
  ].filter(Boolean).length

  // Active filters for chips
  const activeFilters: Array<{ key: keyof Filters; label: string }> = []
  if (filters.priceRange !== 'all') {
    const range = PRICE_RANGES.find((r) => r.value === filters.priceRange)
    if (range) activeFilters.push({ key: 'priceRange', label: `Narx: ${range.label}` })
  }
  if (filters.store !== 'Barchasi') {
    activeFilters.push({ key: 'store', label: `Do'kon: ${filters.store}` })
  }
  if (filters.deliveryArea !== 'Barchasi') {
    activeFilters.push({ key: 'deliveryArea', label: `Hudud: ${filters.deliveryArea}` })
  }

  // Handlers
  const handleRemoveFilter = (key: keyof Filters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'priceRange' ? 'all' : 'Barchasi',
    }))
  }

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters)
    setShowFilterSheet(false)
  }

  const handleApplySort = (newSort: SortValue) => {
    setSortBy(newSort)
    setShowSortSheet(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
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

          {/* Category Name */}
          <h1 className="flex-1 text-lg font-bold text-text">{categoryName}</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="h-12 w-full rounded-xl border border-border bg-surface pl-12 pr-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Filter and Sort Buttons */}
        <div className="flex gap-3 px-4 pb-3">
          <button
            type="button"
            onClick={() => setShowFilterSheet(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary"
          >
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span>Filtr</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowSortSheet(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowUpDown size={18} aria-hidden="true" />
            <span>Tartiblash</span>
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                onRemove={() => handleRemoveFilter(filter.key)}
              />
            ))}
          </div>
        )}

        {/* Product Count */}
        <div className="border-t border-border px-4 py-2">
          <p className="text-sm text-text-muted">
            {displayedProducts.length} ta mahsulot topildi
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Loading State */}
        {isLoading && (
          <ProductGrid>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[280px] animate-pulse rounded-2xl bg-white"
                aria-hidden="true"
              />
            ))}
          </ProductGrid>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
              <span className="text-3xl text-error" aria-hidden="true">
                ⚠
              </span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text">Xatolik yuz berdi</h3>
            <p className="mb-4 text-sm text-text-muted">
              Mahsulotlarni yuklab bo&apos;lmadi
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Qayta urinish
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasError && displayedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
              <Search size={32} className="text-text-muted" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text">Mahsulot topilmadi</h3>
            <p className="text-sm text-text-muted">
              Filtrlarni o&apos;zgartiring yoki boshqa kategoriyani tanlang
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !hasError && displayedProducts.length > 0 && (
          <ProductGrid>
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </ProductGrid>
        )}
      </main>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        title="Filtrlar"
      >
        <FilterSheet
          filters={filters}
          onApply={handleApplyFilters}
          onClose={() => setShowFilterSheet(false)}
        />
      </BottomSheet>

      {/* Sort Bottom Sheet */}
      <BottomSheet
        isOpen={showSortSheet}
        onClose={() => setShowSortSheet(false)}
        title="Tartiblash"
      >
        <SortSheet
          currentSort={sortBy}
          onApply={handleApplySort}
          onClose={() => setShowSortSheet(false)}
        />
      </BottomSheet>
    </div>
  )
}

// ── Filter Sheet ────────────────────────────────────────────────────────────

interface FilterSheetProps {
  filters: Filters
  onApply: (filters: Filters) => void
  onClose: () => void
}

function FilterSheet({ filters, onApply }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters)

  const handleApply = () => {
    onApply(localFilters)
  }

  const handleReset = () => {
    setLocalFilters({
      priceRange: 'all',
      store: 'Barchasi',
      deliveryArea: 'Barchasi',
    })
  }

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-text">Narx oralig&apos;i</h3>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() =>
                setLocalFilters((prev) => ({ ...prev, priceRange: range.value }))
              }
              className={`flex h-12 w-full items-center rounded-xl border px-4 text-left text-sm transition-colors ${
                localFilters.priceRange === range.value
                  ? 'border-primary bg-primary/5 font-medium text-primary'
                  : 'border-border bg-white text-text hover:border-primary'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </section>

      {/* Store */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-text">Do&apos;kon</h3>
        <div className="space-y-2">
          {STORES.map((store) => (
            <button
              key={store}
              type="button"
              onClick={() => setLocalFilters((prev) => ({ ...prev, store }))}
              className={`flex h-12 w-full items-center rounded-xl border px-4 text-left text-sm transition-colors ${
                localFilters.store === store
                  ? 'border-primary bg-primary/5 font-medium text-primary'
                  : 'border-border bg-white text-text hover:border-primary'
              }`}
            >
              {store}
            </button>
          ))}
        </div>
      </section>

      {/* Delivery Area */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-text">Yetkazib berish hududi</h3>
        <div className="space-y-2">
          {DELIVERY_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => setLocalFilters((prev) => ({ ...prev, deliveryArea: area }))}
              className={`flex h-12 w-full items-center rounded-xl border px-4 text-left text-sm transition-colors ${
                localFilters.deliveryArea === area
                  ? 'border-primary bg-primary/5 font-medium text-primary'
                  : 'border-border bg-white text-text hover:border-primary'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={handleReset}
          className="flex h-12 flex-1 items-center justify-center rounded-xl border border-border bg-white text-sm font-medium text-text transition-colors hover:bg-surface"
        >
          Tozalash
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Qo&apos;llash
        </button>
      </div>
    </div>
  )
}

// ── Sort Sheet ──────────────────────────────────────────────────────────────

interface SortSheetProps {
  currentSort: SortValue
  onApply: (sort: SortValue) => void
  onClose: () => void
}

function SortSheet({ currentSort, onApply }: SortSheetProps) {
  return (
    <div className="space-y-2">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onApply(option.value)}
          className={`flex h-12 w-full items-center rounded-xl border px-4 text-left text-sm transition-colors ${
            currentSort === option.value
              ? 'border-primary bg-primary/5 font-medium text-primary'
              : 'border-border bg-white text-text hover:border-primary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
