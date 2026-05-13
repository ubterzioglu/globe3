import { supabase } from '@/lib/supabase';
import type { PlaceSuggestion, NormalizedPlace, PlacesApiError } from './types';

interface ApiResult<T> {
  data: T | null;
  error: PlacesApiError | null;
}

export async function fetchPlaceSuggestions(
  input: string,
  sessionToken: string,
): Promise<ApiResult<PlaceSuggestion[]>> {
  const { data, error } = await supabase.functions.invoke('places-autocomplete', {
    body: { input, sessionToken },
  });
  if (error) {
    return { data: null, error: { code: 'network_error', message: error.message } };
  }
  return data as ApiResult<PlaceSuggestion[]>;
}

export async function fetchPlaceDetails(
  placeId: string,
  sessionToken: string,
): Promise<ApiResult<NormalizedPlace>> {
  const { data, error } = await supabase.functions.invoke('place-details', {
    body: { placeId, sessionToken },
  });
  if (error) {
    return { data: null, error: { code: 'network_error', message: error.message } };
  }
  return data as ApiResult<NormalizedPlace>;
}
