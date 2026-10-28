import './QuantitySelector.css';

interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function QuantitySelector({ value, min, max, onChange, disabled = false }: Props) {
  return (
    <div className="qty-selector" role="group" aria-label="Cantitate">
      <button
        type="button"
        className="qty-btn"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Scade cantitatea"
      >
        −
      </button>
      <span className="qty-value" aria-live="polite">{value}</span>
      <button
        type="button"
        className="qty-btn"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Crește cantitatea"
      >
        +
      </button>
    </div>
  );
}
