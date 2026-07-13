/**
 * HomePage — primary discovery screen.
 *
 * Route: /
 *
 * Requirements (UI/UX Spec):
 * - Header: Logo, Current Location, Notification Button
 * - Search Bar (opens Search Page on click)
 * - Banner Carousel (promotions, seasonal offers, featured stores)
 * - Categories Section (grid)
 * - Popular Products (horizontal scroll)
 * - Nearby Stores (horizontal scroll)
 * - New Products (grid)
 *
 * Phase 3A: UI only, no API calls. Mock data.
 */
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Bell,
  MapPin,
  UtensilsCrossed,
  Shirt,
  Laptop,
  Home as HomeIcon,
  Sparkles,
  Dumbbell,
} from 'lucide-react'
import { ROUTES } from '@/routes/paths'
import type { Banner } from '@/components/BannerCarousel'
import { BannerCarousel } from '@/components/BannerCarousel'
import { CategoryCard } from '@/components/CategoryCard'
import type { ProductCardProps } from '@/components/ProductCard'
import { ProductCard } from '@/components/ProductCard'
import type { StoreCardProps } from '@/components/StoreCard'
import { StoreCard } from '@/components/StoreCard'

// ── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_BANNERS: Banner[] = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/banner1/800/450',
    title: 'Summer Sale - Up to 50% Off',
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/banner2/800/450',
    title: 'Free Delivery on Orders Over 100,000',
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/banner3/800/450',
    title: 'New Arrivals - Shop Now',
  },
]

const MOCK_CATEGORIES = [
  { name: 'Ovqat', icon: UtensilsCrossed, slug: 'food' },
  { name: 'Kiyim', icon: Shirt, slug: 'clothing' },
  { name: 'Elektronika', icon: Laptop, slug: 'electronics' },
  { name: 'Uy-Joy', icon: HomeIcon, slug: 'home' },
  { name: 'Go\'zallik', icon: Sparkles, slug: 'beauty' },
  { name: 'Sport', icon: Dumbbell, slug: 'sports' },
]

const MOCK_POPULAR_PRODUCTS: ProductCardProps[] = [
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
]

const MOCK_NEARBY_STORES: StoreCardProps[] = [
  {
    id: 1,
    name: 'Tech Store',
    logo: 'https://picsum.photos/seed/store1/200/200',
    rating: 4.8,
    productCount: 342,
    deliveryInfo: 'Yetkazib berish: 15 000 so\'m',
  },
  {
    id: 2,
    name: 'Fashion Hub',
    logo: 'https://picsum.photos/seed/store2/200/200',
    rating: 4.6,
    productCount: 156,
    deliveryInfo: 'Yetkazib berish: 12 000 so\'m',
  },
  {
    id: 3,
    name: 'Local Farm',
    logo: 'https://picsum.photos/seed/store3/200/200',
    rating: 4.9,
    productCount: 89,
    deliveryInfo: 'Yetkazib berish: bepul',
  },
]

const MOCK_NEW_PRODUCTS: ProductCardProps[] = [
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
]

// ── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate()

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
            <span className="font-medium">Toshkent</span>
          </button>

          {/* Notification */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text transition-colors hover:bg-surface"
            aria-label="Notifications"
          >
            <Bell size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.search)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left text-text-muted transition-colors hover:border-primary"
          >
            <Search size={20} aria-hidden="true" />
            <span className="text-sm">Nima qidiryapsiz?</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-6 p-4">
        {/* Banner Carousel */}
        <section aria-label="Promotions">
          <BannerCarousel banners={MOCK_BANNERS} />
        </section>

        {/* Categories */}
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="mb-4 text-lg font-bold text-text">
            Kategoriyalar
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {MOCK_CATEGORIES.map((category) => (
              <CategoryCard key={category.slug} {...category} />
            ))}
          </div>
        </section>

        {/* Popular Products */}
        <section aria-labelledby="popular-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="popular-heading" className="text-lg font-bold text-text">
              Mashhur mahsulotlar
            </h2>
            <Link
              to={ROUTES.home}
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Barchasini ko'rish
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {MOCK_POPULAR_PRODUCTS.map((product) => (
              <div key={product.id} className="w-[160px] flex-shrink-0">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </section>

        {/* Nearby Stores */}
        <section aria-labelledby="stores-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="stores-heading" className="text-lg font-bold text-text">
              Yaqin atrofdagi do'konlar
            </h2>
            <Link
              to={ROUTES.stores}
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Barchasini ko'rish
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {MOCK_NEARBY_STORES.map((store) => (
              <div key={store.id} className="w-[280px] flex-shrink-0">
                <StoreCard {...store} />
              </div>
            ))}
          </div>
        </section>

        {/* New Products */}
        <section aria-labelledby="new-heading">
          <h2 id="new-heading" className="mb-4 text-lg font-bold text-text">
            Yangi mahsulotlar
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {MOCK_NEW_PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
