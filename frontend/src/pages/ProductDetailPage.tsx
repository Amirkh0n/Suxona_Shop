/**
 * ProductDetailPage — Product Detail Page (Phase 3A: UI only, mock data).
 *
 * Route: /product/:productId
 *
 * Requirements (UI/UX Spec):
 * - Product gallery with swipeable images
 * - Product information (name, price, store, ratings)
 * - Delivery information
 * - Variants (optional: color, size, weight)
 * - Description
 * - Sticky Add To Cart button (always visible)
 *
 * Reuses:
 * - Design System spacing, colors, typography
 * - Existing reusable components where applicable
 *
 * Phase 3A: Mock data only. No API integration.
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  Truck,
  ShoppingCart,
} from 'lucide-react'
import { buildPath, ROUTES } from '@/routes/paths'

// Mock product data
const MOCK_PRODUCT = {
  id: 1,
  name: 'Samsung Galaxy S23 Ultra 256GB',
  price: '12 500 000 so\'m',
  images: [
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800',
  ],
  store: {
    id: 1,
    name: 'TechnoStore',
    rating: 4.8,
    reviewCount: 245,
  },
  rating: 4.7,
  reviewCount: 128,
  description:
    'Samsung Galaxy S23 Ultra — bu kuchli kamera, uzoq quvvatli batareya va tez ishlash tezligiga ega eng yangi flagman smartfon. 256GB ichki xotira va 12GB operativ xotira bilan barcha vazifalarni oson bajaradi.',
  delivery: {
    area: 'Toshkent shahri',
    cost: '25 000 so\'m',
    minOrder: '50 000 so\'m',
  },
  variants: [
    {
      type: 'color',
      label: 'Rang',
      options: [
        { value: 'black', label: 'Qora', available: true },
        { value: 'white', label: 'Oq', available: true },
        { value: 'green', label: 'Yashil', available: false },
      ],
    },
    {
      type: 'storage',
      label: 'Xotira',
      options: [
        { value: '128gb', label: '128GB', available: false },
        { value: '256gb', label: '256GB', available: true },
        { value: '512gb', label: '512GB', available: true },
      ],
    },
  ],
  specifications: [
    { label: 'Ekran', value: '6.8" Dynamic AMOLED 2X' },
    { label: 'Protsessor', value: 'Snapdragon 8 Gen 2' },
    { label: 'RAM', value: '12GB' },
    { label: 'Kamera', value: '200MP + 12MP + 10MP + 10MP' },
    { label: 'Batareya', value: '5000 mAh' },
  ],
}

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({
    color: 'black',
    storage: '256gb',
  })
  const [isFavorite, setIsFavorite] = useState(false)

  // Mock: In Phase 3B, fetch product by ID from API
  const product = MOCK_PRODUCT

  const handleVariantChange = (type: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [type]: value }))
  }

  const handleAddToCart = () => {
    // Phase 3A: Mock interaction only
    console.log('Add to cart:', { productId, variants: selectedVariants })
    alert('Mahsulot savatga qo\'shildi!')
  }

  const handleShare = () => {
    // Phase 3A: Mock interaction
    console.log('Share product:', productId)
    alert('Ulashish funksiyasi tez orada qo\'shiladi')
  }

  return (
    <div className="relative min-h-screen bg-surface pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <Link
          to={ROUTES.home}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-text transition-colors hover:bg-surface"
          aria-label="Orqaga"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
              isFavorite
                ? 'bg-error/10 text-error'
                : 'text-text-muted hover:bg-surface'
            }`}
            aria-label={isFavorite ? 'Sevimlidan o\'chirish' : 'Sevimliga qo\'shish'}
          >
            <Heart
              size={22}
              fill={isFavorite ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface"
            aria-label="Ulashish"
          >
            <Share2 size={22} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Product Gallery */}
      <section className="relative bg-white">
        <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
          <img
            src={product.images[activeImageIndex]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="flex justify-center gap-2 py-3">
            {product.images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeImageIndex
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-border'
                }`}
                aria-label={`Rasm ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Information */}
      <section className="bg-white px-4 py-4">
        <h1 className="text-xl font-bold text-text">{product.name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-text-muted">
            <Star size={16} fill="#F59E0B" stroke="#F59E0B" aria-hidden="true" />
            <span className="font-medium text-text">{product.rating}</span>
            <span>({product.reviewCount})</span>
          </div>
        </div>
        <p className="mt-4 text-2xl font-bold text-primary">{product.price}</p>
      </section>

      {/* Store Information */}
      <section className="mt-2 bg-white px-4 py-4">
        <Link
          to={buildPath.storeDetail(product.store.id)}
          className="flex items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-surface"
        >
          <div>
            <h3 className="font-semibold text-text">{product.store.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-sm text-text-muted">
              <Star
                size={14}
                fill="#F59E0B"
                stroke="#F59E0B"
                aria-hidden="true"
              />
              <span className="font-medium text-text">
                {product.store.rating}
              </span>
              <span>({product.store.reviewCount} baho)</span>
            </div>
          </div>
          <ChevronLeft
            size={20}
            className="rotate-180 text-text-muted"
            aria-hidden="true"
          />
        </Link>
      </section>

      {/* Delivery Information */}
      <section className="mt-2 bg-white px-4 py-4">
        <h2 className="text-base font-semibold text-text">Yetkazib berish</h2>
        <div className="mt-3 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-text-muted" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-text">Hudud</p>
              <p className="text-sm text-text-muted">{product.delivery.area}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck size={20} className="text-text-muted" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-text">Yetkazish narxi</p>
              <p className="text-sm text-text-muted">
                {product.delivery.cost} (minimal buyurtma:{' '}
                {product.delivery.minOrder})
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Variants */}
      {product.variants.map((variant) => (
        <section key={variant.type} className="mt-2 bg-white px-4 py-4">
          <h2 className="text-base font-semibold text-text">{variant.label}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isSelected = selectedVariants[variant.type] === option.value
              const isAvailable = option.available
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    isAvailable && handleVariantChange(variant.type, option.value)
                  }
                  disabled={!isAvailable}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : isAvailable
                        ? 'border-border text-text hover:border-primary hover:bg-surface'
                        : 'cursor-not-allowed border-border bg-surface/50 text-text-muted line-through'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {/* Description */}
      <section className="mt-2 bg-white px-4 py-4">
        <h2 className="text-base font-semibold text-text">Mahsulot haqida</h2>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          {product.description}
        </p>
      </section>

      {/* Specifications */}
      <section className="mt-2 bg-white px-4 py-4">
        <h2 className="text-base font-semibold text-text">Xususiyatlar</h2>
        <div className="mt-3 space-y-2">
          {product.specifications.map((spec, index) => (
            <div
              key={index}
              className="flex justify-between border-b border-border py-2 last:border-0"
            >
              <span className="text-sm text-text-muted">{spec.label}</span>
              <span className="text-sm font-medium text-text">{spec.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Add To Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <ShoppingCart size={20} aria-hidden="true" />
          <span>Savatga qo'shish</span>
        </button>
      </div>
    </div>
  )
}

export default ProductDetailPage
