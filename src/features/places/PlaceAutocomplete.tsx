import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { usePlaceAutocomplete } from './usePlaceAutocomplete';
import { usePlaceDetails } from './usePlaceDetails';
import { PlaceSuggestionList } from './PlaceSuggestionList';
import type { NormalizedPlace, PlaceSuggestion } from './types';
import { Button } from '@/components/ui/Button';
import './PlaceAutocomplete.css';

interface PlaceAutocompleteProps {
  onSelect: (place: NormalizedPlace) => void;
  placeholder?: string;
  retainInputOnSelect?: boolean;
  showSelectedSummary?: boolean;
  showSearchButton?: boolean;
  submitButtonLabel?: string;
  disabled?: boolean;
}

export function PlaceAutocomplete({
  onSelect,
  placeholder = 'Search for a city...',
  retainInputOnSelect = false,
  showSelectedSummary = true,
  showSearchButton = false,
  submitButtonLabel = 'Search',
  disabled = false,
}: PlaceAutocompleteProps) {
  const [input, setInput] = useState('');
  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID());
  const [blurred, setBlurred] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { items, loading, activeIndex, noResults, setActiveIndex } = usePlaceAutocomplete(input, sessionToken);
  const { place: selectedPlace, error: detailsError, loadDetails } = usePlaceDetails();

  const resetSession = useCallback(() => {
    setSessionToken(crypto.randomUUID());
  }, []);

  const triggerInlineError = useCallback((message: string) => {
    setInlineMessage(message);
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  }, []);

  const handleSelect = useCallback(
    async (suggestion: PlaceSuggestion) => {
      const place = await loadDetails(suggestion.placeId, sessionToken);
      if (place) {
        setInlineMessage(null);
        onSelect(place);
        setInput(retainInputOnSelect ? place.label : '');
        resetSession();
      } else {
        triggerInlineError(detailsError?.message ?? 'Sehir bilgisi alinamadi.');
      }
    },
    [loadDetails, sessionToken, onSelect, resetSession, retainInputOnSelect, triggerInlineError, detailsError],
  );

  const submitSelection = useCallback(async () => {
    if (loading || disabled) return;

    if (activeIndex >= 0 && items[activeIndex]) {
      await handleSelect(items[activeIndex]!);
      return;
    }

    if (items.length > 0) {
      await handleSelect(items[0]!);
      return;
    }

    if (input.trim().length < 3) {
      triggerInlineError('Lutfen en az 3 karakter girin.');
      return;
    }

    triggerInlineError('Bu sehir henuz listede yok.');
  }, [activeIndex, disabled, handleSelect, input, items, loading, triggerInlineError]);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      if (items.length === 0) return;
      e.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      if (items.length === 0) return;
      e.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      void submitSelection();
    } else if (e.key === 'Escape') {
      setBlurred(true);
    }
  }

  return (
    <div className={`place-autocomplete ${shake ? 'place-autocomplete--shake' : ''}`} style={{ position: 'relative' }}>
      <div className="place-autocomplete__controls">
        <input
          ref={inputRef}
          className={`place-autocomplete__input ${inlineMessage ? 'place-autocomplete__input--error' : ''}`}
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setInlineMessage(null);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setBlurred(false)}
          onBlur={() => setBlurred(true)}
          autoComplete="off"
          disabled={disabled}
          aria-label={placeholder}
        />
        {showSearchButton && (
          <Button
            type="button"
            variant="secondary"
            className="place-autocomplete__button"
            onClick={() => void submitSelection()}
            disabled={disabled || loading}
            aria-label="Sehir ara"
          >
            {loading ? '...' : submitButtonLabel}
          </Button>
        )}
      </div>
      {loading && <span className="place-autocomplete__loading">...</span>}
      {!blurred && items.length > 0 && (
        <PlaceSuggestionList
          items={items}
          activeIndex={activeIndex}
          onSelect={handleSelect}
        />
      )}
      {inlineMessage && (
        <div className="place-autocomplete__feedback place-autocomplete__feedback--error">
          {inlineMessage}
        </div>
      )}
      {!inlineMessage && noResults && (
        <div className="place-autocomplete__feedback place-autocomplete__feedback--error">
          Bu sehir henuz listede yok.
        </div>
      )}
      {!inlineMessage && detailsError && (
        <div className="place-autocomplete__feedback place-autocomplete__feedback--error">
          {detailsError.message}
        </div>
      )}
      {showSelectedSummary && selectedPlace && (
        <div className="place-autocomplete__selected">
          {selectedPlace.city}, {selectedPlace.country}
        </div>
      )}
    </div>
  );
}
