import { useState } from 'react';
import { useApprovedPins } from './useApprovedPins';
import { GlobeScene } from './GlobeScene';
import { useGlobeController } from './useGlobeController';
import { PlaceAutocomplete } from '@/features/places/PlaceAutocomplete';
import type { NormalizedPlace } from '@/features/places/types';
import type { PinType } from '@/features/pins/types';
import { PIN_TYPE_LABELS } from '@/features/pins/types';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { EmptyState } from '@/components/ui/EmptyState';
import './GlobePage.css';

const FILTER_OPTIONS: Array<{ value: 'all' | PinType; label: string; emoji: string }> = [
  { value: 'all', label: 'Tumu', emoji: '🌍' },
  { value: 'person', label: 'Diaspora Uyesi', emoji: '🧑' },
  { value: 'business', label: 'Isletme', emoji: '🏪' },
  { value: 'ngo', label: 'STK / Dernek', emoji: '🤝' },
  { value: 'creator', label: 'Icerik Ureticisi', emoji: '🎥' },
  { value: 'event', label: 'Aktif Etkinlik', emoji: '📍' },
];

export default function GlobePage() {
  const { pins, loading, error, refetch } = useApprovedPins();
  const { targetRotation, controller } = useGlobeController();
  const [selectedPlace, setSelectedPlace] = useState<NormalizedPlace | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | PinType>('all');

  const filteredPins = activeFilter === 'all'
    ? pins
    : pins.filter((pin) => pin.pinType === activeFilter);

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
            <div className="globe-page__eyebrow">CorteQS Diaspora Globe</div>
            <h1>Global Turk diasporasini sehir sehir kesfet.</h1>
            <p>Bir sehir ara ve globe'u o noktaya gotur.</p>
          </div>
        </div>

        <div className="globe-page__search">
          <PlaceAutocomplete
            onSelect={handlePlaceSelect}
            placeholder="Sehir ara: Berlin, Istanbul, London..."
            retainInputOnSelect
            showSelectedSummary={false}
            showSearchButton
            submitButtonLabel="Ara"
          />
        </div>

        {selectedPlace && (
          <div className="globe-page__search-result">
            Odaklanilan sehir: <strong>{selectedPlace.city}</strong>, {selectedPlace.country}
          </div>
        )}

        <div className="globe-page__filters" aria-label="Pin filtreleri">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`globe-page__filter-chip ${activeFilter === option.value ? 'globe-page__filter-chip--active' : ''}`}
              onClick={() => setActiveFilter(option.value)}
              aria-pressed={activeFilter === option.value}
              aria-label={option.label}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="globe-page__legend">
          {FILTER_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
            <div key={option.value} className="globe-page__legend-item">
              <span className="globe-page__legend-emoji">{option.emoji}</span>
              <span>{PIN_TYPE_LABELS[option.value as PinType] ?? option.label}</span>
            </div>
          ))}
        </div>
      </div>

      <GlobeScene pins={filteredPins} targetRotation={targetRotation} />

      {filteredPins.length === 0 && (
        <div className="globe-page__empty-overlay">
          <EmptyState message={activeFilter === 'all' ? 'No pins yet. Be the first to add one!' : 'Bu filtre icin henuz pin yok.'} />
        </div>
      )}
    </div>
  );
}
