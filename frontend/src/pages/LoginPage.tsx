/**
 * LoginPage — User login with phone and password
 *
 * Route: /login
 *
 * Features:
 * - Phone number input (Uzbekistan format)
 * - Password input (with show/hide toggle)
 * - Remember me checkbox
 * - Login button
 * - Link to register page
 * - Forgot password link (placeholder)
 *
 * Phase 3A: UI only, no API calls. Mock authentication.
 *
 * Future API integration points:
 * - POST /api/v1/auth/login (authenticate user)
 * - GET /api/v1/auth/me (fetch user profile)
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Phone, Lock, ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/routes/paths'

export default function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!phone.trim()) {
      setError('Введите номер телефона')
      return
    }
    if (!password.trim()) {
      setError('Введите пароль')
      return
    }

    setIsLoading(true)

    // Mock authentication
    setTimeout(() => {
      console.log('Login:', { phone, password, rememberMe })
      setIsLoading(false)
      
      // Mock success - navigate to home
      alert('Вход выполнен успешно!\n(В Phase 3B здесь будет реальная аутентификация)')
      navigate(ROUTES.home)
    }, 1000)
  }

  const formatPhoneInput = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format: +998 XX XXX XX XX
    if (digits.startsWith('998')) {
      const formatted = digits.slice(3).match(/.{1,2}/g)?.join(' ') || ''
      return `+998 ${formatted}`.trim()
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhone(formatPhoneInput(value))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-surface"
            aria-label="Назад"
          >
            <ArrowLeft className="h-5 w-5 text-text" />
          </button>
          <h1 className="text-lg font-bold text-text">Вход</h1>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center p-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-text">Добро пожаловать!</h2>
            <p className="mt-2 text-text-muted">
              Войдите, чтобы продолжить покупки
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-error/10 p-4 text-sm text-error">
                {error}
              </div>
            )}

            {/* Phone Input */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-text"
              >
                Номер телефона
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Phone className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+998 90 123 45 67"
                  className="h-12 w-full rounded-xl border border-border bg-white pl-12 pr-4 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-text"
              >
                Пароль
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="h-12 w-full rounded-xl border border-border bg-white pl-12 pr-12 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-muted hover:text-text"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm text-text">Запомнить меня</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Функция восстановления пароля будет реализована в Phase 3B')}
                className="text-sm font-medium text-primary hover:underline"
              >
                Забыли пароль?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>

            {/* Register Link */}
            <p className="text-center text-sm text-text-muted">
              Нет аккаунта?{' '}
              <Link
                to={ROUTES.register}
                className="font-medium text-primary hover:underline"
              >
                Зарегистрироваться
              </Link>
            </p>
          </form>

          {/* Additional Info */}
          <div className="mt-8 rounded-xl bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-900">
              Войдя в аккаунт, вы соглашаетесь с{' '}
              <button className="font-medium underline">
                условиями использования
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
