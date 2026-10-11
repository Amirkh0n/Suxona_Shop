// The API returns image fields as paths only (e.g. "/media/products/12.jpg"),
// not full URLs. Left alone, the browser resolves a relative <img src> against
// the page's own origin — the frontend's dev/production URL, not the
// backend's — so every image breaks unless the frontend happens to be
// served from the exact same host as the backend media files.
//
// VITE_IMAGE_BASE_URL fixes that by naming the host image paths should be
// resolved against. It defaults to VITE_API_BASE_URL (today images are
// served by the same Django/DRF host as the API), so most setups need no
// extra configuration. The moment images move to a CDN or object storage
// (Cloudflare R2, S3, etc.), this is the only line that needs to change —
// point VITE_IMAGE_BASE_URL at the bucket's public URL and every image in
// the app picks it up, with zero component changes.
const IMAGE_BASE_URL = (
  import.meta.env.VITE_IMAGE_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''
).replace(/\/+$/, '');

export function resolveImageUrl(path) {
  if (!path) return undefined;
  // Already absolute (http(s)://, protocol-relative //, data:, blob:) —
  // this is exactly what a CDN/R2 setup would return once the backend is
  // updated to emit full URLs, so it's passed through untouched.
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }
  return `${IMAGE_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
