import './Badge.css';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: string;
}

export function Badge({ variant = 'info', children }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
