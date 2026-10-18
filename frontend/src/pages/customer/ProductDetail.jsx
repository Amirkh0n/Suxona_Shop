import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { usePreviewNotice } from '../../context/PreviewNoticeContext';
import { formatSum, PRODUCT_STATUS_LABELS } from '../../utils/format';
import { availableStock, variantLabel } from '../../utils/variants';
import { resolveImageUrl } from '../../utils/media';
import { PageSpinner } from '../../components/Spinner';
import QuantityStepper from '../../components/QuantityStepper';
import { BackIcon, HeartIcon, ShareIcon, StarIcon, ChevronRightIcon } from '../../components/Icons';

export default function ProductDetail() {
  const { productId } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { notify } = usePreviewNotice();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productApi.retrieve(productId)
      .then(({ data }) => {
        if (cancelled) return;
        setProduct(data);
        // Preselect the first variant that can actually be bought.
        const buyable = (data.variants || []).filter((v) => v.is_active);
        const first = buyable.find((v) => v.stock == null || v.stock > 0) || buyable[0];
        setVariantId(first ? first.id : null);
        setQuantity(1);
      })
      .catch(() => { if (!cancelled) setProduct(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId]);

  if (loading) return <PageSpinner />;

  if (!product) {
    return (
      <div className="container page">
        <div className="empty-state card">
          <h3>Mahsulot topilmadi</h3>
          <Link to="/mahsulotlar" className="btn btn-outline">Mahsulotlarga qaytish</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const variants = (product.variants || []).filter((v) => v.is_active);
  const hasVariants = variants.length > 0;
  const variant = hasVariants ? variants.find((v) => v.id === variantId) || null : null;
  const stock = availableStock(product, variant);
  const displayPrice = variant ? variant.effective_price : product.price;
  const outOfStock =
    product.status === 'OUT_OF_STOCK' ||
    (hasVariants ? !variant || variant.stock === 0 : product.stock === 0);
  const favorite = isFavorite(product.id);

  const showPrev = () => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  const showNext = () => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));

  const onTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) showNext(); else showPrev();
    }
    setTouchStartX(null);
  };

  const handleAddToCart = async () => {
    setError('');
    if (hasVariants && !variant) { setError('Iltimos, variantni tanlang.'); return; }
    if (!user) { navigate('/kirish', { state: { from: { pathname: `/mahsulot/${productId}` } } }); return; }
    setAdding(true);
    try {
      await addItem(product.id, quantity, variant?.id ?? null);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setError(extractErrorMessage(err, "Savatga qo'shishda xatolik yuz berdi."));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-detail">
      <div className="product-detail-media" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {images.length > 0 ? (
          <img src={resolveImageUrl(images[activeImage]?.image)} alt={product.name} />
        ) : (
          <div className="product-detail-media-placeholder">{product.name?.[0]?.toUpperCase()}</div>
        )}
        <div className="product-detail-topbar container">
          <button type="button" className="media-icon-btn" onClick={() => navigate(-1)} aria-label="Orqaga">
            <BackIcon width={20} height={20} />
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button type="button" className="media-icon-btn" onClick={() => toggleFavorite(product.id)} aria-label="Sevimli">
              <HeartIcon filled={favorite} width={19} height={19} style={{ color: favorite ? 'var(--color-danger)' : undefined }} />
            </button>
            <button type="button" className="media-icon-btn" onClick={() => notify("Ulashish havolasi tez orada qo'shiladi.")} aria-label="Ulashish">
              <ShareIcon width={19} height={19} />
            </button>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button type="button" className="media-nav-btn media-nav-prev" onClick={showPrev} aria-label="Oldingi rasm">
              <ChevronRightIcon width={20} height={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button type="button" className="media-nav-btn media-nav-next" onClick={showNext} aria-label="Keyingi rasm">
              <ChevronRightIcon width={20} height={20} />
            </button>
            <div className="product-detail-dots">
              {images.map((img, idx) => (
                <button key={img.id} className="product-detail-dot-hit" onClick={() => setActiveImage(idx)} aria-label={`Rasm ${idx + 1}`}>
                  <span className={`product-detail-dot${idx === activeImage ? ' active' : ''}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="product-detail-sheet container">
        <div className="product-detail-name">{product.name}</div>
        <div className="product-detail-price">{formatSum(displayPrice)}</div>

        <div className="product-detail-store-row">
          {product.store && (
            <Link to={`/dokon/${product.store.id}`} className="product-detail-store-link">
              <span className="product-detail-store-badge">{product.store.name?.[0]}</span>
              <span>{product.store.name}</span>
            </Link>
          )}
          <span className="product-detail-rating" title="Bu mahsulot uchun hali sharhlar yo'q">
            <StarIcon width={14} height={14} />
            Reyting yo'q
          </span>
        </div>

        {outOfStock ? (
          <span className="badge badge-cancelled" style={{ marginBottom: 'var(--sp-4)' }}>{PRODUCT_STATUS_LABELS.OUT_OF_STOCK}</span>
        ) : stock != null && (
          <p style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-4)' }}>Omborda: {stock} dona</p>
        )}

        {hasVariants && (
          <div className="variant-block">
            <div className="variant-label">Variant</div>
            <div className="variant-pills">
              {variants.map((v) => {
                const soldOut = v.stock === 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={`variant-pill${variantId === v.id ? ' active' : ''}`}
                    style={soldOut ? { opacity: 0.5, textDecoration: 'line-through' } : undefined}
                    onClick={() => { setVariantId(v.id); setQuantity(1); }}
                    title={soldOut ? 'Tugagan' : formatSum(v.effective_price)}
                  >
                    {variantLabel(v)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {product.description && (
          <div style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="variant-label" style={{ marginBottom: 'var(--sp-2)' }}>Tavsif</div>
            <p style={{ color: 'var(--color-ink)' }}>{product.description}</p>
          </div>
        )}
      </div>

      {error && <div className="container"><div className="alert alert-error">{error}</div></div>}

      {!outOfStock && (
        <div className="product-detail-cta">
          <div className="container product-detail-cta-row">
            <QuantityStepper value={quantity} onChange={(q) => setQuantity(stock != null ? Math.min(q, stock) : q)} />
            <button className="btn btn-primary product-detail-cta-btn" onClick={handleAddToCart} disabled={adding}>
              {adding ? "Qo'shilmoqda..." : added ? "Qo'shildi ✓" : "Savatga qo'shish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
