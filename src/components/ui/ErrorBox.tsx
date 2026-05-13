import './ErrorBox.css';

interface ErrorBoxProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <div className="error-box" role="alert">
      <p className="error-box__message">{message}</p>
      {onRetry && (
        <button className="error-box__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
