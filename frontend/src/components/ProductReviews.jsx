import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Stars = ({ value }) => (
  <span style={{ color: '#f5a623', letterSpacing: 1 }}>
    {'★'.repeat(value)}<span style={{ color: '#c9cfca' }}>{'★'.repeat(5 - value)}</span>
  </span>
);

export default function ProductReviews({ productId, onChanged }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const load = () => productApi.reviews(productId).then(({ data }) => setItems(data.results || [])).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [productId]);

  const submit = async () => {
    setError(''); setBusy(true);
    try {
      await productApi.addReview(productId, { rating: stars, comment });
      setOpen(false); setStars(0); setComment('');
      await load();
      onChanged?.();
    } catch (err) {
      setError(extractErrorMessage(err, 'Sharh yuborilmadi.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginBottom: 'var(--sp-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="variant-label">Sharhlar</div>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => (user ? setOpen((v) => !v) : navigate('/kirish'))}>
          Sharh yozish
        </button>
      </div>

      {open && (
        <div className="card" style={{ marginTop: 'var(--sp-3)' }}>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" className={n <= stars ? 'on' : ''} onClick={() => setStars(n)} aria-label={`${n} yulduz`}>★</button>
            ))}
          </div>
          <div className="field" style={{ marginTop: 'var(--sp-3)', marginBottom: 0 }}>
            <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Fikringiz (ixtiyoriy)" />
          </div>
          {error && <div className="alert alert-error" style={{ marginTop: 'var(--sp-3)' }}>{error}</div>}
          <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 'var(--sp-3)' }} disabled={busy || !stars} onClick={submit}>Yuborish</button>
          <p className="muted" style={{ fontSize: 12, margin: '8px 0 0' }}>Faqat shu mahsulotni sotib olganlar sharh qoldira oladi.</p>
        </div>
      )}

      {items.length === 0 ? (
        <p className="muted" style={{ marginTop: 'var(--sp-3)' }}>Hali sharhlar yo'q.</p>
      ) : (
        items.map((r) => (
          <div key={r.id} className="review-list-item">
            <strong>{r.customer_name}</strong> <Stars value={r.rating} />
            {r.comment && <p style={{ margin: '4px 0 0' }}>{r.comment}</p>}
          </div>
        ))
      )}
    </div>
  );
}
