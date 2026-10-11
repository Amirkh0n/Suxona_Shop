import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/endpoints';
import { formatSum, PRODUCT_STATUS_LABELS } from '../../utils/format';
import { resolveImageUrl } from '../../utils/media';
import { RowSkeleton } from '../../components/Skeleton';
import { PlusIcon } from '../../components/Icons';

const STATUS_CLASS = {
  ACTIVE: 'badge-accepted',
  DRAFT: 'badge-pending',
  OUT_OF_STOCK: 'badge-cancelled',
  HIDDEN: 'badge-cancelled',
};

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.myProducts({ page: 1 }).then(({ data }) => setProducts(data?.results || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="section-heading">
        <h1 style={{ margin: 0 }}>Mahsulotlar</h1>
        <Link to="/sotuvchi/mahsulotlar/yangi" className="btn btn-primary btn-sm">
          <PlusIcon width={16} height={16} /> Qo'shish
        </Link>
      </div>

      {loading ? (
        <RowSkeleton count={5} />
      ) : products.length === 0 ? (
        <div className="empty-state card">
          <h3>Hali mahsulot yo'q</h3>
          <p>Birinchi mahsulotingizni qo'shing.</p>
          <Link to="/sotuvchi/mahsulotlar/yangi" className="btn btn-primary">Mahsulot qo'shish</Link>
        </div>
      ) : (
        products.map((p) => (
          <Link key={p.id} to={`/sotuvchi/mahsulotlar/${p.id}`} className="card seller-product-row">
            <div className="seller-product-thumb">
              {p.primary_image?.image && <img src={resolveImageUrl(p.primary_image.image)} alt="" />}
            </div>
            <div className="seller-product-info">
              <div className="seller-product-name">{p.name}</div>
              <div className="seller-product-meta">{formatSum(p.price)} · {p.stock != null ? `${p.stock} dona` : 'cheksiz'}</div>
            </div>
            <span className={`badge ${STATUS_CLASS[p.status] || ''}`}>{PRODUCT_STATUS_LABELS[p.status] || p.status}</span>
          </Link>
        ))
      )}
    </div>
  );
}
