/**
 * SearchPage — global search interface.
 *
 * Route: /search
 *
 * Requirements (UI/UX Spec):
 * - Search Input (sticky at top, autofocus)
 * - Recent Searches (before user starts typing)
 * - Popular Searches (before user starts typing)
 * - Search Results Tabs (Products / Stores)
 * - Product Results (grid, uses ProductCard)
 * - Store Results (vertical list, uses StoreCard)
 * - Empty States (no input, no results)
 *
 * Phase 3A: UI only, no API calls. Mock data and client-side filtering.
 */
import { useState, useRef, useEffect } from 'react'
import { Search, X, Clock, TrendingUp, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ProductCard } from '@/components/ProductCard'
import { StoreCard } from '@/components/StoreCard'

// ── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_RECENT_SEARCHES = [
  'Wireless Headphones',
  'Cotton T-Shirt',
  'Organic Honey',
]

const MOCK_POPULAR_SEARCHES = [
  'Smartphone',
  'Laptop',
  'Sneakers',
  'Watch',
  'Backpack',
  'Coffee',
]

const MOCK_ALL_PRODUCTS = [] as any[]

const MOCK_ALL_STORES = [] as any[]

// ── Types ───────────────────────────────────────────────────────────────────

type SearchTab = 'products' | 'stores'

// ── Component ───────────────────────────────────────────────────────────────

export default function SearchPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<SearchTab>('products')

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Client-side filtering (mock API behavior)
  const filteredProducts = query.trim()
    ? MOCK_ALL_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const filteredStores = query.trim()
    ? MOCK_ALL_STORES.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const hasQuery = query.trim().length > 0
  const hasResults =
    activeTab === 'products'
      ? filteredProducts.length > 0
      : filteredStores.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Search Header (sticky) */}
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

          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nima qidiryapsiz?"
              className="h-12 w-full rounded-xl border border-border bg-surface pl-12 pr-12 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
                aria-label="Clear search"
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs (only when user has typed something) */}
        {hasQuery && (
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'products'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Mahsulotlar ({filteredProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stores')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'stores'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Do&apos;konlar ({filteredStores.length})
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Before Search: Recent + Popular */}
        {!hasQuery && (
          <div className="space-y-6">
            {/* Recent Searches */}
            <section aria-labelledby="recent-heading">
              <h2
                id="recent-heading"
                className="mb-3 flex items-center gap-2 text-sm font-semibold text-text"
              >
                <Clock size={16} className="text-text-muted" aria-hidden="true" />
                Oxirgi qidiruvlar
              </h2>
              <ul className="space-y-2">
                {MOCK_RECENT_SEARCHES.map((term, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => setQuery(term)}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-text transition-colors hover:bg-white"
                    >
                      <Clock size={16} className="text-text-muted" aria-hidden="true" />
                      <span>{term}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Popular Searches */}
            <section aria-labelledby="popular-heading">
              <h2
                id="popular-heading"
                className="mb-3 flex items-center gap-2 text-sm font-semibold text-text"
              >
                <TrendingUp size={16} className="text-text-muted" aria-hidden="true" />
                Mashhur qidiruvlar
              </h2>
              <div className="flex flex-wrap gap-2">
                {MOCK_POPULAR_SEARCHES.map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm text-text transition-colors hover:border-primary hover:text-primary"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* After Search: Results */}
        {hasQuery && (
          <>
            {/* No Results State */}
            {!hasResults && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
                  <Search size={32} className="text-text-muted" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text">
                  Hech narsa topilmadi
                </h3>
                <p className="text-sm text-text-muted">
                  &quot;{query}&quot; uchun natija yo&apos;q
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Boshqa so&apos;z bilan qidiring
                </p>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}

            {/* Stores Tab */}
            {activeTab === 'stores' && filteredStores.length > 0 && (
              <div className="space-y-3">
                {filteredStores.map((store) => (
                  <StoreCard key={store.id} {...store} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
