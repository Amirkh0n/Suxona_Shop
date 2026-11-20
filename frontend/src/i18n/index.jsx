import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import uz from './uz';
import ru from './ru';

const DICTS = { uz, ru };
const KEY = 'suxona_lang';
const I18nContext = createContext(null);

function initialLang() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored && DICTS[stored]) return stored;
  } catch { /* storage unavailable */ }
  return 'uz';
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((next) => {
    if (!DICTS[next]) return;
    setLangState(next);
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  }, []);

  // Missing Russian keys fall back to Uzbek, then to the key itself, so a
  // screen that is not translated yet still renders something sensible.
  const t = useCallback((key, vars) => {
    let text = DICTS[lang][key] ?? uz[key] ?? key;
    if (vars) Object.entries(vars).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
    return text;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
