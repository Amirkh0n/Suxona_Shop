import api from './api'
import type { Order, PaginatedResponse } from '@/types'

const ordersPrefix = '/orders'

export const ordersService = {
  async createOrder(data: {
    store: number
    address: number
    note?: string
  }): Promise<Order> {
    const response = await api.post<Order>(ordersPrefix, data)
    return response.data
  },

  async listMyOrders(params?: {
    page?: number
    status?: string
  }): Promise<PaginatedResponse<Order>> {
    const response = await api.get(`${ordersPrefix}/my`, { params })
    return response.data
  },

  async getOrderDetail(orderId: number): Promise<Order> {
    const response = await api.get(`${ordersPrefix}/${orderId}`)
    return response.data
  },

  async cancelOrder(orderId: number): Promise<Order> {
    const response = await api.post(`${ordersPrefix}/${orderId}/cancel`)
    return response.data
  },
}
