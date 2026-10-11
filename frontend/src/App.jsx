import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ShopLayout, BareLayout, FocusLayout } from './components/layouts';
import ProtectedRoute, { SellerRoute } from './components/ProtectedRoute';
import { PageSpinner } from './components/Spinner';

import Home from './pages/customer/Home';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import Catalog from './pages/customer/Catalog';
import ProductList from './pages/customer/ProductList';
import ProductDetail from './pages/customer/ProductDetail';
import StoreDetail from './pages/customer/StoreDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import OrderList from './pages/customer/OrderList';
import OrderDetail from './pages/customer/OrderDetail';
import Profile from './pages/customer/Profile';
import Addresses from './pages/customer/Addresses';
import BecomeSeller from './pages/customer/BecomeSeller';
import NotFound from './pages/NotFound';

// Seller panel is a separate, sidebar-driven dashboard that an ordinary
// shopper never visits. Loading it lazily keeps its code out of the main
// customer bundle, so the first paint on a phone stays fast.
const SellerLayout = lazy(() => import('./pages/seller/SellerLayout'));
const SellerDashboard = lazy(() => import('./pages/seller/Dashboard'));
const SellerProducts = lazy(() => import('./pages/seller/Products'));
const SellerProductForm = lazy(() => import('./pages/seller/ProductForm'));
const SellerOrders = lazy(() => import('./pages/seller/Orders'));
const SellerSettings = lazy(() => import('./pages/seller/Settings'));

export default function App() {
  return (
    <Routes>
      {/* Auth + full-bleed flows: no header, no tab bar */}
      <Route element={<FocusLayout />}>
        <Route path="/kirish" element={<Login />} />
        <Route path="/royxatdan-otish" element={<Register />} />
        <Route path="/rasmiylashtirish/:storeId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/buyurtma-qabul-qilindi/:orderId" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
      </Route>

      {/* Main tab pages: header + search + bottom tab bar */}
      <Route element={<ShopLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/katalog" element={<Catalog />} />
        <Route path="/savat" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/buyurtmalarim" element={<ProtectedRoute><OrderList /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      {/* Secondary screens: own PageHeader/topbar, tab bar stays for quick nav */}
      <Route element={<BareLayout />}>
        <Route path="/mahsulotlar" element={<ProductList />} />
        <Route path="/mahsulot/:productId" element={<ProductDetail />} />
        <Route path="/dokon/:storeId" element={<StoreDetail />} />
        <Route path="/buyurtma/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/profil/manzillar" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
        <Route path="/dokon-ochish" element={<ProtectedRoute><BecomeSeller /></ProtectedRoute>} />
      </Route>

      {/* Seller dashboard: sidebar shell, no customer chrome, loaded lazily */}
      <Route
        path="/sotuvchi"
        element={
          <SellerRoute>
            <Suspense fallback={<PageSpinner />}>
              <SellerLayout />
            </Suspense>
          </SellerRoute>
        }
      >
        <Route index element={<Suspense fallback={<PageSpinner />}><SellerDashboard /></Suspense>} />
        <Route path="mahsulotlar" element={<Suspense fallback={<PageSpinner />}><SellerProducts /></Suspense>} />
        <Route path="mahsulotlar/yangi" element={<Suspense fallback={<PageSpinner />}><SellerProductForm /></Suspense>} />
        <Route path="mahsulotlar/:productId" element={<Suspense fallback={<PageSpinner />}><SellerProductForm /></Suspense>} />
        <Route path="buyurtmalar" element={<Suspense fallback={<PageSpinner />}><SellerOrders /></Suspense>} />
        <Route path="sozlamalar" element={<Suspense fallback={<PageSpinner />}><SellerSettings /></Suspense>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
