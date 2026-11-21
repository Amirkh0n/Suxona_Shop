import { useEffect, useState } from 'react';
import { sellerReviewApi } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { formatDate } from '../../utils/format';
import { RowSkeleton } from '../../components/Skeleton';

function ReviewCard({ review, onChanged }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(review.seller_reply || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true); setError('');
    try {
      await sellerReviewApi.reply(review.kind, review.id, text.trim());
      setOpen(false);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Javobni saqlab bo'lmadi."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try { await sellerReviewApi.removeReply(review.kind, review.id); onChanged(); } finally { setBusy(false); }
  };

  return (
    <div className="card review-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <strong>{review.title}</strong>
        <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{formatDate(review.created_at)}</span>
      </div>
      <div className="star-picker" aria-label={`${review.rating} yulduz`}>
        {[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ color: n <= review.rating ? '#f5a623' : '#c9cfca' }}>★</span>)}
      </div>
      <p style={{ margin: '4px 0' }}>{review.comment || <span className="muted">Izoh yo'q</span>}</p>
      <div className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{review.customer_name}</div>

      {review.seller_reply && !open && (
        <div style={{ marginTop: 8, padding: '8px 10px', borderLeft: '3px solid var(--color-primary)' }}>
          <div className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Sizning javobingiz</div>
          {review.seller_reply}
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {open ? (
        <div style={{ marginTop: 8 }}>
          <textarea rows={2} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Javobingiz..." />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy || !text.trim()} onClick={save}>Yuborish</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>Bekor</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>{review.seller_reply ? "Javobni o'zgartirish" : 'Javob yozish'}</button>
          {review.seller_reply && <button type="button" className="btn btn-danger-outline btn-sm" disabled={busy} onClick={remove}>O'chirish</button>}
        </div>
      )}
    </div>
  );
}

export default function SellerReviews() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    sellerReviewApi.list().then(({ data }) => setRows(data.results || [])).catch(() => setRows([])).finally(() => setLoading(false));
  }, [reload]);

  return (
    <div>
      <h1>Sharhlar</h1>
      <p className="muted">Mijozlarga javob bering — ular Telegram orqali xabar oladi.</p>
      {loading ? <RowSkeleton count={4} /> : rows.length === 0 ? (
        <div className="empty-state card"><h3>Hali sharh yo'q</h3></div>
      ) : rows.map((r) => <ReviewCard key={`${r.kind}-${r.id}`} review={r} onChanged={() => setReload((n) => n + 1)} />)}
    </div>
  );
}
