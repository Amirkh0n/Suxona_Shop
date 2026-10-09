/**
 * LoginPage - Login page with real API integration
 *
 * Features:
 * - Real authentication with backend
 * - Form validation
 * - Loading states
 * - Error handling
 * - Token refresh support
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '@/features/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/routes/paths'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { mutate: login, isPending } = useLogin()

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

    if (!formData.password) {
      newErrors.password = 'Parol kiritishingiz kerak'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await login({ phone: formData.phone, password: formData.password })
      window.location.href = ROUTES.home
    } catch (error) {
      console.error('Login failed:', error)
      setSubmitError('Tizimga kirishda xatolik yuz berdi')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">SuxonaShop</h1>
          <p className="text-text-muted">Tizimga kirish</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                Parol
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={isPending}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Kirish...' : 'Kirish'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            Hisobingiz yo'qmi?
            <Link to={ROUTES.register} className="text-primary hover:text-primary-hover font-medium ml-1">
              Ro‘yxatdan o‘tish
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
