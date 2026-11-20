import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { SearchIcon, BellIcon, PinIcon } from './Icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { useI18n } from '../i18n';
import { addressApi, productApi } from '../api/endpoints';
import logo from '../assets/logo.png';

const RECENT_KEY = 'suxona_recent_searches';

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
}
function saveRecent(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6))); } catch { /* ignore */ }
}

export default function Header() {
  const { user } = useAuth();
  const { unread } = useNotifications();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState(loadRecent);
  const [defaultVillageName, setDefaultVillageName] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    addressApi
      .list()
      .then(({ data }) => {
        if (cancelled) return;
        const list = data?.results || data || [];
        const def = list.find((a) => a.is_default) || list[0];
        setDefaultVillageName(def ? `Manzil #${def.id}` : null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  // Debounced live suggestions (product names only).
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return undefined;
    let cancelled = false;
    const timer = setTimeout(() => {
      productApi.list({ search: q })
        .then(({ data }) => { if (!cancelled) setSuggestions((data.results || []).slice(0, 5).map((p) => p.name)); })
        .catch(() => {});
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  useEffect(() => {
    const close = (e) => { if (!boxRef.current?.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (text) => {
    const q = text.trim();
    setFocused(false);
    if (q) {
      const next = [q, ...recent.filter((r) => r !== q)];
      setRecent(next);
      saveRecent(next);
    }
    navigate(q ? `/mahsulotlar?search=${encodeURIComponent(q)}` : '/mahsulotlar');
  };

  const shown = query.trim().length >= 2 ? suggestions : [];
  const showRecent = focused && query.trim().length < 2 && recent.length > 0;

  return (
    <header className="app-header">
      <div className="container app-header-top">
        <Link to="/" className="app-logo">
          <img src={logo} alt="" className="app-logo-mark" />
          <span>Suxona<span className="app-logo-accent">Shop</span></span>
        </Link>

        <Link to="/profil/manzillar" className="app-location">
          <PinIcon width={15} height={15} />
          <span>{(user && defaultVillageName) || t('header.noAddress')}</span>
        </Link>

        <button
          type="button"
          className="app-header-bell"
          aria-label={t('header.notifications')}
          onClick={() => navigate(user ? '/bildirishnomalar' : '/kirish')}
        >
          <BellIcon width={20} height={20} />
          {unread > 0 && <span className="bell-dot">{unread > 9 ? '9+' : unread}</span>}
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); go(query); }} className="container app-search" ref={boxRef}>
        <SearchIcon width={18} height={18} className="app-search-icon" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={t('header.search')}
          aria-label={t('header.search')}
          autoComplete="off"
        />
        {focused && (shown.length > 0 || showRecent) && (
          <div className="suggest">
            {showRecent && (
              <div className="suggest-head">
                <span>{t('header.recent')}</span>
                <button type="button" onClick={() => { setRecent([]); saveRecent([]); }}>{t('header.clearRecent')}</button>
              </div>
            )}
            {(showRecent ? recent : shown).map((s) => (
              <button key={s} type="button" className="suggest-item" onClick={() => { setQuery(s); go(s); }}>{s}</button>
            ))}
          </div>
        )}
      </form>
    </header>
  );
}
