/**
 * ProfilePage — User profile and account management
 *
 * Route: /profile
 *
 * Guest State:
 * - Login button
 * - Register button
 * - Browse as guest info
 *
 * Authenticated State:
 * - User info (avatar, name, phone)
 * - Orders section (link to orders)
 * - Addresses section (link to addresses)
 * - Seller section (Become a Seller or Seller Dashboard)
 * - Settings section
 * - Logout button
 *
 * Phase 3A: UI only, no API calls. Mock authenticated state.
 *
 * Future API integration points:
 * - GET /api/v1/auth/me (current user)
 * - POST /api/v1/auth/logout (logout)
 * - GET /api/v1/stores/my (check if user is seller)
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Package,
  MapPin,
  Store,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  HelpCircle,
  FileText,
  Shield,
} from 'lucide-react'
import { ROUTES } from '@/routes/paths'

type AuthState = 'guest' | 'authenticated'

interface MenuItem {
  icon: typeof User
  label: string
  sublabel?: string
  to?: string
  onClick?: () => void
  badge?: string | number
  variant?: 'default' | 'primary' | 'danger'
}

const MenuSection = ({
  title,
  items,
}: {
  title?: string
  items: MenuItem[]
}) => (
  <div className="rounded-2xl bg-white shadow-sm">
    {title && (
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-semibold text-text">{title}</h2>
      </div>
    )}
    <div className="divide-y divide-border">
      {items.map((item, index) => {
        const Icon = item.icon
        const isLink = !!item.to
        const isPrimary = item.variant === 'primary'
        const isDanger = item.variant === 'danger'

        const content = (
          <>
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                isPrimary
                  ? 'bg-primary/10 text-primary'
                  : isDanger
                    ? 'bg-error/10 text-error'
                    : 'bg-surface text-text-muted'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p
                className={`font-medium ${
                  isPrimary
                    ? 'text-primary'
                    : isDanger
                      ? 'text-error'
                      : 'text-text'
                }`}
              >
                {item.label}
                {item.badge !== undefined && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {item.badge}
                  </span>
                )}
              </p>
              {item.sublabel && (
                <p className="mt-0.5 text-sm text-text-muted">
                  {item.sublabel}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-text-muted" />
          </>
        )

        return isLink ? (
          <Link
            key={index}
            to={item.to!}
            className="flex items-center gap-3 p-4 transition-colors hover:bg-surface"
          >
            {content}
          </Link>
        ) : (
          <button
            key={index}
            onClick={item.onClick}
            className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface"
          >
            {content}
          </button>
        )
      })}
    </div>
  </div>
)

export default function ProfilePage() {
  // Mock auth state - in real app, this comes from authStore
  const [authState] = useState<AuthState>('authenticated')
  const [hasActiveStore] = useState(false)

  // Mock user data
  const MOCK_USER = {
    fullName: 'Aziz Karimov',
    phone: '+998 90 123 45 67',
    email: 'aziz.karimov@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Aziz+Karimov&background=22C55E&color=fff&size=128',
    memberSince: 'Январь 2024',
  }

  // Mock stats
  const MOCK_STATS = {
    activeOrders: 2,
    completedOrders: 12,
    addresses: 2,
  }

  const handleLogout = () => {
    console.log('Logout')
    alert('Функция выхода будет реализована в Phase 3B')
  }

  // Guest view
  if (authState === 'guest') {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="border-b border-border bg-white">
          <div className="mx-auto flex h-14 max-w-[1280px] items-center px-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-text">Профиль</h1>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[600px] p-4">
          {/* Guest State */}
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface">
              <User className="h-12 w-12 text-text-muted" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-text">
              Войдите в аккаунт
            </h2>
            <p className="mb-8 max-w-sm text-text-muted">
              Войдите или зарегистрируйтесь, чтобы отслеживать заказы и управлять
              профилем
            </p>

            <div className="w-full space-y-3">
              <Link
                to={ROUTES.login}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Войти
              </Link>
              <Link
                to={ROUTES.register}
                className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-border bg-white font-semibold text-text transition-colors hover:bg-surface"
              >
                Зарегистрироваться
              </Link>
            </div>

            <div className="mt-8 rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                Вы можете продолжить просмотр товаров как гость
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated view
  const accountMenuItems: MenuItem[] = [
    {
      icon: Package,
      label: 'Мои заказы',
      sublabel: `${MOCK_STATS.activeOrders} активных`,
      to: ROUTES.orders,
      badge: MOCK_STATS.activeOrders,
    },
    {
      icon: MapPin,
      label: 'Адреса доставки',
      sublabel: `${MOCK_STATS.addresses} адресов`,
      to: ROUTES.addresses,
    },
  ]

  const sellerMenuItem: MenuItem = hasActiveStore
    ? {
        icon: Store,
        label: 'Панель продавца',
        sublabel: 'Управление магазином',
        to: ROUTES.seller,
        variant: 'primary',
      }
    : {
        icon: Store,
        label: 'Стать продавцом',
        sublabel: 'Откройте свой магазин',
        to: ROUTES.sellerOnboarding,
        variant: 'primary',
      }

  const settingsMenuItems: MenuItem[] = [
    {
      icon: Bell,
      label: 'Уведомления',
      sublabel: 'Настройка оповещений',
      onClick: () => alert('Функция будет реализована позже'),
    },
    {
      icon: Settings,
      label: 'Настройки',
      sublabel: 'Параметры аккаунта',
      onClick: () => alert('Функция будет реализована позже'),
    },
    {
      icon: HelpCircle,
      label: 'Помощь и поддержка',
      sublabel: 'FAQ и обращения',
      onClick: () => alert('Функция будет реализована позже'),
    },
    {
      icon: FileText,
      label: 'Условия использования',
      onClick: () => alert('Функция будет реализована позже'),
    },
    {
      icon: Shield,
      label: 'Политика конфиденциальности',
      onClick: () => alert('Функция будет реализована позже'),
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center px-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-text">Профиль</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] space-y-4 p-4">
        {/* User Info Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={MOCK_USER.avatar}
              alt={MOCK_USER.fullName}
              className="h-20 w-20 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-text">
                {MOCK_USER.fullName}
              </h2>
              <p className="mt-1 text-sm text-text-muted">{MOCK_USER.phone}</p>
              <p className="mt-0.5 text-xs text-text-muted">
                С нами с {MOCK_USER.memberSince}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <Link
              to={ROUTES.orders}
              className="rounded-lg bg-surface p-3 transition-colors hover:bg-primary/5"
            >
              <p className="text-2xl font-bold text-primary">
                {MOCK_STATS.activeOrders}
              </p>
              <p className="mt-1 text-xs text-text-muted">Активных заказов</p>
            </Link>
            <div className="rounded-lg bg-surface p-3">
              <p className="text-2xl font-bold text-text">
                {MOCK_STATS.completedOrders}
              </p>
              <p className="mt-1 text-xs text-text-muted">Завершено</p>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <MenuSection title="Мой аккаунт" items={accountMenuItems} />

        {/* Seller Section */}
        <MenuSection items={[sellerMenuItem]} />

        {/* Settings Section */}
        <MenuSection title="Настройки и поддержка" items={settingsMenuItems} />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white p-4 font-semibold text-error shadow-sm transition-colors hover:bg-error/5"
        >
          <LogOut className="h-5 w-5" />
          Выйти из аккаунта
        </button>

        {/* App Version */}
        <div className="text-center">
          <p className="text-xs text-text-muted">SuxonaShop v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
