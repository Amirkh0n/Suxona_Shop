/**
 * CheckoutPage — Multi-step checkout flow for a single store
 *
 * Route: /checkout/:storeId
 *
 * Steps:
 * 1. Address Selection (delivery address + method)
 * 2. Contact Info (name, phone, comment)
 * 3. Review (summary + confirm order)
 *
 * Marketplace architecture:
 * - Each checkout belongs to ONE store
 * - Order is created for this specific store's items
 * - Other stores remain in cart
 *
 * Phase 3A: UI only, no API calls. Mock data.
 *
 * Future API integration points:
 * - GET /api/v1/cart (filter items by storeId)
 * - GET /api/v1/addresses (user addresses)
 * - GET /api/v1/villages (village list)
 * - GET /api/v1/stores/{store_id}/delivery-zones (delivery options)
 * - POST /api/v1/orders (create order)
 */
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { CheckoutSection } from '@/components/CheckoutSection'
import { AddressCard } from '@/components/AddressCard'
import { DeliveryMethodCard } from '@/components/DeliveryMethodCard'
import { OrderSummary } from '@/components/OrderSummary'
import { PriceSummary } from '@/components/PriceSummary'
import { buildPath, ROUTES } from '@/routes/paths'

// Mock data
const MOCK_STORE = {
  id: 1,
  name: 'Uzum Market',
  logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop',
}

const MOCK_CART_ITEMS = [
  {
    id: 1,
    productId: 101,
    name: 'Samsung Galaxy A54',
    price: '3200000',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    quantity: 1,
  },
  {
    id: 2,
    productId: 102,
    name: 'Беспроводные наушники AirPods',
    price: '890000',
    image:
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=200&fit=crop',
    quantity: 2,
  },
]

const MOCK_ADDRESSES = [
  {
    id: 1,
    fullName: 'Aziz Karimov',
    phone: '+998901234567',
    village: 'Tashkent, Chilonzor',
    street: 'Bunyodkor ko\'chasi',
    house: '12, кв. 45',
  },
  {
    id: 2,
    fullName: 'Aziz Karimov',
    phone: '+998901234567',
    village: 'Tashkent, Yunusabad',
    street: 'Amir Temur ko\'chasi',
    house: '88',
  },
]

const MOCK_DELIVERY_METHODS = [
  {
    id: 'delivery',
    name: 'Доставка курьером',
    description: 'Доставка по указанному адресу',
    cost: 0,
    icon: 'delivery' as const,
  },
  {
    id: 'pickup',
    name: 'Самовывоз',
    description: 'Забрать из магазина',
    cost: 0,
    icon: 'pickup' as const,
  },
]

type Step = 'address' | 'contact' | 'review'

export default function CheckoutPage() {
  const { storeId } = useParams<{ storeId: string }>()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState<Step>('address')
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(1)
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>('delivery')
  const [showAddAddressModal, setShowAddAddressModal] = useState(false)

  // Contact form state
  const [fullName, setFullName] = useState('Aziz Karimov')
  const [phone, setPhone] = useState('+998901234567')
  const [comment, setComment] = useState('')

  // Calculate totals
  const subtotal = MOCK_CART_ITEMS.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  )
  const deliveryCost =
    MOCK_DELIVERY_METHODS.find((m) => m.id === selectedDeliveryMethod)?.cost || 0
  const total = subtotal + deliveryCost

  const handleContinueFromAddress = () => {
    if (!selectedAddressId || !selectedDeliveryMethod) {
      alert('Пожалуйста, выберите адрес и способ доставки')
      return
    }
    setCurrentStep('contact')
  }

  const handleContinueFromContact = () => {
    if (!fullName.trim() || !phone.trim()) {
      alert('Пожалуйста, заполните обязательные поля')
      return
    }
    setCurrentStep('review')
  }

  const handleConfirmOrder = () => {
    console.log('Creating order:', {
      storeId,
      addressId: selectedAddressId,
      deliveryMethod: selectedDeliveryMethod,
      fullName,
      phone,
      comment,
      items: MOCK_CART_ITEMS,
      total,
    })
    // Mock order ID
    const mockOrderId = 12345
    navigate(buildPath.orderSuccess(mockOrderId))
  }

  const handleBack = () => {
    if (currentStep === 'contact') {
      setCurrentStep('address')
    } else if (currentStep === 'review') {
      setCurrentStep('contact')
    } else {
      navigate(ROUTES.cart)
    }
  }

  const STEP_CONFIG = {
    address: { title: 'Адрес доставки', icon: MapPin, step: 1 },
    contact: { title: 'Контактные данные', icon: User, step: 2 },
    review: { title: 'Подтверждение', icon: CheckCircle, step: 3 },
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-surface"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5 text-text" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-text">
              {STEP_CONFIG[currentStep].title}
            </h1>
            <p className="text-xs text-text-muted">
              Шаг {STEP_CONFIG[currentStep].step} из 3
            </p>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="sticky top-14 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex gap-2">
            {(['address', 'contact', 'review'] as Step[]).map((step, index) => {
              const config = STEP_CONFIG[step]
              const isActive = currentStep === step
              const isCompleted =
                config.step < STEP_CONFIG[currentStep].step
              const Icon = config.icon

              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-1 items-center gap-2">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : isActive
                            ? 'bg-primary/10 text-primary'
                            : 'bg-surface text-text-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`hidden text-sm font-medium sm:block ${
                        isActive ? 'text-text' : 'text-text-muted'
                      }`}
                    >
                      {config.title}
                    </span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`mx-2 h-0.5 w-8 flex-shrink-0 ${
                        isCompleted ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] p-4">
        {/* Step 1: Address Selection */}
        {currentStep === 'address' && (
          <div className="space-y-4">
            <CheckoutSection
              title="Адрес доставки"
              subtitle="Выберите адрес или добавьте новый"
            >
              <div className="space-y-3">
                {MOCK_ADDRESSES.map((address) => (
                  <AddressCard
                    key={address.id}
                    {...address}
                    isSelected={selectedAddressId === address.id}
                    onSelect={() => setSelectedAddressId(address.id)}
                  />
                ))}

                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-dashed border-border text-sm font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  + Добавить новый адрес
                </button>

                {showAddAddressModal && (
                  <div className="rounded-xl bg-warning/10 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-warning" />
                      <div>
                        <p className="font-medium text-text">
                          Добавление адреса
                        </p>
                        <p className="mt-1 text-sm text-text-muted">
                          Функция добавления нового адреса будет реализована в
                          Phase 3B
                        </p>
                        <button
                          onClick={() => setShowAddAddressModal(false)}
                          className="mt-3 text-sm font-medium text-primary hover:underline"
                        >
                          Понятно
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CheckoutSection>

            <CheckoutSection
              title="Способ доставки"
              subtitle="Выберите удобный способ получения"
            >
              <div className="space-y-3">
                {MOCK_DELIVERY_METHODS.map((method) => (
                  <DeliveryMethodCard
                    key={method.id}
                    {...method}
                    isSelected={selectedDeliveryMethod === method.id}
                    onSelect={() => setSelectedDeliveryMethod(method.id)}
                  />
                ))}
              </div>
            </CheckoutSection>

            <button
              onClick={handleContinueFromAddress}
              disabled={!selectedAddressId || !selectedDeliveryMethod}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Продолжить
            </button>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {currentStep === 'contact' && (
          <div className="space-y-4">
            <CheckoutSection
              title="Контактная информация"
              subtitle="Укажите данные для связи"
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Полное имя <span className="text-error">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Введите ваше имя"
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Номер телефона <span className="text-error">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 __ ___ __ __"
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Комментарий к заказу (необязательно)
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Например: позвонить за час до доставки"
                    rows={3}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </CheckoutSection>

            <button
              onClick={handleContinueFromContact}
              disabled={!fullName.trim() || !phone.trim()}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Продолжить
            </button>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {currentStep === 'review' && (
          <div className="space-y-4">
            <CheckoutSection title="Ваш заказ">
              <OrderSummary
                storeId={MOCK_STORE.id}
                storeName={MOCK_STORE.name}
                storeLogo={MOCK_STORE.logo}
                items={MOCK_CART_ITEMS}
              />
            </CheckoutSection>

            <CheckoutSection title="Адрес доставки">
              {selectedAddressId && (
                <AddressCard
                  {...MOCK_ADDRESSES.find((a) => a.id === selectedAddressId)!}
                  isSelected={true}
                />
              )}
            </CheckoutSection>

            <CheckoutSection title="Способ доставки">
              {selectedDeliveryMethod && (
                <DeliveryMethodCard
                  {...MOCK_DELIVERY_METHODS.find(
                    (m) => m.id === selectedDeliveryMethod
                  )!}
                  isSelected={true}
                />
              )}
            </CheckoutSection>

            <CheckoutSection title="Контактная информация">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Имя:</span>
                  <span className="font-medium text-text">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Телефон:</span>
                  <span className="font-medium text-text">{phone}</span>
                </div>
                {comment && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Комментарий:</span>
                    <span className="font-medium text-text">{comment}</span>
                  </div>
                )}
              </div>
            </CheckoutSection>

            <CheckoutSection title="Итого">
              <PriceSummary
                itemsCount={MOCK_CART_ITEMS.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}
                subtotal={subtotal}
                deliveryCost={deliveryCost}
                total={total}
              />
            </CheckoutSection>

            <button
              onClick={handleConfirmOrder}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <CheckCircle className="h-5 w-5" />
              Подтвердить заказ
            </button>

            <p className="text-center text-xs text-text-muted">
              Нажимая "Подтвердить заказ", вы соглашаетесь с{' '}
              <Link to="#" className="text-primary hover:underline">
                условиями использования
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
