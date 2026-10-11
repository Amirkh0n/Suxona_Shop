import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bannerApi, productApi, storeApi } from '../../api/endpoints';
import { fetchAllCategories, buildCategoryTree } from '../../utils/categoryTree';
import ProductCard from '../../components/ProductCard';
import StoreCard from '../../components/StoreCard';
import { ProductGridSkeleton, RowSkeleton } from '../../components/Skeleton';
import { resolveImageUrl } from '../../utils/media';
import { GridIcon } from '../../components/Icons';

const CHIP_TONES = ['chip-tone-a', 'chip-tone-b', 'chip-tone-c', 'chip-tone-d', 'chip-tone-e'];

export default function Home() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState(null);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [bannersRes, allCategories, storesRes, productsRes] = await Promise.all([
        bannerApi.list().catch(() => ({ data: [] })),
        fetchAllCategories().catch(() => []),
        storeApi.list({ page: 1 }).catch(() => ({ data: { results: [] } })),
        productApi.list({ page: 1 }).catch(() => ({ data: { results: [] } })),
      ]);
      if (cancelled) return;
      const tree = buildCategoryTree(allCategories);
      setCategoryTree(tree);
      setBanners(bannersRes.data || []);
      setCategories(tree.roots.slice(0, 10));
      setStores((storesRes.data?.results || []).slice(0, 6));
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

      <section style={{ marginTop: 'var(--sp-7)' }}>
        <div className="section-heading">
          <h2>Tavsiya etilgan do'konlar</h2>
          <Link to="/mahsulotlar" className="section-heading-link">Barchasi</Link>
        </div>
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
          <h2>Yangi mahsulotlar</h2>
          <Link to="/mahsulotlar" className="section-heading-link">Barchasi</Link>
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
