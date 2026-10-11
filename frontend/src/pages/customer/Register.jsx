import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { TelegramIcon, CheckCircleIcon } from '../../components/Icons';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ phone: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setResult(await register(form));
    } catch (err) {
      setError(extractErrorMessage(err, "Ro'yxatdan o'tishda xatolik yuz berdi."));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="container page auth-page" style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--color-primary)', margin: '0 auto var(--sp-4)', width: 64, height: 64 }}>
          <CheckCircleIcon width={64} height={64} />
        </div>
        <h1>Deyarli tayyor</h1>
        <p>Hisobingiz yaratildi. Uni faollashtirish uchun Telegram bot orqali tasdiqlang.</p>
        <a href={result.telegram_deeplink} target="_blank" rel="noreferrer" className="btn btn-primary btn-block" style={{ marginBottom: 'var(--sp-3)' }}>
          <TelegramIcon width={18} height={18} /> Telegramda tasdiqlash
        </a>
        <Link to="/kirish" className="btn btn-outline btn-block">Kirish sahifasiga o'tish</Link>
      </div>
    );
  }

  return (
    <div className="container page auth-page">
      <h1>Ro'yxatdan o'tish</h1>
      <p style={{ marginBottom: 'var(--sp-5)' }}>Bir necha daqiqada hisob oching.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          <div className="field">
            <label htmlFor="first_name">Ism</label>
            <input id="first_name" name="first_name" value={form.first_name} onChange={onChange} required />
          </div>
          <div className="field">
            <label htmlFor="last_name">Familiya</label>
            <input id="last_name" name="last_name" value={form.last_name} onChange={onChange} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="phone">Telefon raqam</label>
          <input id="phone" name="phone" type="tel" placeholder="+998901234567" value={form.phone} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Parol</label>
          <input id="password" name="password" type="password" minLength={8} value={form.password} onChange={onChange} required />
          <div className="field-hint">Kamida 8 ta belgi</div>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Yuborilmoqda...' : "Ro'yxatdan o'tish"}
        </button>
      </form>

      <p style={{ marginTop: 'var(--sp-5)', fontSize: 'var(--fs-sm)', textAlign: 'center' }}>
        Hisobingiz bormi? <Link to="/kirish" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Kirish</Link>
      </p>
    </div>
  );
}
