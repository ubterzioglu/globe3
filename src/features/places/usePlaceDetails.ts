import { useState, useCallback } from 'react';
import type { NormalizedPlace, PlacesApiError } from './types';
import { fetchPlaceDetails } from './api';

interface UsePlaceDetailsResult {
  place: NormalizedPlace | null;
  loading: boolean;
  error: PlacesApiError | null;
  loadDetails: (placeId: string, sessionToken: string) => Promise<NormalizedPlace | null>;
}

export function usePlaceDetails(): UsePlaceDetailsResult {
  const [place, setPlace] = useState<NormalizedPlace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PlacesApiError | null>(null);

  const loadDetails = useCallback(async (placeId: string, sessionToken: string) => {
    setLoading(true);
    setError(null);

    const result = await fetchPlaceDetails(placeId, sessionToken);

    setLoading(false);
    if (result.error || !result.data) {
      setError(result.error ?? { code: 'unknown', message: 'Unknown error' });
      setPlace(null);
      return null;
    }

    setPlace(result.data);
    return result.data;
  }, []);

  return { place, loading, error, loadDetails };
}
