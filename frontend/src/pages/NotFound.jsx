import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container page" style={{ textAlign: 'center', paddingTop: 'var(--sp-8)' }}>
      <h1 style={{ fontSize: 'var(--fs-3xl)' }}>404</h1>
      <p>Siz izlagan sahifa topilmadi.</p>
      <Link to="/" className="btn btn-primary">Bosh sahifaga qaytish</Link>
    </div>
  );
}
