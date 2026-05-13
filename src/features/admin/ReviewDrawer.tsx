import { useState } from 'react';
import type { AdminPinItem } from './adminApi';
import { reviewPin } from './adminApi';
import { Button } from '@/components/ui/Button';
import './ReviewDrawer.css';

interface ReviewDrawerProps {
  pin: AdminPinItem | null;
  onClose: () => void;
  onReviewed: () => void;
}

export function ReviewDrawer({ pin, onClose, onReviewed }: ReviewDrawerProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pin) return null;

  const pinId = pin.id;

  async function handleApprove() {
    setLoading(true);
    setError(null);
    const result = await reviewPin(pinId, 'approve');
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      onReviewed();
      onClose();
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await reviewPin(pinId, 'reject', reason.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      onReviewed();
      onClose();
    }
  }

  return (
    <div className="review-drawer">
      <div className="review-drawer__header">
        <h3>Review Pin</h3>
        <button className="review-drawer__close" onClick={onClose}>&times;</button>
      </div>

      <div className="review-drawer__body">
        <div className="review-drawer__field">
          <span className="review-drawer__label">Display Name</span>
          <span>{pin.displayName}</span>
        </div>
        <div className="review-drawer__field">
          <span className="review-drawer__label">Type</span>
          <span>{pin.pinType}</span>
        </div>
        <div className="review-drawer__field">
          <span className="review-drawer__label">Location</span>
          <span>{pin.city}, {pin.country} ({pin.lat.toFixed(2)}, {pin.lng.toFixed(2)})</span>
        </div>
        {pin.description && (
          <div className="review-drawer__field">
            <span className="review-drawer__label">Description</span>
            <span>{pin.description}</span>
          </div>
        )}

        {error && <div className="review-drawer__error">{error}</div>}

        <div className="review-drawer__field">
          <label className="review-drawer__label" htmlFor="reject-reason">Rejection Reason (if rejecting)</label>
          <textarea
            id="reject-reason"
            className="review-drawer__textarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            rows={3}
          />
        </div>

        <div className="review-drawer__actions">
          <Button variant="danger" onClick={handleReject} disabled={loading}>
            Reject
          </Button>
          <Button variant="primary" onClick={handleApprove} disabled={loading}>
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
