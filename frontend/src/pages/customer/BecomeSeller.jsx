import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeApplicationApi } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';

export default function BecomeSeller() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ store_name: '', phone: user?.phone || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await storeApplicationApi.apply(form);
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Ariza yuborishda xatolik yuz berdi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Do'kon ochish" onBack={() => navigate(-1)} />

      <div className="container page" style={{ maxWidth: 460 }}>
        {result ? (
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <p style={{ margin: 0 }}>
              <strong>{result.store_name}</strong> nomi bilan do'kon ochish arizangiz qabul qilindi.
            </p>
            <span className="badge badge-pending" style={{ marginTop: 'var(--sp-2)', display: 'inline-flex' }}>Ko'rib chiqilmoqda</span>
            <p style={{ marginTop: 'var(--sp-4)' }}>
              Administrator arizani tasdiqlagach, sotuvchi panelidan foydalanishni boshlaysiz.
            </p>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/profil')}>Profilga qaytish</button>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: 'var(--sp-5)' }}>
              Do'koningizni SuxonaShopda ochish uchun ariza qoldiring. Administrator ko'rib chiqib, tasdiqlaydi.
            </p>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="store_name">Do'kon nomi</label>
                <input id="store_name" name="store_name" value={form.store_name} onChange={onChange} required />
              </div>
              <div className="field">
                <label htmlFor="phone">Aloqa uchun telefon</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} required />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Yuborilmoqda...' : 'Ariza yuborish'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
