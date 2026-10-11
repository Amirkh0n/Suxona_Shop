import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.phone, form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Telefon raqam yoki parol noto'g'ri."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page auth-page">
      <div className="app-logo-mark auth-mark">S</div>
      <h1>Xush kelibsiz</h1>
      <p style={{ marginBottom: 'var(--sp-5)' }}>Hisobingizga kiring va xaridni davom ettiring.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="phone">Telefon raqam</label>
          <input id="phone" name="phone" type="tel" placeholder="+998901234567" value={form.phone} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Parol</label>
          <input id="password" name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Kirilmoqda...' : 'Kirish'}
        </button>
      </form>

      <p style={{ marginTop: 'var(--sp-5)', fontSize: 'var(--fs-sm)', textAlign: 'center' }}>
        Hisobingiz yo'qmi? <Link to="/royxatdan-otish" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Ro'yxatdan o'ting</Link>
      </p>
    </div>
  );
}
