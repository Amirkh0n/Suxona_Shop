import { MinusIcon, PlusIcon } from './Icons';

export default function QuantityStepper({ value, onChange, min = 1, disabled = false, size = 'md' }) {
  return (
    <div className={`qty-stepper qty-stepper-${size}`}>
      <button type="button" disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label="Kamaytirish">
        <MinusIcon width={14} height={14} />
      </button>
      <span>{value}</span>
      <button type="button" disabled={disabled} onClick={() => onChange(value + 1)} aria-label="Ko'paytirish">
        <PlusIcon width={14} height={14} />
      </button>
    </div>
  );
}
