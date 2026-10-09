# SuxonaShop Frontend Documentation

## Frontend Technology Stack

- **Framework**: React 19.2.6
- **Build Tool**: Vite 8.0.12
- **Routing**: React Router 7.17.0
- **State Management**: Zustand 5.0.14
- **Data Fetching**: TanStack React Query 5.101.0
- **Forms**: React Hook Form 7.77.0 + Zod 4.4.3
- **Styling**: Tailwind CSS 4.3.0
- **HTTP Client**: Axios 1.17.0
- **Testing**: Vitest 4.1.8
- **Icons**: Lucide React 1.17.0
- **TypeScript**: 6.0.2

## Project Structure

```
frontend/
├── src/
│   ├── pages/                 # Page components
│   │   ├── HomePage.tsx       # Home page with banner, categories
│   │   ├── ProductListPage.tsx # Product listing with filters
│   │   ├── ProductDetailPage.tsx # Product detail view
│   │   ├── CartPage.tsx       # Shopping cart
│   │   ├── CheckoutPage.tsx   # Checkout process
│   │   ├── OrdersPage.tsx     # Order history
│   │   ├── OrderDetailPage.tsx # Order details
│   │   ├── OrderSuccessPage.tsx # Order confirmation
│   │   ├── LoginPage.tsx      # Login page
│   │   ├── RegisterPage.tsx   # Registration page
│   │   ├── SearchPage.tsx     # Search results
│   │   ├── ProfilePage.tsx    # User profile
│   │   └── Placeholder.tsx    # Temporary page
│   │
│   ├── components/            # Reusable UI components
│   │   ├── ProductCard.tsx    # Product display card
│   │   ├── CategoryCard.tsx   # Category display
│   │   ├── StoreCard.tsx      # Store display
│   │   ├── CartItemRow.tsx    # Cart item row
│   │   ├── CartStoreGroup.tsx # Cart grouped by store
│   │   ├── CartSkeleton.tsx  # Loading skeleton for cart
│   │   ├── OrderCard.tsx      # Order display
│   │   ├── OrderStatusBadge.tsx # Order status badge
│   │   ├── OrderSummary.tsx   # Order summary
│   │   ├── OrderTimeline.tsx  # Order status timeline
│   │   ├── PriceSummary.tsx   # Price calculation display
│   │   ├── AddressCard.tsx    # Address display
│   │   ├── BannerCarousel.tsx # Banner slider
│   │   ├── CategoryCard.tsx   # Category card
│   │   ├── CheckoutSection.tsx # Checkout section
│   │   ├── DeliveryInfoCard.tsx # Delivery information
│   │   ├── DeliveryMethodCard.tsx # Delivery method
│   │   └── FilterChip.tsx     # Filter chip component
│   │
│   ├── features/              # Feature modules (to be implemented)
│   │   └── .gitkeep            # Placeholder
│   │
│   ├── hooks/                 # Custom React hooks (to be implemented)
│   │   └── .gitkeep            # Placeholder
│   │
│   ├── services/              # API services
│   │   └── api.ts              # Axios API client
│   │
│   ├── stores/                # Zustand state stores
│   │   ├── authStore.ts        # Authentication state
│   │   ├── appStore.ts         # App state
│   │   ├── uiStore.ts          # UI state
│   │   └── telegramStore.ts    # Telegram state
│   │
│   ├── routes/                # Routing configuration
│   │   ├── routes.tsx          # Route definitions
│   │   ├── paths.ts            # Route path constants
│   │   ├── router.ts           # Router setup
│   │   ├── PageWrapper.tsx     # Page wrapper component
│   │   ├── ProtectedRoute.tsx  # Authentication protection
│   │   └── SellerRoute.tsx     # Seller protection
│   │
│   ├── types/                 # TypeScript types
│   │   ├── index.ts            # Main type exports
│   │   └── schema.d.ts         # Generated from API schema
│   │
│   ├── utils/                 # Utility functions
│   │   ├── normalizeError.ts   # Error normalization
│   │   ├── orderStatus.ts      # Order status utilities
│   │   └── sellerAccess.ts     # Seller access utilities
│   │
│   ├── layouts/               # Layout components (to be implemented)
│   │
│   ├── constants/             # App constants
│   │
│   ├── components/ui/         # UI component library (to be implemented)
│   │
│   ├── assets/                # Static assets
│   ├── assets/styles/         # Global styles
│   ├── assets/images/         # Images
│   │
│   ├── app/                   # App-level configuration
│   │   ├── App.tsx             # Root component
│   │   ├── main.tsx            # App entry point
│   │   └── index.css           # Global styles
│   │
│   ├── test/                  # Test setup
│   │   └── setup.ts            # Test utilities
│   │
│   └── types/schema.d.ts      # Auto-generated from API
│
├── public/                    # Static assets (not processed by Vite)
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # TypeScript app configuration
├── tsconfig.node.json         # TypeScript node configuration
├── eslint.config.js           # ESLint configuration
├── .prettierrc.json           # Prettier configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

## Routing Architecture

### Route Structure

```typescript
// Public Routes
/ → HomePage
/search → SearchPage
/catalog/:categorySlug → CategoryPage
/stores → StoreListPage
/store/:storeId → StoreDetailPage
/product/:productId → ProductDetailPage
/login → LoginPage
/register → RegisterPage

// Protected Routes (requires authentication)
/cart → CartPage
/checkout/:storeId → CheckoutPage
/orders → OrdersPage
/order/:orderId → OrderDetailPage
/profile → ProfilePage
/addresses → AddressPage

// Seller Routes (requires seller role)
/seller → SellerDashboard
/seller/products → SellerProducts
/seller/products/create → SellerProductCreate
/seller/products/:productId/edit → SellerProductEdit
/seller/orders → SellerOrders
/seller/order/:orderId → SellerOrderDetail
/seller/statistics → SellerStatistics
/seller/settings → SellerSettings

// System Routes
/404 → NotFoundPage
/unauthorized → UnauthorizedPage
```

### Route Guards

#### ProtectedRoute
```typescript
// Requires authentication
// Redirects to /login if not authenticated
```

#### SellerRoute
```typescript
// Requires seller role
// Redirects to /login if not authenticated
// Redirects to /home if not a seller
```

### Route Protection Strategy

1. **Initial Load**: Check token in localStorage
2. **Token Refresh**: Use refresh token to get new access token
3. **Error Handling**: Clear auth state on 401 errors
4. **Redirect**: Redirect to appropriate page on auth failure

## State Management

### AuthStore

```typescript
interface AuthState {
  // State
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearUser: () => void
  updateUser: (user: User) => void
  refreshTokens: () => Promise<void>
}
```

**Features**:
- Auto-login on page load
- Token management
- User session persistence
- Error handling

### AppStore

```typescript
interface AppState {
  // State
  isLoading: boolean
  error: string | null
  successMessage: string | null
  theme: 'light' | 'dark'
}

// Actions
setLoading: (loading: boolean) => void
setError: (error: string | null) => void
setSuccessMessage: (message: string | null) => void
toggleTheme: () => void
```

### UIStore

```typescript
interface UIState {
  // State
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  notifications: Notification[]
  toast: Toast | null

  // Actions
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  showToast: (toast: Toast) => void
  hideToast: () => void
}
```

### TelegramStore

```typescript
interface TelegramState {
  // State
  isConnecting: boolean
  isConnected: boolean
  userInfo: TelegramUserInfo | null

  // Actions
  connect: () => Promise<void>
  disconnect: () => void
  updateUserInfo: (userInfo: TelegramUserInfo) => void
}
```

## Data Fetching

### TanStack React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### API Service Layer

```typescript
// Example: Cart Service
export const cartService = {
  getCart: () => api.get<Cart>('/cart'),
  clearCart: () => api.delete('/cart'),
  addItem: (product: number, quantity: number) =>
    api.post<CartItem>('/cart/items', { product, quantity }),
  updateItem: (itemId: number, quantity: number) =>
    api.patch<CartItem>(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: number) =>
    api.delete(`/cart/items/${itemId}`),
}
```

### Example: Custom Hook

```typescript
// Example: useCart hook
export function useCart() {
  const queryClient = useQueryClient()

  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    retry: false,
  })

  const addItem = useMutation({
    mutationFn: cartService.addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  return {
    cart,
    isLoading,
    error,
    addItem,
    refetch,
  }
}
```

## Form Handling

### React Hook Form + Zod

```typescript
// Example: Checkout Form
const CheckoutForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async (data: CheckoutFormData) => {
    await checkoutService.createOrder(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Name</label>
        <input {...register('name')} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>
      {/* Other fields */}
    </form>
  )
}
```

## Component Architecture

### Presentational Components

```typescript
// Pure UI components - no state, just props
export const ProductCard = ({ id, name, price, image }: ProductCardProps) => {
  return (
    <div className="product-card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>{price}</p>
    </div>
  )
}
```

### Container Components

```typescript
// Connects to store/services
export const CartPage = () => {
  const { cart, addItem, removeItem } = useCart()
  const { showToast } = useUIStore()

  const handleAddToCart = async (product: Product) => {
    await addItem(product.id, 1)
    showToast('Added to cart successfully!')
  }

  return <CartPageContent cart={cart} onAdd={handleAddToCart} />
}
```

## API Integration

### Axios Configuration

```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
})

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)
```

## Testing

### Unit Testing

```typescript
// Example: CartItemRow.test.tsx
describe('CartItemRow', () => {
  it('renders product information', () => {
    const product = { id: 1, name: 'Product 1', price: 100000 }
    render(<CartItemRow product={product} />)
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getByText('100000 so\'m')).toBeInTheDocument()
  })
})
```

### Integration Testing

```typescript
// Example: CartPage.test.tsx
describe('CartPage', () => {
  it('displays cart items', () => {
    const cart = {
      stores: [
        {
          items: [
            { id: 1, quantity: 2, subtotal: 200000 },
          ],
        },
      ],
    }

    render(<CartPage cart={cart} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
```

## Error Handling

### Error Normalization

```typescript
// src/utils/normalizeError.ts
export function normalizeError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const response = error.response
    if (response?.data?.detail) {
      return {
        status: response.status,
        message: response.data.detail,
      }
    }
  }

  return {
    status: 500,
    message: 'An unexpected error occurred',
  }
}
```

### Error UI Components

```typescript
export const ErrorMessage = ({ error }: { error: AppError }) => {
  return (
    <div className="error-message">
      <p>{error.message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  )
}
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load pages
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

// Lazy load components
const ProductCard = lazy(() => import('@/components/ProductCard'))
```

### React.memo for Component Optimization

```typescript
export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  return <div>{/* Component code */}</div>
})
```

### Memoization for Expensive Calculations

```typescript
export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = useMemo(
    () => formatPrice(product.price),
    [product.price]
  )

  return <div>{formattedPrice}</div>
})
```

## Responsive Design

### Breakpoints

```css
/* Tailwind CSS defaults */
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
```

### Responsive Components

```typescript
export const ProductGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

## Accessibility (a11y)

### ARIA Labels

```typescript
<button
  aria-label="Add to cart"
  onClick={() => addToCart(product)}
>
  <ShoppingCart size={20} />
</button>
```

### Keyboard Navigation

```typescript
<input
  type="text"
  aria-label="Search products"
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }}
/>
```

### Screen Reader Support

```typescript
<div role="alert" aria-live="polite">
  {error && <p>{error.message}</p>}
</div>
```

## Build & Development

### Development

```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Production

```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Variables

```env
# .env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=SuxonaShop
```

---

**Last Updated**: August 28, 2026
**Frontend Version**: 0.0.0
