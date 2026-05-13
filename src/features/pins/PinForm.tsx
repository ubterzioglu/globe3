import { useState, type FormEvent } from 'react';
import type { NormalizedPlace } from '@/features/places/types';
import type { PinType } from './types';
import { PIN_TYPE_OPTIONS } from './types';
import { PlaceAutocomplete } from '@/features/places/PlaceAutocomplete';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import './PinForm.css';

interface PinFormProps {
  onSubmit: (values: {
    pinType: PinType;
    displayName: string;
    description: string;
    place: NormalizedPlace;
    sessionToken: string;
  }) => Promise<void>;
  submitting: boolean;
}

export function PinForm({ onSubmit, submitting }: PinFormProps) {
  const [pinType, setPinType] = useState<PinType | ''>('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<NormalizedPlace | null>(null);
  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID());

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!pinType) next.pinType = 'Pin type is required';
    if (displayName.trim().length < 2) next.displayName = 'Display name must be at least 2 characters';
    if (!selectedPlace) next.place = 'Please select a city';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !selectedPlace) return;

    await onSubmit({
      pinType: pinType as PinType,
      displayName: displayName.trim(),
      description: description.trim(),
      place: selectedPlace,
      sessionToken,
    });

    setSessionToken(crypto.randomUUID());
  }

  function handlePlaceSelect(place: NormalizedPlace) {
    setSelectedPlace(place);
    setErrors((prev) => ({ ...prev, place: '' }));
  }

  return (
    <form className="pin-form" onSubmit={handleSubmit}>
      <Select
        label="Pin Type"
        options={PIN_TYPE_OPTIONS}
        value={pinType}
        onChange={(e) => setPinType(e.target.value as PinType)}
        placeholder="Select type..."
        error={errors.pinType}
      />
      <Input
        label="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name or business name"
        error={errors.displayName}
      />
      <div className="pin-form__field">
        <label className="pin-form__label">Description (optional)</label>
        <textarea
          className="pin-form__textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about this pin..."
          maxLength={2000}
          rows={3}
        />
      </div>
      <div className="pin-form__field">
        <label className="pin-form__label">City</label>
        <PlaceAutocomplete onSelect={handlePlaceSelect} />
        {errors.place && <span className="pin-form__error">{errors.place}</span>}
      </div>
      {selectedPlace && (
        <div className="pin-form__place-summary">
          <strong>{selectedPlace.city}</strong>, {selectedPlace.country}
        </div>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Pin'}
      </Button>
    </form>
  );
}
