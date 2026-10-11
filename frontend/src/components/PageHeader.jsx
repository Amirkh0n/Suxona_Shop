import { useNavigate } from 'react-router-dom';
import { BackIcon } from './Icons';

/**
 * Compact "back + title" bar used by secondary screens (checkout steps,
 * addresses, order detail...). `step` renders a small "2/3-qadam" label
 * under the title, matching the checkout flow in the mockup.
 */
export default function PageHeader({ title, step, onBack, right }) {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      <div className="container page-header-row">
        <button type="button" className="page-header-back" onClick={() => (onBack ? onBack() : navigate(-1))} aria-label="Orqaga">
          <BackIcon width={20} height={20} />
        </button>
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">{title}</h1>
          {step && <span className="page-header-step">{step}</span>}
        </div>
        <div className="page-header-right">{right}</div>
      </div>
    </header>
  );
}
