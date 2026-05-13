import { useState, useEffect, useCallback } from 'react';
import { AdminRouteGuard } from './AdminRouteGuard';
import { fetchAdminPins, type AdminPinItem } from './adminApi';
import type { PinStatus } from '@/features/pins/types';
import { AdminPinsTable } from './AdminPinsTable';
import { ReviewDrawer } from './ReviewDrawer';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { EmptyState } from '@/components/ui/EmptyState';
import './AdminPinsPage.css';

export default function AdminPinsPage() {
  const [pins, setPins] = useState<AdminPinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PinStatus>('pending');
  const [reviewPin, setReviewPin] = useState<AdminPinItem | null>(null);

  const loadPins = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAdminPins(statusFilter);
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      setPins(result.data?.items ?? []);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadPins();
  }, [loadPins]);

  return (
    <AdminRouteGuard>
      <div className="admin-page">
        <div className="admin-page__header">
          <h1>Admin — Pins</h1>
          <div className="admin-page__filters">
            {(['pending', 'approved', 'rejected'] as PinStatus[]).map((s) => (
              <button
                key={s}
                className={`admin-page__filter-btn ${s === statusFilter ? 'admin-page__filter-btn--active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="admin-page__center">
            <Spinner size={32} />
          </div>
        )}

        {!loading && error && <ErrorBox message={error} onRetry={loadPins} />}

        {!loading && !error && pins.length === 0 && (
          <EmptyState message={`No ${statusFilter} pins.`} />
        )}

        {!loading && !error && pins.length > 0 && (
          <AdminPinsTable items={pins} onReview={setReviewPin} />
        )}

        <ReviewDrawer
          pin={reviewPin}
          onClose={() => setReviewPin(null)}
          onReviewed={loadPins}
        />
      </div>
    </AdminRouteGuard>
  );
}
