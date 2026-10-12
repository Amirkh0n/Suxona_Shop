import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreviewNotice } from '../../context/PreviewNoticeContext';
import { STORE_STATUS_LABELS } from '../../utils/format';
import logo from '../../assets/logo.png';
import {
  HomeIcon, PackageIcon, ReceiptIcon, UsersIcon, ChartIcon, SettingsIcon, StoreIcon,
} from '../../components/Icons';

const NAV = [
  { to: '/sotuvchi', label: 'Bosh sahifa', Icon: HomeIcon, end: true },
  { to: '/sotuvchi/mahsulotlar', label: 'Mahsulotlar', Icon: PackageIcon },
  { to: '/sotuvchi/buyurtmalar', label: 'Buyurtmalar', Icon: ReceiptIcon },
  { to: '/sotuvchi/sozlamalar', label: 'Sozlamalar', Icon: SettingsIcon },
];

export default function SellerLayout() {
  const { myStore } = useAuth();
  const { notify } = usePreviewNotice();

  return (
    <div className="seller-shell">
      <aside className="seller-sidebar">
        <Link to="/" className="app-logo" style={{ padding: '0 var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
          <img src={logo} alt="" className="app-logo-mark" />
          <span className="nav-label-full">Suxona<span className="app-logo-accent">Shop</span></span>
        </Link>

        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `seller-nav-link${isActive ? ' active' : ''}`}>
            <Icon />
            <span className="nav-label-full">{label}</span>
          </NavLink>
        ))}

        {/* Visible in the mockup; no backend endpoint to back them (no customers
            list, no analytics endpoint) — kept as honest UI-only affordances. */}
        <button type="button" className="seller-nav-link ui-preview" style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => notify("Mijozlar bo'limi tez orada qo'shiladi.")}>
          <UsersIcon />
          <span className="nav-label-full">Mijozlar</span>
        </button>
        <button type="button" className="seller-nav-link ui-preview" style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => notify("Statistika bo'limi tez orada qo'shiladi.")}>
          <ChartIcon />
          <span className="nav-label-full">Statistika</span>
        </button>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-4)' }}>
          <Link to="/" className="seller-nav-link">
            <StoreIcon />
            <span className="nav-label-full">Do'konga o'tish</span>
          </Link>
        </div>
      </aside>

      <main className="seller-main">
        {myStore?.status !== 'ACTIVE' && (
          <div className={`alert ${myStore?.status === 'REJECTED' || myStore?.status === 'SUSPENDED' ? 'alert-error' : 'alert-info'}`}>
            {myStore?.status === 'PENDING' && "Do'koningiz hali administrator tomonidan tasdiqlanmagan. Mahsulot qo'shishingiz mumkin, lekin do'kon xaridorlarga faol ko'rinmaydi."}
            {myStore?.status === 'SUSPENDED' && "Do'koningiz to'xtatilgan. Savollar bo'lsa, administratsiya bilan bog'laning."}
            {myStore?.status === 'REJECTED' && "Do'kon arizangiz rad etilgan."}
            {' '}
            <strong>Holat: {STORE_STATUS_LABELS[myStore?.status] || myStore?.status}</strong>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
