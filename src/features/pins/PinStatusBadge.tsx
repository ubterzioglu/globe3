import { Badge } from '@/components/ui/Badge';
import type { PinStatus } from './types';

const STATUS_MAP: Record<PinStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  pending: { label: 'Beklemede', variant: 'warning' },
  approved: { label: 'Onaylandı', variant: 'success' },
  rejected: { label: 'Reddedildi', variant: 'danger' },
};

interface PinStatusBadgeProps {
  status: PinStatus;
}

export function PinStatusBadge({ status }: PinStatusBadgeProps) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
