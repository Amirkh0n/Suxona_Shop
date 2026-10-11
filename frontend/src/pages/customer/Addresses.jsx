import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressApi, villageApi } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { PageSpinner } from '../../components/Spinner';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PinIcon } from '../../components/Icons';

const emptyForm = { village_id: '', street: '', house: '', landmark: '', is_default: false };

export default function Addresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const load = async () => {
    const [addrRes, villageRes] = await Promise.all([
      addressApi.list(),
      villageApi.list().catch(() => ({ data: { results: [] } })),
    ]);
    setAddresses(addrRes.data?.results || addrRes.data || []);
    setVillages(villageRes.data?.results || []);
  };

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const villageName = (villageId) => villages.find((v) => v.id === villageId)?.name || '';

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setFormOpen(true); setError(''); };
  const openEdit = (addr) => {
    setForm({ village_id: String(addr.village || ''), street: addr.street, house: addr.house, landmark: addr.landmark || '', is_default: addr.is_default });
    setEditingId(addr.id);
    setFormOpen(true);
    setError('');
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, village_id: Number(form.village_id) };
      if (editingId) await addressApi.update(editingId, payload);
      else await addressApi.create(payload);
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Manzilni saqlashda xatolik yuz berdi.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await addressApi.remove(id);
    await load();
  };

  const confirmRemove = async () => {
    const id = confirmId;
    setConfirmId(null);
    if (id) await remove(id);
  };

  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader
        title="Manzillarim"
        onBack={() => navigate(-1)}
        right={!formOpen && <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>+ Yangi</button>}
      />

      <div className="container page">
        {formOpen && (
          <form onSubmit={onSubmit} className="card" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="field">
              <label htmlFor="village_id">Qishloq / mahalla</label>
              <select id="village_id" name="village_id" value={form.village_id} onChange={onChange} required>
                <option value="">Tanlang</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}{v.district ? `, ${v.district}` : ''}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="street">Ko'cha</label>
              <input id="street" name="street" value={form.street} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="house">Uy raqami</label>
              <input id="house" name="house" value={form.house} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="landmark">Mo'ljal (ixtiyoriy)</label>
              <input id="landmark" name="landmark" value={form.landmark} onChange={onChange} placeholder="Masalan: ko'k darvoza, maktab yonida" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--sp-4)', fontSize: 'var(--fs-sm)' }}>
              <input type="checkbox" name="is_default" checked={form.is_default} onChange={onChange} />
              Asosiy manzil sifatida belgilash
            </label>
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>Bekor qilish</button>
            </div>
          </form>
        )}

        {addresses.length === 0 && !formOpen ? (
          <div className="empty-state card">
            <h3>Manzil qo'shilmagan</h3>
            <p>Buyurtma berish uchun kamida bitta manzil kerak.</p>
            <button className="btn btn-primary" onClick={openCreate}>Manzil qo'shish</button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="card address-card">
              <div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {addr.street}, {addr.house}
                  {addr.is_default && <span className="badge badge-accepted">Asosiy</span>}
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-ink-soft)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <PinIcon width={12} height={12} />
                  {villageName(addr.village)}{addr.landmark ? ` · ${addr.landmark}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexShrink: 0 }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(addr)}>Tahrirlash</button>
                <button className="btn btn-danger-outline btn-sm" onClick={() => setConfirmId(addr.id)}>O'chirish</button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={confirmId != null}
        title="Manzilni o'chirish"
        message="Bu manzilni o'chirishni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi."
        confirmLabel="O'chirish"
        onConfirm={confirmRemove}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
