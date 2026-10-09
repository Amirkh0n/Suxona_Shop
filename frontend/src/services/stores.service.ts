import api from './api'
import type { PaginatedResponse, Store } from '@/types'

const storesPrefix = '/stores'

export const storesService = {
  async list(params?: {
    page?: number
    search?: string
  }): Promise<PaginatedResponse<Store>> {
    const response = await api.get<PaginatedResponse<Store>>(storesPrefix, { params })
    return response.data
  },

  async getDetail(storeId: number): Promise<Store> {
    const response = await api.get<Store>(`${storesPrefix}/${storeId}`)
    return response.data
  },

  async getMyStore(): Promise<Store> {
    const response = await api.get<Store>(`${storesPrefix}/my`)
    return response.data
  },

  async updateMyStore(data: {
    description?: string
    phone?: string
  }): Promise<Store> {
    const response = await api.patch<Store>(`${storesPrefix}/my`, data)
    return response.data
  },

  async listDeliveryZones(storeId: number) {
    const response = await api.get(`${storesPrefix}/${storeId}/delivery-zones`)
    return response.data
  },

  async createDeliveryZone(data: {
    store: number
    village: string
    street: string
    delivery_price: number
  }) {
    const response = await api.post('/delivery-zones', data)
    return response.data
  },

  async updateDeliveryZone(zoneId: number, data: {
    delivery_price?: number
    is_active?: boolean
  }) {
    const response = await api.patch(`/delivery-zones/${zoneId}`, data)
    return response.data
  },

  async deleteDeliveryZone(zoneId: number): Promise<void> {
    await api.delete(`/delivery-zones/${zoneId}`)
  },
}
