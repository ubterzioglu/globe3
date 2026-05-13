import { type InputHTMLAttributes, useId } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={`input-field ${className ?? ''}`}>
      {label && <label htmlFor={inputId} className="input-field__label">{label}</label>}
      <input
        id={inputId}
        className={`input-field__input ${error ? 'input-field__input--error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <span id={`${inputId}-error`} className="input-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
