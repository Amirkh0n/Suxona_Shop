import api from './api'
import type { LoginCredentials, RegisterCredentials } from '@/types'

export interface AuthResponse {
  access: string
  refresh: string
}

export interface User {
  id: number
  phone: string
  first_name: string
  last_name: string
  telegram_account: TelegramAccount | null
  is_active: boolean
  created_at: string
}

export interface TelegramAccount {
  id: number
  telegram_id: number
  username: string
}

export interface VerificationResponse {
  user: User
  access_token: string
  refresh_token: string
}

const authPrefix = '/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post(`${authPrefix}/login`, credentials)
    return response.data
  },

  async register(credentials: RegisterCredentials): Promise<{ verification_token: string }> {
    const response = await api.post(`${authPrefix}/register`, credentials)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get(`${authPrefix}/me`)
    return response.data
  },

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post(`${authPrefix}/login`, { refresh: refreshToken })
    return response.data
  },

  logout(): void {
    // For JWT, we don't need to do anything on the server
    // The client clears the tokens
  },

  async verifyTelegram(token: string, telegramId: number): Promise<{ access_token: string; refresh_token: string }> {
    const response = await api.post(`${authPrefix}/telegram/verify`, {
      verification_token: token,
      telegram_id: telegramId,
    })
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    }
  },
}
