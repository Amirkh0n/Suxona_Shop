import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { formatSum, PRODUCT_STATUS_LABELS } from '../../utils/format';
import { resolveImageUrl } from '../../utils/media';
import { RowSkeleton } from '../../components/Skeleton';
import { PlusIcon } from '../../components/Icons';

const STATUS_CLASS = {
  ACTIVE: 'badge-accepted',
  DRAFT: 'badge-pending',
  PENDING_REVIEW: 'badge-pending',
  REJECTED: 'badge-cancelled',
  OUT_OF_STOCK: 'badge-cancelled',
  HIDDEN: 'badge-cancelled',
};

export default function SellerProducts() {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    productApi
      .myProducts({ page, search: debounced || undefined, status: status || undefined })
      .then(({ data }) => { if (!cancelled) setData(data); })
      .catch(() => { if (!cancelled) setData({ results: [], count: 0 }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, debounced, status, reload]);

  const products = data.results || [];
  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Bulk visibility: hide/show only touches products that are allowed to
  // change (the API rejects ACTIVE for products that were never approved).
  const bulk = async (target) => {
    setBusy(true); setError('');
    const results = await Promise.allSettled(selected.map((id) => productApi.update(id, { status: target })));
    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length) setError(`${failed.length} ta mahsulot o'zgarmadi: ${extractErrorMessage(failed[0].reason, 'xatolik')}`);
    setSelected([]);
    setBusy(false);
    setReload((n) => n + 1);
  };

  return (
    <div>
      <div className="section-heading">
        <h1 style={{ margin: 0 }}>Mahsulotlar</h1>
        <Link to="/sotuvchi/mahsulotlar/yangi" className="btn btn-primary btn-sm">
          <PlusIcon width={16} height={16} /> Qo'shish
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--sp-3)' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nomi bo'yicha qidirish" aria-label="Qidirish" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Holat">
          <option value="">Barchasi</option>
          {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {selected.length > 0 && (
        <div className="card" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
          <span style={{ flex: 1 }}>{selected.length} ta tanlandi</span>
          <button type="button" className="btn btn-sm btn-outline" disabled={busy} onClick={() => bulk('HIDDEN')}>Yashirish</button>
          <button type="button" className="btn btn-sm btn-primary" disabled={busy} onClick={() => bulk('ACTIVE')}>Ko'rsatish</button>
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <RowSkeleton count={5} />
      ) : products.length === 0 ? (
        <div className="empty-state card">
          <h3>{debounced || status ? 'Mahsulot topilmadi' : "Hali mahsulot yo'q"}</h3>
          {!debounced && !status && (
            <>
              <p>Birinchi mahsulotingizni qo'shing.</p>
              <Link to="/sotuvchi/mahsulotlar/yangi" className="btn btn-primary">Mahsulot qo'shish</Link>
            </>
          )}
        </div>
      ) : (
        <>
          {products.map((p) => (
            <div key={p.id} className="card seller-product-row" style={{ alignItems: 'center' }}>
              <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} aria-label={`${p.name} ni tanlash`} style={{ marginRight: 8, width: 18, height: 18 }} />
              <Link to={`/sotuvchi/mahsulotlar/${p.id}`} style={{ display: 'contents' }}>
                <div className="seller-product-thumb">
                  {p.primary_image?.image && <img src={resolveImageUrl(p.primary_image.image)} alt="" />}
                </div>
                <div className="seller-product-info">
                  <div className="seller-product-name">{p.name}</div>
                  <div className="seller-product-meta">{formatSum(p.price)} · {p.stock != null ? `${p.stock} dona` : 'cheksiz'}</div>
                </div>
                <span className={`badge ${STATUS_CLASS[p.status] || ''}`}>{PRODUCT_STATUS_LABELS[p.status] || p.status}</span>
              </Link>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-3)', marginTop: 'var(--sp-5)' }}>
            <button className="btn btn-outline btn-sm" disabled={!data.previous} onClick={() => setPage((n) => n - 1)}>Oldingi</button>
            <span style={{ alignSelf: 'center' }} className="muted">{page}-sahifa · {data.count} ta</span>
            <button className="btn btn-outline btn-sm" disabled={!data.next} onClick={() => setPage((n) => n + 1)}>Keyingi</button>
          </div>
        </>
      )}
    </div>
  );
}
