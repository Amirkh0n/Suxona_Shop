/**
 * ProductDetailPage - Product detail page with real API integration
 *
 * Features:
 * - Real API integration for product details
 * - Image carousel
 * - Add to cart functionality
 * - Loading states
 * - Error handling
 * - Related products
 */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { useProductDetail } from '@/features/products/useProducts'
import { useCart } from '@/features/cart/useCart'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import type { ProductImage } from '@/types'

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const { addItem } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [mainImageIndex, setMainImageIndex] = useState(0)

  const {
    product,
    isLoading,
    error,
    refetch,
  } = useProductDetail(Number(productId))

  useEffect(() => {
    refetch()
  }, [productId, refetch])

  // Load related products from same category (simplified for now)
  // State is managed by the caller when needed
  const handleImageClick = (index: number) => {
    setMainImageIndex(index)
  }

  const handleAddToCart = async () => {
    try {
      await addItem.mutateAsync({ productId: Number(productId), quantity })
      window.location.href = ROUTES.cart
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    const newQty = Math.max(1, Math.min(newQuantity, product?.stock || 99))
    setQuantity(newQty)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <SkeletonCard />
            </div>
            <div>
              <Skeleton width="100%" height="2rem" className="mb-4" />
              <Skeleton width="70%" height="2rem" className="mb-2" />
              <Skeleton width="60%" height="1rem" className="mb-4" />
              <Skeleton width="100%" height="3rem" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Mahsulot topilmadi" description="Iltimos, keyinroq qayta urinib ko‘ring" />
  }

  if (!product) {
    return <EmptyState title="Mahsulot topilmadi" description="Iltimos, keyinroq qayta urinib ko‘ring" />
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-text-muted">
            <Link to={ROUTES.home} className="hover:text-primary">Bosh sahifa</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-primary">Mahsulotlar</Link>
            <span className="mx-2">/</span>
            <span className="text-text">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-surface rounded-lg overflow-hidden shadow-sm">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[mainImageIndex]?.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image: ProductImage, index: number) => (
                  <button
                    key={image.id}
                    onClick={() => handleImageClick(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      mainImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img src={image.image} alt={`${product.name} - Image ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span>Do‘kon: {product.store?.name || 'Noma’lum'}</span>
                {product.stock && (
                  <span>•</span>
                )}
                {product.stock !== null && product.stock !== undefined && (
                  <span>Do‘qilib boradi: {product.stock} ta</span>
                )}
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">Narxi</p>
                  <p className="text-4xl font-bold text-primary">{product.price}</p>
                </div>
                {product.stock !== null && product.stock !== undefined && (
                  <div className="text-right">
                    <p className="text-sm text-text-muted mb-1">Mavjud</p>
                    <p className="text-lg font-semibold text-text">{product.stock} ta</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-2">Tavsif</h3>
              <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{product.description || 'Mahsulot haqida ma’lumot kiritilmagan.'}</p>
            </div>

            {product.category && (
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Kategoriya</h3>
                <Link to={ROUTES.catalog.replace(':categorySlug', product.category.name.toLowerCase())} className="text-primary hover:text-primary-hover">
                  {product.category.name}
                </Link>
              </div>
            )}

            {/* Add to Cart */}
            <div className="bg-white border border-border p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="rounded-r-none"
                  >
                    −
                  </Button>
                  <span className="w-16 text-center font-medium text-text">{quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={product.stock !== null && quantity >= product.stock}
                    className="rounded-l-none"
                  >
                    +
                  </Button>
                </div>

                <Button onClick={handleAddToCart} className="flex-1" disabled={product.stock === 0}>
                  {addItem.isPending ? 'Savatga qo‘shish...' : 'Savatga qo‘shish'}
                </Button>
              </div>

              {product.stock !== null && product.stock !== undefined && product.stock === 0 && (
                <p className="text-sm text-danger">Mavjud bo‘lmagan!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
