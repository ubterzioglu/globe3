import { useState, useEffect, useRef, useCallback } from 'react';
import type { PlaceSuggestion, PlacesApiError } from './types';
import { fetchPlaceSuggestions } from './api';

interface UsePlaceAutocompleteResult {
  items: PlaceSuggestion[];
  loading: boolean;
  error: PlacesApiError | null;
  activeIndex: number;
  hasQuery: boolean;
  noResults: boolean;
  setActiveIndex: (i: number) => void;
}

export function usePlaceAutocomplete(
  input: string,
  sessionToken: string,
  minLength = 3,
  debounceMs = 300,
): UsePlaceAutocompleteResult {
  const [items, setItems] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PlacesApiError | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestIdRef = useRef(0);

  const reset = useCallback(() => {
    setItems([]);
    setError(null);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (input.trim().length < minLength) {
      reset();
      return;
    }

    const timer = setTimeout(async () => {
      const reqId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      const result = await fetchPlaceSuggestions(input.trim(), sessionToken);

      if (reqId !== requestIdRef.current) return;

      setLoading(false);
      if (result.error) {
        setError(result.error);
        setItems([]);
      } else {
        setItems(result.data ?? []);
      }
      setActiveIndex(-1);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [input, sessionToken, minLength, debounceMs, reset]);

  const hasQuery = input.trim().length >= minLength;
  const noResults = hasQuery && !loading && !error && items.length === 0;

  return { items, loading, error, activeIndex, hasQuery, noResults, setActiveIndex };
}
