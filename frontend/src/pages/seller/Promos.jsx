import { useEffect, useState } from 'react';
import { sellerPromoApi } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { RowSkeleton } from '../../components/Skeleton';

const EMPTY = { code: '', kind: 'PERCENT', value: '', min_order_amount: '', max_uses: '', valid_until: '' };

const clean = (f) => {
  const body = { code: f.code.trim(), kind: f.kind, value: f.value };
  if (f.min_order_amount) body.min_order_amount = f.min_order_amount;
  if (f.max_uses) body.max_uses = Number(f.max_uses);
  if (f.valid_until) body.valid_until = new Date(f.valid_until).toISOString();
  return body;
};

export default function SellerPromos() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    sellerPromoApi.list().then(({ data }) => setRows(data || [])).catch(() => setRows([])).finally(() => setLoading(false));
  }, [reload]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await sellerPromoApi.create(clean(form));
      setForm(EMPTY);
      setReload((n) => n + 1);
    } catch (err) {
      setError(extractErrorMessage(err, "Promokodni saqlab bo'lmadi."));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (p) => { await sellerPromoApi.update(p.id, { is_active: !p.is_active }); setReload((n) => n + 1); };
  const remove = async (p) => { await sellerPromoApi.remove(p.id); setReload((n) => n + 1); };

  return (
    <div>
      <h1>Promokodlar</h1>
      <p className="muted">Faqat sizning do'koningiz buyurtmalarida ishlaydi.</p>

      <form className="card" onSubmit={create} style={{ marginBottom: 'var(--sp-4)' }}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field"><label htmlFor="pc">Kod</label><input id="pc" value={form.code} onChange={set('code')} placeholder="YOZ10" required /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="pk">Turi</label>
            <select id="pk" value={form.kind} onChange={set('kind')}>
              <option value="PERCENT">Foiz (%)</option>
              <option value="FIXED">Summa (so'm)</option>
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}><label htmlFor="pv">Qiymat</label><input id="pv" type="number" min="1" value={form.value} onChange={set('value')} required /></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field" style={{ flex: 1 }}><label htmlFor="pm">Minimal buyurtma (ixtiyoriy)</label><input id="pm" type="number" min="0" value={form.min_order_amount} onChange={set('min_order_amount')} /></div>
          <div className="field" style={{ flex: 1 }}><label htmlFor="pu">Necha marta (ixtiyoriy)</label><input id="pu" type="number" min="1" value={form.max_uses} onChange={set('max_uses')} /></div>
        </div>
        <div className="field"><label htmlFor="pd">Amal qilish muddati (ixtiyoriy)</label><input id="pd" type="date" value={form.valid_until} onChange={set('valid_until')} /></div>
        <button className="btn btn-primary btn-block" disabled={busy}>Yaratish</button>
      </form>

      {loading ? <RowSkeleton count={3} /> : rows.map((p) => (
        <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: p.is_active ? 1 : 0.55 }}>
          <div style={{ flex: 1 }}>
            <strong>{p.code}</strong>
            <div className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
              {p.kind === 'PERCENT' ? `${Number(p.value)}%` : `${Number(p.value).toLocaleString('ru-RU')} so'm`} · ishlatildi: {p.used_count}{p.max_uses ? `/${p.max_uses}` : ''}
            </div>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => toggle(p)}>{p.is_active ? "O'chirish" : 'Yoqish'}</button>
          <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => remove(p)}>🗑</button>
        </div>
      ))}
    </div>
  );
}
