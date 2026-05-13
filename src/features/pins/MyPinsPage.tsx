import { useState, useEffect, useCallback } from 'react';
import { AuthGate } from '@/features/auth/AuthGate';
import { fetchMyPins } from './api';
import type { PinListItem } from './types';
import { MyPinsList } from './MyPinsList';
import { AddPinModal } from './AddPinModal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBox } from '@/components/ui/ErrorBox';
import './MyPinsPage.css';

export default function MyPinsPage() {
  const [pins, setPins] = useState<PinListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadPins = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchMyPins();
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      setPins(result.data ?? []);
    }
  }, []);

  useEffect(() => {
    loadPins();
  }, [loadPins]);

  return (
    <AuthGate>
      <div className="my-pins-page">
        <div className="my-pins-page__header">
          <h1>My Pins</h1>
          <Button onClick={() => setModalOpen(true)}>Add Pin</Button>
        </div>

        {loading && (
          <div className="my-pins-page__center">
            <Spinner size={32} />
          </div>
        )}

        {!loading && error && (
          <ErrorBox message={error} onRetry={loadPins} />
        )}

        {!loading && !error && pins.length === 0 && (
          <EmptyState
            message="You haven't added any pins yet."
            action={<Button onClick={() => setModalOpen(true)}>Add Your First Pin</Button>}
          />
        )}

        {!loading && !error && pins.length > 0 && <MyPinsList pins={pins} />}

        <AddPinModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={loadPins}
        />
      </div>
    </AuthGate>
  );
}
