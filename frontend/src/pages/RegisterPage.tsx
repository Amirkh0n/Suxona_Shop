/**
 * RegisterPage — User registration with Telegram verification
 *
 * Route: /register
 *
 * Features:
 * - Full name input
 * - Phone number input (Uzbekistan format)
 * - Password input (with show/hide toggle)
 * - Password confirmation
 * - Terms agreement checkbox
 * - Register button
 * - Link to login page
 *
 * After registration:
 * - Show success message with Telegram verification link
 * - User must verify account via Telegram bot
 *
 * Phase 3A: UI only, no API calls. Mock registration.
 *
 * Future API integration points:
 * - POST /api/v1/auth/register (create account)
 * - Response includes Telegram deep link for verification
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Phone, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react'
import { ROUTES } from '@/routes/paths'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [telegramLink, setTelegramLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!fullName.trim()) {
      setError('Введите ваше имя')
      return
    }
    if (!phone.trim()) {
      setError('Введите номер телефона')
      return
    }
    if (!password.trim()) {
      setError('Введите пароль')
      return
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    if (!agreeTerms) {
      setError('Примите условия использования')
      return
    }

    setIsLoading(true)

    // Mock registration
    setTimeout(() => {
      console.log('Register:', { fullName, phone, password })
      setIsLoading(false)
      
      // Mock success with Telegram link
      const mockTelegramLink = 'https://t.me/suxonashop_bot?start=verify_ABC123DEF456'
      setTelegramLink(mockTelegramLink)
      setRegistrationSuccess(true)
    }, 1000)
  }

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '')
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

  const handleOpenTelegram = () => {
    window.open(telegramLink, '_blank')
  }

  // Success state
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center p-6">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>

          <h2 className="mb-2 text-center text-2xl font-bold text-text">
            Регистрация успешна!
          </h2>
          <p className="mb-8 text-center text-text-muted">
            Для завершения регистрации подтвердите аккаунт через Telegram
          </p>

          <div className="w-full space-y-4">
            <button
              onClick={handleOpenTelegram}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-500 font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Открыть Telegram
            </button>

            <Link
              to={ROUTES.login}
              className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-border bg-white font-semibold text-text transition-colors hover:bg-surface"
            >
              Вернуться к входу
            </Link>
          </div>

          <div className="mt-8 rounded-xl bg-blue-50 p-4">
            <p className="text-center text-sm text-blue-900">
              Ссылка для верификации отправлена на ваш номер телефона
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-surface p-3">
            <p className="text-center text-xs text-text-muted">
              Ссылка: <span className="font-mono text-xs">{telegramLink}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Registration form
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
          <h1 className="text-lg font-bold text-text">Регистрация</h1>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center p-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-text">Создайте аккаунт</h2>
            <p className="mt-2 text-text-muted">
              Зарегистрируйтесь, чтобы начать покупки
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-error/10 p-4 text-sm text-error">
                {error}
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-text"
              >
                Полное имя
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Введите ваше имя"
                  className="h-12 w-full rounded-xl border border-border bg-white pl-12 pr-4 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

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
                  placeholder="Минимум 6 символов"
                  className="h-12 w-full rounded-xl border border-border bg-white pl-12 pr-12 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  autoComplete="new-password"
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

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-text"
              >
                Подтвердите пароль
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  className="h-12 w-full rounded-xl border border-border bg-white pl-12 pr-12 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-muted hover:text-text"
                  aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-sm text-text">
                Я согласен с{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  условиями использования
                </button>{' '}
                и{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  политикой конфиденциальности
                </button>
              </span>
            </label>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-text-muted">
              Уже есть аккаунт?{' '}
              <Link
                to={ROUTES.login}
                className="font-medium text-primary hover:underline"
              >
                Войти
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
