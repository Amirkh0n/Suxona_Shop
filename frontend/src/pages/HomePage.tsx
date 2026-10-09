import { Link } from 'react-router-dom'
import { Search, Bell, MapPin } from 'lucide-react'
import { useProducts } from '@/features'
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { ProductCard } from '@/components/ProductCard'

export default function HomePage() {
  const products = useProducts({ page: 1, category: undefined, store: undefined, search: undefined, ordering: undefined })

  if (products.error) {
    return <EmptyState title="Ma'lumotlar yuklanmadi" description="Iltimos, keyinroq qayta urinib ko'ring" />
  }

  if (products.isLoading) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton width="200px" height="2rem" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} width="100%" height="120px" className="rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <h1 className="text-xl font-bold text-primary">SuxonaShop</h1>

          {/* Location */}
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-text transition-colors hover:bg-surface"
            aria-label="Change location"
          >
            <MapPin size={16} className="text-primary" aria-hidden="true" />
            <span>Toshkent</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button type="button" className="p-2 rounded-lg hover:bg-surface" aria-label="Search">
              <Search size={20} className="text-text" aria-hidden="true" />
            </button>

            <button type="button" className="p-2 rounded-lg hover:bg-surface" aria-label="Notifications">
              <Bell size={20} className="text-text" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Popular Products */}
        {products.products?.slice(0, 4).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text">Tez-tez so‘ralgan mahsulotlar</h2>
              <Link
                to="/products"
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                Barchasini ko‘rish →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {products.products?.slice(0, 4).map((product: any) => (
                <div key={product.id} className="w-[160px] flex-shrink-0">
                  <ProductCard id={product.id} {...product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {products.products?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Barcha mahsulotlar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.products.map((product: any) => (
                <div key={product.id} className="w-full">
                  <ProductCard id={product.id} {...product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
