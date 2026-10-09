/**
 * ProductListPage - Product listing page with real API integration
 *
 * Features:
 * - Real API integration for product listing
 * - Filtering by category
 * - Searching by name/description
 * - Sorting options
 * - Pagination
 * - Loading states with skeleton
 * - Error handling
 * - "Add to cart" functionality
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/features/products/useProducts'
import { useCategories } from '@/hooks'
import { ProductCard } from '@/components/ProductCard'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { FilterChip } from '@/components/FilterChip'

const ITEMS_PER_PAGE = 12

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  const categoryQuery = useCategories()
  const productsQuery = useProducts({
    page: page,
    category: categoryFilter || undefined,
    search: searchQuery || undefined,
    ordering: 'created_at',
  })

  const categories = categoryQuery.categories
  const isLoading = categoryQuery.isLoading || productsQuery.isLoading

  useEffect(() => {
    const params: Record<string, string> = { page: String(page) }
    if (categoryFilter) params.category = String(categoryFilter)
    if (searchQuery) params.search = searchQuery
    setSearchParams(params)
  }, [page, categoryFilter, searchQuery, setSearchParams])

  const handleCategoryFilter = (categoryId: number) => {
    if (categoryFilter === categoryId) {
      setCategoryFilter(null)
    } else {
      setCategoryFilter(categoryId)
    }
    setPage(1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(productsQuery.count / ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Skeleton width="200px" height="2rem" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (productsQuery.error) {
    return <EmptyState title="Mahsulotlar yuklanmadi" description="Iltimos, keyinroq qayta urinib ko‘ring" />
  }

  if (productsQuery.products.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            title="Mahsulotlar topilmadi"
            description={`"${searchQuery || categoryFilter ? 'So‘ralgan filter yoki qidiruv natijalari' : 'Mavjud mahsulotlar yo‘q'}`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-text mb-4">Barcha mahsulotlar</h1>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Mahsulot qidirish..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

            {/* Categories Filter */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
               <FilterChip
                  label="Barchasi"
                  active={!categoryFilter}
                  onCategoryChange={handleCategoryFilter}
                />
                 {categories.map((category: any) => (
                 <FilterChip
                    key={category.id}
                    label={category.name}
                    active={categoryFilter === category.id}
                    onCategoryChange={handleCategoryFilter}
                  />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {productsQuery.products.map((product: any) => (
            <div key={product.id}>
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-border bg-white text-text hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Oldingi
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = page - 2 + i
              if (pageNum <= 0) return null
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg border ${
                    page === pageNum
                      ? 'bg-primary text-white border-primary'
                      : 'border-border bg-white text-text hover:bg-surface'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-border bg-white text-text hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keyingi →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

