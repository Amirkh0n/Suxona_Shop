import { useEffect, useState } from 'react';
import { productApi } from '../api/endpoints';
import ProductCard from './ProductCard';

export default function SimilarProducts({ productId }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let cancelled = false;
    productApi.similar(productId)
      .then(({ data }) => { if (!cancelled) setItems(data || []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [productId]);
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 'var(--sp-6)' }}>
      <div className="variant-label" style={{ marginBottom: 'var(--sp-3)' }}>O'xshash mahsulotlar</div>
      <div className="grid grid-products">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
