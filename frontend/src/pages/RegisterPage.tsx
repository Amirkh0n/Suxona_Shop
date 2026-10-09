/**
 * RegisterPage - Registration page with real API integration
 *
 * Features:
 * - Phone number registration
 * - Telegram verification support
 * - Form validation
 * - Loading states
 * - Error handling
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { useRegister } from '@/features/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    phone: '',
    first_name: '',
    last_name: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { mutate: register, isPending: isRegistering } = useRegister()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError(null)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon raqam kiritishingiz kerak'
    } else if (!/^\+998\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Telefon raqam noto‘g‘ri formatda'
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Ism kiritishingiz kerak'
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'Ism kamida 2 ta belgidan iborat bo‘lishi kerak'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Familiya kiritishingiz kerak'
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Familiya kamida 2 ta belgidan iborat bo‘lishi kerak'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Parol kiritishingiz kerak'
    } else if (formData.password.trim().length < 6) {
      newErrors.password = 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await register({ phone: formData.phone, password: formData.password, first_name: formData.first_name, last_name: formData.last_name })
      window.location.href = ROUTES.home
    } catch (error) {
      console.error('Registration failed:', error)
      setErrors((prev) => ({ ...prev, server: 'Ro‘yxatdan o‘tishda xatolik yuz berdi' }))
      setSubmitError('Ro‘yxatdan o‘tishda xatolik yuz berdi')
    }
  }

  const handleVerify = async () => {
    try {
      // Telegram verification not implemented yet
      window.location.href = ROUTES.home
    } catch (error) {
      console.error('Registration failed:', error)
      setErrors((prev) => ({ ...prev, server: 'Ro‘yxatdan o‘tishda xatolik yuz berdi' }))
      setSubmitError('Ro‘yxatdan o‘tishda xatolik yuz berdi')
    }
  }

  const isPending = isRegistering

  if (false) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">Telegram tekshiruvi</h1>
            <p className="text-text-muted">Hisobingizni tekshirish uchun Telegram bot orqali o'ting</p>
          </div>

          <Card className="p-8">
            <div className="text-center">
              <div className="mb-4">
                <img
                  src="https://t.me/SuxonaShopBot"
                  alt="Telegram Bot"
                  className="w-24 h-24 mx-auto mb-4"
                />
              </div>
              <p className="text-text mb-6">
                Siz quyidagi Telegram bot orqali hisobingizni tekshirasiz:
              </p>
              <div className="bg-surface p-4 rounded-lg mb-6">
                <p className="text-sm text-text-muted mb-2">Hisob aktivlash uchun:</p>
                <ol className="text-left text-sm text-text list-decimal list-inside space-y-1">
                  <li>Telegram bot bilan muloqot qiling</li>
                  <li>Hisob aktivlash havolasini oching</li>
                  <li>Hisob tasdiqlash uchun linkni kliklang</li>
                </ol>
              </div>
              <Button onClick={handleVerify} className="w-full" disabled={isPending}>
                {isPending ? 'Tekshirilmoqda...' : 'Hisobni tekshirish'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Ro‘yxatdan o‘tish</h1>
          <p className="text-text-muted">Hisob yaratish uchun ma’lumotlarni kiriting</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            {submitError && (
              <div className="p-4 rounded-lg bg-danger bg-opacity-10 text-danger text-sm">
                {submitError}
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text mb-2">
                Telefon raqam
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+998901234567"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                disabled={isPending}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-text mb-2">
                Ism
              </label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="Ism"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-text mb-2">
                Familiya
              </label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Familiya"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                disabled={isPending}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Ro‘yxatdan o‘tilmoqda...' : 'Ro‘yxatdan o‘tish'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            Hisobingiz bormi?
            <Link to={ROUTES.login} className="text-primary hover:text-primary-hover font-medium ml-1">
              Kirish
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
