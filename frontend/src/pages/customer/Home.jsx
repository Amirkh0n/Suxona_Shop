import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bannerApi, productApi, storeApi } from '../../api/endpoints';
import { fetchAllCategories, buildCategoryTree } from '../../utils/categoryTree';
import ProductCard from '../../components/ProductCard';
import StoreCard from '../../components/StoreCard';
import { ProductGridSkeleton, RowSkeleton } from '../../components/Skeleton';
import { resolveImageUrl } from '../../utils/media';
import { useI18n } from '../../i18n';
import { GridIcon } from '../../components/Icons';

const CHIP_TONES = ['chip-tone-a', 'chip-tone-b', 'chip-tone-c', 'chip-tone-d', 'chip-tone-e'];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState(null);
  const [stores, setStores] = useState([]);
  const [nearMe, setNearMe] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [coords, setCoords] = useState(null);
  const [products, setProducts] = useState([]);
  const [sale, setSale] = useState([]);
  const [loading, setLoading] = useState(true);

  // "Menga yaqin" / "Hozir ochiq": re-query stores with the user's position.
  const toggleNearMe = () => {
    if (nearMe) { setNearMe(false); setCoords(null); return; }
    if (!navigator.geolocation) { setGeoError("Brauzer joylashuvni qo'llamaydi."); return; }
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setNearMe(true); },
      () => setGeoError("Joylashuvga ruxsat berilmadi."),
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!nearMe && !openNow) return undefined;
    let cancelled = false;
    storeApi
      .list({ page: 1, ...(coords ? { lat: coords.lat, lng: coords.lng } : {}), ...(openNow ? { open_now: true } : {}) })
      .then(({ data }) => { if (!cancelled) setStores((data?.results || []).slice(0, 6)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [nearMe, openNow, coords]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [bannersRes, allCategories, storesRes, productsRes, saleRes] = await Promise.all([
        bannerApi.list().catch(() => ({ data: [] })),
        fetchAllCategories().catch(() => []),
        storeApi.list({ page: 1 }).catch(() => ({ data: { results: [] } })),
        productApi.list({ page: 1 }).catch(() => ({ data: { results: [] } })),
        productApi.list({ on_sale: true }).catch(() => ({ data: { results: [] } })),
      ]);
      if (cancelled) return;
      const tree = buildCategoryTree(allCategories);
      setCategoryTree(tree);
      setBanners(bannersRes.data || []);
      setCategories(tree.roots.slice(0, 10));
      setStores((storesRes.data?.results || []).slice(0, 6));
      setSale((saleRes.data?.results || []).slice(0, 8));
      setProducts((productsRes.data?.results || []).slice(0, 8));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // A top-level category shown here may have sub-categories (the home grid
  // only ever shows the parents), so this follows the same "category + all
  // its descendants" rule as the catalog tree page rather than only ever
  // linking to the parent's own (possibly empty) direct products.
  const openCategory = (cat) => {
    if (categoryTree?.hasChildren(cat.id)) {
      const ids = categoryTree.descendantIds(cat.id);
      navigate(`/mahsulotlar?categories=${ids.join(',')}`, { state: { categoryName: cat.name } });
    } else {
      navigate(`/mahsulotlar?category=${cat.id}`, { state: { categoryName: cat.name } });
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <div className="skeleton" style={{ aspectRatio: '16/7', borderRadius: 'var(--radius-md)', marginBottom: 'var(--sp-7)' }} />
        <RowSkeleton count={3} />
        <div style={{ marginTop: 'var(--sp-7)' }}>
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      {banners.length > 0 && (
        <div className="home-banner-scroll">
          {banners.map((b) => (
            <a key={b.id} href={b.url || '#'} className="card home-banner">
              <img src={resolveImageUrl(b.image)} alt={b.title} />
              <div className="home-banner-overlay">
                <div className="home-banner-title">{b.title}</div>
                <span className="btn btn-primary btn-sm">Ko'rish</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <section style={{ marginTop: 'var(--sp-6)' }}>
          <div className="category-chip-grid">
            {categories.map((cat, i) => (
              <button key={cat.id} type="button" onClick={() => openCategory(cat)} className="category-chip">
                <span className={`category-chip-icon ${CHIP_TONES[i % CHIP_TONES.length]}`}>
                  {cat.icon ? <img src={resolveImageUrl(cat.icon)} alt="" /> : <GridIcon width={20} height={20} />}
                </span>
                <span className="category-chip-label">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {sale.length > 0 && (
        <section style={{ marginTop: 'var(--sp-7)' }}>
          <div className="section-heading">
            <h2>{t('home.sale')}</h2>
            <Link to="/mahsulotlar?on_sale=true" className="section-heading-link">{t('home.all')}</Link>
          </div>
          <div className="grid grid-products">
            {sale.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section style={{ marginTop: 'var(--sp-7)' }}>
        <div className="section-heading">
          <h2>{t('home.stores')}</h2>
          <Link to="/mahsulotlar" className="section-heading-link">{t('home.all')}</Link>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <button type="button" className={`btn btn-sm ${nearMe ? 'btn-primary' : 'btn-outline'}`} onClick={toggleNearMe}>📍 Menga yaqin</button>
          <button type="button" className={`btn btn-sm ${openNow ? 'btn-primary' : 'btn-outline'}`} onClick={() => setOpenNow((v) => !v)}>🟢 Hozir ochiq</button>
        </div>
        {geoError && <div className="alert alert-error">{geoError}</div>}
        {stores.length === 0 ? (
          <div className="empty-state card"><h3>Hozircha do'konlar yo'q</h3></div>
        ) : (
          <div className="grid grid-stores">
            {stores.map((store) => <StoreCard key={store.id} store={store} />)}
          </div>
        )}
      </section>

      <section style={{ marginTop: 'var(--sp-7)' }}>
        <div className="section-heading">
          <h2>{t('home.new')}</h2>
          <Link to="/mahsulotlar" className="section-heading-link">{t('home.all')}</Link>
        </div>
        {products.length === 0 ? (
          <div className="empty-state card"><h3>Hozircha mahsulot yo'q</h3></div>
        ) : (
          <div className="grid grid-products">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
