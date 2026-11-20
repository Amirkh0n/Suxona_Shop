import { NavLink } from 'react-router-dom';
import { HomeIcon, GridIcon, CartIcon, ReceiptIcon, UserIcon } from './Icons';
import { useI18n } from '../i18n';
import { useCart } from '../context/CartContext';

export default function BottomTabBar() {
  const { itemCount } = useCart();
  const { t } = useI18n();

  const tabs = [
    { to: '/', label: t('nav.home'), Icon: HomeIcon, end: true },
    { to: '/katalog', label: t('nav.catalog'), Icon: GridIcon },
    { to: '/savat', label: t('nav.cart'), Icon: CartIcon, badge: itemCount },
    { to: '/buyurtmalarim', label: t('nav.orders'), Icon: ReceiptIcon },
    { to: '/profil', label: t('nav.profile'), Icon: UserIcon },
  ];

  return (
    <nav className="tabbar" aria-label={t('nav.aria')}>
      {tabs.map(({ to, label, Icon, end, badge }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `tabbar-item${isActive ? ' active' : ''}`}>
          <Icon />
          {label}
          {badge > 0 && <span className="tabbar-badge">{badge > 9 ? '9+' : badge}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
