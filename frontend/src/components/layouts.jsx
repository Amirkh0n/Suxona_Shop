import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomTabBar from './BottomTabBar';

// Customer-facing routes are a mobile app UI (bottom tab bar, pill buttons,
// fixed CTAs). On a wide desktop viewport that layout would otherwise
// stretch edge-to-edge — a hero image flush against the browser's top-left
// corner, a tab bar spanning 1920px. `.app-shell` centers it as a fixed-width
// "device frame" instead (width only — see the CSS comment above
// `.app-shell` for why its fixed-position children, like the tab bar, are
// anchored to the real viewport rather than to this element).
function AppShell({ children }) {
  return <div className="app-shell">{children}</div>;
}

// Home / Katalog / Savat / Buyurtmalarim / Profil root: full search header + tab bar.
export function ShopLayout() {
  return (
    <AppShell>
      <Header />
      <div className="app-content">
        <Outlet />
      </div>
      <BottomTabBar />
    </AppShell>
  );
}

// Secondary screens that build their own PageHeader: product/store detail,
// addresses, order detail... still keep the tab bar for quick navigation.
export function BareLayout() {
  return (
    <AppShell>
      <div className="app-content">
        <Outlet />
      </div>
      <BottomTabBar />
    </AppShell>
  );
}

// Checkout flow, order success: full-bleed, no tab bar, no search header —
// these pages own their entire screen including a sticky bottom CTA.
export function FocusLayout() {
  return (
    <AppShell>
      <div className="app-content no-tabbar">
        <Outlet />
      </div>
    </AppShell>
  );
}
