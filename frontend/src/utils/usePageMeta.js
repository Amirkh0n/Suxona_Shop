import { useEffect } from 'react';

const BASE = 'SuxonaShop';

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Sets the tab title and description/Open Graph tags for the current page. */
export default function usePageMeta({ title, description, image } = {}) {
  useEffect(() => {
    const previous = document.title;
    if (title) document.title = `${title} · ${BASE}`;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    return () => { document.title = previous; };
  }, [title, description, image]);
}
