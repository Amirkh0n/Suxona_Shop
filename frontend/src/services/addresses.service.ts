import api from './api'
import type { Address } from '@/types'

const addressesPrefix = '/addresses'

export const addressesService = {
  async list(): Promise<Address[]> {
    const response = await api.get<Address[]>(addressesPrefix)
    return response.data
  },

  async create(data: {
    village: string
    street: string
    home_number: string
    flat_number?: string
    is_default?: boolean
  }): Promise<Address> {
    const response = await api.post<Address>(addressesPrefix, data)
    return response.data
  },

  async update(addressId: number, data: {
    home_number?: string
    flat_number?: string
    is_default?: boolean
  }): Promise<Address> {
    const response = await api.patch<Address>(`${addressesPrefix}/${addressId}`, data)
    return response.data
  },

  async delete(addressId: number): Promise<void> {
    await api.delete(`${addressesPrefix}/${addressId}`)
  },
}
