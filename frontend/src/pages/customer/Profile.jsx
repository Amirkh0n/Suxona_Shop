import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PinIcon, ReceiptIcon, StoreIcon, ChevronRightIcon, LogoutIcon, SunIcon, MoonIcon } from '../../components/Icons';
import { getStoredTheme, getSystemPrefersDark, setTheme } from '../../utils/theme';

export default function Profile() {
  const { user, myStore, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const stored = getStoredTheme();
    return stored ? stored === 'dark' : getSystemPrefersDark();
  });

  if (!user) return null;

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    setIsDark(!isDark);
  };

  const menu = [
    { to: '/profil/manzillar', icon: PinIcon, label: 'Manzillarim' },
    { to: '/buyurtmalarim', icon: ReceiptIcon, label: 'Buyurtmalarim' },
    myStore
      ? { to: '/sotuvchi', icon: StoreIcon, label: "Do'konim (sotuvchi paneli)" }
      : { to: '/dokon-ochish', icon: StoreIcon, label: "Do'kon ochish" },
  ];

  return (
    <div className="container page">
      <h1>Profil</h1>

      <div className="card profile-card">
        <div className="profile-avatar">{user.first_name?.[0]?.toUpperCase() || 'U'}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>{user.first_name} {user.last_name}</div>
          <div style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--fs-sm)' }}>{user.phone}</div>
        </div>
      </div>

      <button type="button" className="card profile-menu-item" style={{ width: '100%', border: 'none', cursor: 'pointer' }} onClick={toggleTheme}>
        <span className="profile-menu-icon">{isDark ? <MoonIcon width={18} height={18} /> : <SunIcon width={18} height={18} />}</span>
        <span className="profile-menu-label">{isDark ? "Qorong'i rejim" : "Yorug' rejim"}</span>
        <span className={`theme-switch${isDark ? ' active' : ''}`} aria-hidden="true"><span className="theme-switch-knob" /></span>
      </button>

      {menu.map(({ to, icon: Icon, label }) => (
        <Link key={to} to={to} className="card profile-menu-item">
          <span className="profile-menu-icon"><Icon width={18} height={18} /></span>
          <span className="profile-menu-label">{label}</span>
          <ChevronRightIcon width={18} height={18} style={{ color: 'var(--color-ink-soft)' }} />
        </Link>
      ))}

      <button type="button" className="card profile-menu-item" style={{ width: '100%', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }} onClick={logout}>
        <span className="profile-menu-icon" style={{ color: 'var(--color-danger)' }}><LogoutIcon width={18} height={18} /></span>
        <span className="profile-menu-label" style={{ color: 'var(--color-danger)' }}>Chiqish</span>
      </button>
    </div>
  );
}
