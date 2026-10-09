import api from './api'
import type { Cart, CartItem } from '@/types'

const cartPrefix = '/cart'

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get<Cart>(cartPrefix)
    return response.data
  },

  async clearCart(): Promise<void> {
    await api.delete(cartPrefix)
  },

  async addItem(productId: number, quantity: number): Promise<CartItem> {
    const response = await api.post<CartItem>(`${cartPrefix}/items`, {
      product: productId,
      quantity,
    })
    return response.data
  },

  async updateItem(itemId: number, quantity: number): Promise<CartItem> {
    const response = await api.patch<CartItem>(`${cartPrefix}/items/${itemId}`, { quantity })
    return response.data
  },

  async removeItem(itemId: number): Promise<void> {
    await api.delete(`${cartPrefix}/items/${itemId}`)
  },
}
