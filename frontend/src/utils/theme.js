// Minimal theme controller: no context/provider needed since there's only
// one piece of state and one consumer (the Profile toggle), and the actual
// switching happens via a DOM attribute CSS already keys off (tokens.css).
const STORAGE_KEY = 'suxona_theme';

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY); // 'light' | 'dark' | null (system)
  } catch {
    return null;
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark' || theme === 'light') {
    root.setAttribute('data-theme', theme);
  } else {
    root.removeAttribute('data-theme');
  }
}

export function setTheme(theme) {
  try {
    if (theme) localStorage.setItem(STORAGE_KEY, theme);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable (private mode, etc.) — theme just won't persist.
  }
  applyTheme(theme);
}

export function getSystemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

// Call once on app start so a stored preference applies before first paint-ish.
export function initTheme() {
  applyTheme(getStoredTheme());
}
