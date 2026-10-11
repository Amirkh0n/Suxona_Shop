import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Design-system-consistent replacement for window.confirm(): a centered card
// over a dim backdrop, pill buttons, Escape-to-cancel. window.confirm() uses
// the browser's own native dialog, which looks nothing like the rest of the
// app (no rounded corners, no brand color, different font) and breaks the
// "native app shell" illusion the whole UI is built around.
export default function ConfirmDialog({
  open,
  title = "Tasdiqlaysizmi?",
  message,
  confirmLabel = 'Ha',
  cancelLabel = 'Bekor qilish',
  danger = true,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="confirm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="confirm-dialog card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title" className="confirm-title">{title}</h3>
        {message && <p className="confirm-message">{message}</p>}
        <div className="confirm-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
