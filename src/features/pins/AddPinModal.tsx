import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PinForm } from './PinForm';
import { submitPin } from './api';
import type { NormalizedPlace } from '@/features/places/types';
import type { PinType } from './types';
import './AddPinModal.css';

interface AddPinModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddPinModal({ open, onClose, onCreated }: AddPinModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: {
    pinType: PinType;
    displayName: string;
    description: string;
    place: NormalizedPlace;
    sessionToken: string;
  }) {
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitPin(
        {
          pinType: values.pinType,
          displayName: values.displayName,
          description: values.description,
          placeId: values.place.placeId,
          sessionToken: values.sessionToken,
        },
        values.place,
      );

      if (result.error) {
        setError(result.error.message);
        return;
      }

      onCreated();
      onClose();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title="Add Pin" onClose={onClose}>
      {error && <div className="add-pin-modal__error">{error}</div>}
      <PinForm onSubmit={handleSubmit} submitting={submitting} />
    </Modal>
  );
}
