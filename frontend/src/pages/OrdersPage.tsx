/**
 * OrdersPage - Orders list page with real API integration
 *
 * Features:
 * - Real API integration for order listing
 * - Status filtering
 * - Order detail navigation
 * - Loading states
 * - Error handling
 * - Empty state
 */

import { useEffect, useState } from 'react'
import { useOrders } from '@/features/orders/useOrders'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { OrderCard } from '@/components/OrderCard'

const ITEMS_PER_PAGE = 10

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { orders, count, next, previous, isLoading, error, refetch } = useOrders({
    page,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  useEffect(() => {
    refetch()
  }, [page, statusFilter, refetch])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStatusFilter = (filter: string) => {
    setStatusFilter(filter)
    setPage(1)
  }

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton width="150px" height="2rem" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width="100%" height="80px" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Xatolik yuz berdi" description="Iltimos, keyinroq qayta urinib ko‘ring" />
  }

  if (orders.length === 0 && !isLoading) {
    return <EmptyState title="Buyurtmalar topilmadi" description="Hozircha buyurtmalar mavjud emas" action={{ label: 'Xarid qilish', onClick: () => window.location.href = '/products' }} />
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-text mb-4">Buyurtmalar</h1>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border bg-surface text-text hover:bg-surface-hover'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => handleStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === 'pending'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border bg-surface text-text hover:bg-surface-hover'
              }`}
            >
              Kutilmoqda
            </button>
            <button
              onClick={() => handleStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === 'confirmed'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border bg-surface text-text hover:bg-surface-hover'
              }`}
            >
              Tasdiqlangan
            </button>
            <button
              onClick={() => handleStatusFilter('delivering')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === 'delivering'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border bg-surface text-text hover:bg-surface-hover'
              }`}
            >
              Yetkazilmoqda
            </button>
            <button
              onClick={() => handleStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === 'completed'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border bg-surface text-text hover:bg-surface-hover'
              }`}
            >
              Tugallangan
            </button>
            <button
              onClick={() => handleStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === 'cancelled'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border bg-surface text-text hover:bg-surface-hover'
              }`}
            >
              Bekor qilingan
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id}>
              <OrderCard order={order} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!previous}
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
              disabled={!next}
              className="px-4 py-2 rounded-lg border border-border bg-white text-text hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keyingi →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
