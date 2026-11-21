import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import logo from '../../assets/logo.png';

// Two steps: ask for a code (sent to the linked Telegram), then set a new password.
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await authApi.passwordResetRequest(phone.trim());
      setInfo("Agar raqam topilsa, 6 xonali kod Telegram'ga yuborildi.");
      setStep(2);
    } catch (err) {
      setError(extractErrorMessage(err, "Kod yuborib bo'lmadi. Birozdan so'ng urinib ko'ring."));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await authApi.passwordResetConfirm({ phone: phone.trim(), code: code.trim(), new_password: password });
      navigate('/kirish', { replace: true, state: { notice: "Parol yangilandi. Endi kiring." } });
    } catch (err) {
      setError(extractErrorMessage(err, "Kod noto'g'ri yoki muddati tugagan."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page auth-page">
      <img src={logo} alt="SuxonaShop" className="app-logo-mark auth-mark" />
      <h1>Parolni tiklash</h1>
      <p style={{ marginBottom: 'var(--sp-5)' }}>
        Kod Telegram'ga ulangan hisobingizga yuboriladi.
      </p>
      {info && step === 2 && <div className="alert">{info}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {step === 1 ? (
        <form onSubmit={requestCode}>
          <div className="field">
            <label htmlFor="phone">Telefon raqam</label>
            <input id="phone" type="tel" placeholder="+998901234567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Yuborilmoqda...' : 'Kod yuborish'}
          </button>
        </form>
      ) : (
        <form onSubmit={confirm}>
          <div className="field">
            <label htmlFor="code">Telegram'dagi kod</label>
            <input id="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="newpw">Yangi parol (kamida 8 belgi)</label>
            <input id="newpw" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Saqlanmoqda...' : 'Parolni yangilash'}
          </button>
          <button type="button" className="btn btn-outline btn-block" style={{ marginTop: 8 }} onClick={() => setStep(1)}>
            Kodni qayta yuborish
          </button>
        </form>
      )}

      <p style={{ marginTop: 'var(--sp-5)', fontSize: 'var(--fs-sm)', textAlign: 'center' }}>
        <Link to="/kirish" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Kirish sahifasiga qaytish</Link>
      </p>
    </div>
  );
}
