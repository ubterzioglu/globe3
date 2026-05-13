import { useState } from 'react';
import { useApprovedPins } from './useApprovedPins';
import { GlobeScene } from './GlobeScene';
import { useGlobeController } from './useGlobeController';
import { PlaceAutocomplete } from '@/features/places/PlaceAutocomplete';
import { AddPinModal } from '@/features/pins/AddPinModal';
import type { NormalizedPlace } from '@/features/places/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { EmptyState } from '@/components/ui/EmptyState';
import './GlobePage.css';

export default function GlobePage() {
  const { pins, loading, error, refetch } = useApprovedPins();
  const { targetRotation, controller } = useGlobeController();
  const [selectedPlace, setSelectedPlace] = useState<NormalizedPlace | null>(null);
  const [addPinOpen, setAddPinOpen] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  function handlePlaceSelect(place: NormalizedPlace) {
    setSelectedPlace(place);
    controller.flyToCoords({ lat: place.lat, lng: place.lng });
  }

  if (loading) {
    return (
      <div className="globe-page__center">
        <Spinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="globe-page__center">
        <ErrorBox message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="globe-page">
      <div className="globe-page__panel">
        <div className="globe-page__panel-header">
          <div>
            <h1>Explore the Globe</h1>
            <p>Search for a city, fly there, and submit a new pin for admin review.</p>
          </div>
          <Button onClick={() => setAddPinOpen(true)}>Add Pin</Button>
        </div>

        <div className="globe-page__search">
          <PlaceAutocomplete onSelect={handlePlaceSelect} />
        </div>

        {selectedPlace && (
          <div className="globe-page__search-result">
            Flying to <strong>{selectedPlace.city}</strong>, {selectedPlace.country}
          </div>
        )}

        {submitNotice && (
          <div className="globe-page__submit-notice">{submitNotice}</div>
        )}
      </div>

      <GlobeScene pins={pins} targetRotation={targetRotation} />

      <AddPinModal
        open={addPinOpen}
        onClose={() => setAddPinOpen(false)}
        onCreated={() => {
          setSubmitNotice('Your pin was submitted and is now waiting for admin review.');
          setAddPinOpen(false);
        }}
      />

      {pins.length === 0 && (
        <div className="globe-page__empty-overlay">
          <EmptyState message="No pins yet. Be the first to add one!" />
        </div>
      )}
    </div>
  );
}
