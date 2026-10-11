export default function Spinner({ size = 26 }) {
  return (
    <div
      role="status"
      aria-label="Yuklanmoqda"
      style={{
        width: size,
        height: size,
        border: '3px solid var(--color-line)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="container page" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <Spinner />
    </div>
  );
}
