import { NavLink } from 'react-router-dom';
import { HomeIcon, GridIcon, CartIcon, ReceiptIcon, UserIcon } from './Icons';
import { useCart } from '../context/CartContext';

export default function BottomTabBar() {
  const { itemCount } = useCart();

  const tabs = [
    { to: '/', label: 'Bosh sahifa', Icon: HomeIcon, end: true },
    { to: '/katalog', label: 'Katalog', Icon: GridIcon },
    { to: '/savat', label: 'Savat', Icon: CartIcon, badge: itemCount },
    { to: '/buyurtmalarim', label: 'Buyurtmalar', Icon: ReceiptIcon },
    { to: '/profil', label: 'Profil', Icon: UserIcon },
  ];

  return (
    <nav className="tabbar" aria-label="Asosiy navigatsiya">
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
