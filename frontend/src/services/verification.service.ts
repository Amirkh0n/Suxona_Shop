import api from './api'

export interface VerifyTelegramParams {
  verification_token: string
  telegram_id: number
}

export interface VerifyTelegramResponse {
  user: {
    id: number
    phone: string
    first_name: string
    last_name: string
    telegram_account: {
      id: number
      telegram_id: number
      username: string
    } | null
    is_active: boolean
  }
  access_token: string
  refresh_token: string
}

const authPrefix = '/auth'

export const verificationService = {
  async verifyTelegram(params: VerifyTelegramParams): Promise<VerifyTelegramResponse> {
    const response = await api.post<VerifyTelegramResponse>(
      `${authPrefix}/telegram/verify`,
      params
    )
    return response.data
  },
}
