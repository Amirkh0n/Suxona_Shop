/**
 * CheckoutPage - Checkout page with real API integration
 *
 * Features:
 * - Real API integration for checkout
 * - Address selection
 * - Order summary
 * - Payment method selection
 * - Loading states
 * - Error handling
 * - Success state
 */

import { useState } from 'react'
import { ROUTES } from '@/routes/paths'
import { useCart } from '@/features/cart/useCart'
import { useAddresses } from '@/features/addresses/useAddresses'
import { useStores } from '@/features/stores/useStores'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/types'
import { useAppStore } from '@/stores/appStore'

export default function CheckoutPage() {
  const { showToast } = useAppStore()

  const { cart, isLoading, error } = useCart()
  const { addresses, isLoading: isLoadingAddresses } = useAddresses()
  const { stores, isLoading: isLoadingStores } = useStores()

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod')
  const [orderNote, setOrderNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  const cartItems = cart?.stores?.reduce((acc: any[], storeGroup: any) => {
    return acc.concat(storeGroup.items || [])
  }, []) || []
  const cartSubtotal = cart?.stores?.reduce((acc: number, storeGroup: any) => {
    return acc + (parseFloat(storeGroup.subtotal) || 0)
  }, 0) || 0
  const cartDeliveryPrice = cart?.stores?.reduce((acc: number, storeGroup: any) => {
    return acc + (parseFloat(storeGroup.delivery_price) || 0)
  }, 0) || 0
  const cartTotal = (cart?.stores?.reduce((acc: number, storeGroup: any) => {
    return acc + (parseFloat(storeGroup.total) || 0)
  }, 0) || 0)

  const isCartEmpty = cartItems.length === 0

  // Auto-select first address and store if available
  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId)
  }

  const handleStoreSelect = (storeId: number) => {
    setSelectedStoreId(storeId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isCartEmpty) {
      showToast('Savat bo\'sh', 'error')
      return
    }

    if (!selectedAddressId) {
      showToast('Iltimos, manzil tanlang', 'error')
      return
    }

    if (!selectedStoreId) {
      showToast('Iltimos, do\'kon tanlang', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          store_id: selectedStoreId,
          address_id: selectedAddressId,
          payment_method: paymentMethod,
          note: orderNote,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Buyurtmani yaratishda xatolik yuz berdi')
      }

      const newOrder = await response.json()
      setOrder(newOrder)
      showToast('Buyurtma muvaffaqiyatli yaratildi', 'success')

      setTimeout(() => {
        window.location.href = ROUTES.orders
      }, 1500)
    } catch (error: any) {
      console.error('Checkout failed:', error)
      showToast(error.message || 'Buyurtmani yaratishda xatolik yuz berdi', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueShopping = () => {
    window.location.href = '/products'
  }

  if (isLoading || isLoadingAddresses || isLoadingStores) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton width="150px" height="2rem" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <Skeleton width="100%" height="300px" />
            </div>
            <div>
              <Skeleton width="100%" height="400px" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Xatolik yuz berdi" description="Iltimos, keyinroq qayta urinib ko‘ring" />
  }

  if (isCartEmpty) {
    return <EmptyState title="Savat bo‘sh" description="Mahsulot qo‘shish uchun xaridni davom eting" action={{ label: 'Xaridni davom etish', onClick: () => window.location.href = ROUTES.home }} />
  }

  if (order) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-center flex-col py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-text mb-2">Buyurtmangiz muvaffaqiyatli yaratildi!</h2>
              <p className="text-text-muted mb-4">Buyurtma #{order.id} uchun tasdiqlash kutmoqda</p>
              <div className="bg-surface p-4 rounded-lg mb-6">
                <p className="text-sm text-text-muted">Buyurtma raqami</p>
                <p className="text-2xl font-bold text-primary">{order.id}</p>
              </div>
               <div className="flex gap-3">
                 <Button onClick={() => window.location.href = ROUTES.orders}>Buyurtmalarimni ko‘rish</Button>
                 <Button variant="outline" onClick={handleContinueShopping}>Xaridni davom etish</Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-text">Tekshirish va Buyurtma</h1>
          <p className="text-sm text-text-muted mt-1">Buyurtmani tasdiqlang va taminlang</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Selection */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Yetkazib berish manzili</h2>
                {addresses.length === 0 ? (
                  <div className="p-4 bg-surface rounded-lg">
                    <p className="text-sm text-text-muted">Manzillar mavjud emas</p>
                    <Button onClick={() => window.location.href = ROUTES.addresses} className="mt-3" size="sm">
                      Manzil qo‘shish
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => handleAddressSelect(address.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === address.id
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-border hover:border-border-hover'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                             <h3 className="text-sm font-medium text-text">
                               {address.village.name}, {address.street}
                             </h3>
                             <p className="text-sm text-text-muted mt-1">
                               {address.street}, {address.house}
                             </p>
                          </div>
                          {selectedAddressId === address.id && (
                            <div className="text-primary">✓</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Store Selection */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Do‘kon tanlang</h2>
                {stores.length === 0 ? (
                  <div className="p-4 bg-surface rounded-lg">
                    <p className="text-sm text-text-muted">Do‘konlar mavjud emas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stores.map((store) => (
                      <div
                        key={store.id}
                        onClick={() => handleStoreSelect(store.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedStoreId === store.id
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-border hover:border-border-hover'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                              <h3 className="text-sm font-medium text-text">{store.name}</h3>
                              <p className="text-sm text-text-muted mt-1">
                                {store.name}
                              </p>
                          </div>
                          {selectedStoreId === store.id && (
                            <div className="text-primary">✓</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-text mb-4">To‘lov usuli</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-border-hover">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'card')}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text">Naqd pul</p>
                      <p className="text-xs text-text-muted">Mijozga yetkazib berilganda to‘lanadi</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-border-hover">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'card')}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text">Karta orqali</p>
                      <p className="text-xs text-text-muted">Online to‘lov</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-border p-6 sticky top-20">
                <h2 className="text-lg font-semibold text-text mb-4">Buyurtma xulosa</h2>

                {/* Cart Items */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-text mb-3">Savat ({cartItems.length})</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-sm">
                          📦
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text truncate">{item.product.name}</p>
                          <p className="text-xs text-text-muted">{item.quantity} x {item.price}</p>
                        </div>
                        <p className="text-sm font-medium text-text">{item.subtotal}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Summa</span>
                    <span className="text-text">{cartSubtotal}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Yetkazib berish</span>
                    <span className="text-text">{cartDeliveryPrice}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                    <span className="text-text">Jami</span>
                    <span className="text-primary">{cartTotal}</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text mb-2">Izoh</label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Buyurtma haqida izoh qoldiring..."
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
