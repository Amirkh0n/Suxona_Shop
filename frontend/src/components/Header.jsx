import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SearchIcon, BellIcon, PinIcon } from './Icons';
import { useAuth } from '../context/AuthContext';
import { usePreviewNotice } from '../context/PreviewNoticeContext';
import { addressApi } from '../api/endpoints';
import logo from '../assets/logo.png';

export default function Header() {
  const { user } = useAuth();
  const { notify } = usePreviewNotice();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [defaultVillageName, setDefaultVillageName] = useState(null);

  useEffect(() => {
    if (!user) { setDefaultVillageName(null); return; }
    let cancelled = false;
    addressApi
      .list()
      .then(({ data }) => {
        if (cancelled) return;
        const list = data?.results || data || [];
        const def = list.find((a) => a.is_default) || list[0];
        // AddressList only gives a village *id*, not its name, so this stays
        // a short label rather than a resolved village name.
        setDefaultVillageName(def ? `Manzil #${def.id}` : null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/mahsulotlar?search=${encodeURIComponent(query.trim())}` : '/mahsulotlar');
  };

  return (
    <header className="app-header">
      <div className="container app-header-top">
        <Link to="/" className="app-logo">
          <img src={logo} alt="" className="app-logo-mark" />
          <span>Suxona<span className="app-logo-accent">Shop</span></span>
        </Link>

        <Link to="/profil/manzillar" className="app-location">
          <PinIcon width={15} height={15} />
          <span>{defaultVillageName || 'Manzil tanlanmagan'}</span>
        </Link>

        <button
          type="button"
          className="app-header-bell"
          aria-label="Bildirishnomalar"
          onClick={() => notify("Bildirishnomalar tez orada qo'shiladi.")}
        >
          <BellIcon width={20} height={20} />
        </button>
      </div>

      <form onSubmit={handleSearch} className="container app-search">
        <SearchIcon width={18} height={18} className="app-search-icon" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nima qidiryapsiz?"
          aria-label="Qidirish"
        />
      </form>
    </header>
  );
}
