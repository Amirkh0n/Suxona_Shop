import api from './api'
import type { PaginatedResponse, Product } from '@/types'
import type { components } from '@/types/schema'

type Schemas = components['schemas']

const productsPrefix = '/products'

export const productsService = {
  async list(params?: {
    page?: number
    category?: number
    store?: number
    search?: string
    ordering?: string
  }): Promise<Schemas['ProductList']> {
    const response = await api.get<Schemas['ProductList']>(productsPrefix, { params })
    return response.data
  },

  async getDetail(productId: number): Promise<Product> {
    const response = await api.get(`${productsPrefix}/${productId}`)
    return response.data
  },

  async createProduct(data: {
    category: number
    name: string
    description: string
    price: number
    stock?: number
  }): Promise<Product> {
    const response = await api.post(productsPrefix, data)
    return response.data
  },

  async updateProduct(
    productId: number,
    data: Partial<{
      category: number
      name: string
      description: string
      price: number
      stock: number
    }>
  ): Promise<Product> {
    const response = await api.patch(`${productsPrefix}/${productId}`, data)
    return response.data
  },

  async deleteProduct(productId: number): Promise<void> {
    await api.delete(`${productsPrefix}/${productId}`)
  },

  async listMyProducts(page?: number): Promise<PaginatedResponse<Product>> {
    const response = await api.get(`${productsPrefix}/my`, {
      params: { page },
    })
    return response.data
  },

  async uploadProductImage(productId: number, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('image', file)

    await api.post(`${productsPrefix}/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async listProductImages(productId: number) {
    const response = await api.get(`${productsPrefix}/${productId}/images`)
    return response.data
  },

  async reorderProductImages(productId: number, imageOrder: number[]): Promise<void> {
    await api.post(`${productsPrefix}/${productId}/images/reorder`, {
      image_order: imageOrder,
    })
  },

  async deleteProductImage(productId: number, imageId: number): Promise<void> {
    await api.delete(`${productsPrefix}/${productId}/images/${imageId}`)
  },
}
