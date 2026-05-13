import { type SelectHTMLAttributes, useId } from 'react';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
}

export function Select({ options, label, error, placeholder, id, className, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <div className={`select-field ${className ?? ''}`}>
      {label && <label htmlFor={selectId} className="select-field__label">{label}</label>}
      <select
        id={selectId}
        className={`select-field__select ${error ? 'select-field__select--error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <span id={`${selectId}-error`} className="select-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
