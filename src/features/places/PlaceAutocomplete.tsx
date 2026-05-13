import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { usePlaceAutocomplete } from './usePlaceAutocomplete';
import { usePlaceDetails } from './usePlaceDetails';
import { PlaceSuggestionList } from './PlaceSuggestionList';
import type { NormalizedPlace, PlaceSuggestion } from './types';
import './PlaceAutocomplete.css';

interface PlaceAutocompleteProps {
  onSelect: (place: NormalizedPlace) => void;
}

export function PlaceAutocomplete({ onSelect }: PlaceAutocompleteProps) {
  const [input, setInput] = useState('');
  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID());
  const [blurred, setBlurred] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { items, loading, activeIndex, setActiveIndex } = usePlaceAutocomplete(input, sessionToken);
  const { place: selectedPlace, loadDetails } = usePlaceDetails();

  const resetSession = useCallback(() => {
    setInput('');
    setSessionToken(crypto.randomUUID());
  }, []);

  const handleSelect = useCallback(
    async (suggestion: PlaceSuggestion) => {
      const place = await loadDetails(suggestion.placeId, sessionToken);
      if (place) {
        onSelect(place);
        resetSession();
      }
    },
    [loadDetails, sessionToken, onSelect, resetSession],
  );

  function handleKeyDown(e: KeyboardEvent) {
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(items[activeIndex]!);
    } else if (e.key === 'Escape') {
      setBlurred(true);
    }
  }

  return (
    <div className="place-autocomplete" style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="place-autocomplete__input"
        type="text"
        placeholder="Search for a city..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setBlurred(false)}
        onBlur={() => setBlurred(true)}
        autoComplete="off"
      />
      {loading && <span className="place-autocomplete__loading">...</span>}
      {!blurred && items.length > 0 && (
        <PlaceSuggestionList
          items={items}
          activeIndex={activeIndex}
          onSelect={handleSelect}
        />
      )}
      {selectedPlace && (
        <div className="place-autocomplete__selected">
          {selectedPlace.city}, {selectedPlace.country}
        </div>
      )}
    </div>
  );
}
