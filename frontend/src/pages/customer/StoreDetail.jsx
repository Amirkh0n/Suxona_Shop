import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { categoryApi, productApi, storeApi } from '../../api/endpoints';
import ProductCard from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/Skeleton';
import { resolveImageUrl } from '../../utils/media';
import { BackIcon, StarIcon, TelegramIcon } from '../../components/Icons';

export default function StoreDetail() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    Promise.all([
      storeApi.retrieve(storeId),
      productApi.list({ store: storeId }),
      categoryApi.list().catch(() => ({ data: { results: [] } })),
    ])
      .then(([storeRes, productsRes, categoriesRes]) => {
        if (cancelled) return;
        setStore(storeRes.data);
        setProducts(productsRes.data?.results || []);
        const names = {};
        (categoriesRes.data?.results || []).forEach((c) => { names[c.id] = c.name; });
        setCategoryNames(names);
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [storeId]);

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => { if (p.category_id) map.set(p.category_id, p.category_id); });
    return [...map.keys()];
  }, [products]);

  const filteredProducts = activeCategory ? products.filter((p) => p.category_id === activeCategory) : products;

  if (loading) {
    return (
      <div className="store-detail">
        <div className="skeleton store-detail-banner" />
        <div className="container store-detail-head">
          <div className="skeleton store-detail-avatar" />
          <div className="skeleton skeleton-line w-40" style={{ height: 20, margin: '8px 0' }} />
          <div className="skeleton skeleton-line w-70" style={{ height: 14 }} />
        </div>
        <div className="container" style={{ marginTop: 'var(--sp-6)' }}>
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="container page">
        <div className="empty-state card">
          <h3>Do'kon topilmadi</h3>
          <Link to="/mahsulotlar" className="btn btn-outline">Mahsulotlarga qaytish</Link>
        </div>
      </div>
    );
  }

  const telegramHref = store.telegram_username ? `https://t.me/${store.telegram_username.replace(/^@/, '')}` : null;

  return (
    <div className="store-detail">
      <div className="store-detail-banner">
        {store.banner && <img src={resolveImageUrl(store.banner)} alt="" />}
        <button type="button" className="media-icon-btn store-detail-back" onClick={() => navigate(-1)} aria-label="Orqaga">
          <BackIcon width={20} height={20} />
        </button>
      </div>

      <div className="container store-detail-head">
        <div className="store-detail-avatar">
          {store.logo ? <img src={resolveImageUrl(store.logo)} alt={store.name} /> : store.name?.[0]}
        </div>
        <h1 style={{ marginBottom: 2 }}>{store.name}</h1>
        <div className="store-detail-meta">
          <span className="product-detail-rating" title="Bu do'kon uchun hali sharhlar yo'q">
            <StarIcon width={14} height={14} /> Reyting yo'q
          </span>
          {store.phone && <span>· {store.phone}</span>}
        </div>
        {store.description && <p style={{ marginTop: 'var(--sp-3)' }}>{store.description}</p>}

        {telegramHref && (
          <a href={telegramHref} target="_blank" rel="noreferrer" className="btn btn-primary btn-block" style={{ marginTop: 'var(--sp-4)' }}>
            <TelegramIcon width={17} height={17} /> Do'konga yozish
          </a>
        )}
      </div>

      <div className="container" style={{ marginTop: 'var(--sp-6)' }}>
        {categories.length > 1 && (
          <div className="catalog-tabs">
            <button className={`catalog-tab${!activeCategory ? ' active' : ''}`} onClick={() => setActiveCategory('')}>Barchasi</button>
            {categories.map((id) => (
              <button key={id} className={`catalog-tab${activeCategory === id ? ' active' : ''}`} onClick={() => setActiveCategory(id)}>
                {categoryNames[id] || `Kategoriya #${id}`}
              </button>
            ))}
          </div>
        )}

        <h2 style={{ marginTop: 'var(--sp-5)' }}>Mahsulotlar</h2>
        {filteredProducts.length === 0 ? (
          <div className="empty-state card"><h3>Bu do'konda hali mahsulot yo'q</h3></div>
        ) : (
          <div className="grid grid-products">
            {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
