import { supabase } from '@/lib/supabase';
import type { PlaceSuggestion, NormalizedPlace, PlacesApiError } from './types';

interface ApiResult<T> {
  data: T | null;
  error: PlacesApiError | null;
}

interface WrappedResponse<T> {
  data: T | null;
  error: PlacesApiError | null;
}

function unwrapFunctionPayload<T extends object>(
  payload: unknown,
  extractor: (value: T) => unknown,
): unknown {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const maybeWrapped = payload as Partial<WrappedResponse<T>>;
  if ('error' in maybeWrapped && maybeWrapped.error) {
    throw maybeWrapped.error;
  }
  if ('data' in maybeWrapped && maybeWrapped.data && typeof maybeWrapped.data === 'object') {
    return extractor(maybeWrapped.data as T);
  }

  return extractor(payload as T);
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

  try {
    const suggestions = unwrapFunctionPayload<{ suggestions?: PlaceSuggestion[] }>(
      data,
      (value) => value.suggestions ?? [],
    ) as PlaceSuggestion[] | null;
    return { data: suggestions ?? [], error: null };
  } catch (wrappedError) {
    return { data: null, error: wrappedError as PlacesApiError };
  }
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

  try {
    const place = unwrapFunctionPayload<{ place?: NormalizedPlace }>(
      data,
      (value) => value.place ?? null,
    ) as NormalizedPlace | null;
    return { data: place, error: null };
  } catch (wrappedError) {
    return { data: null, error: wrappedError as PlacesApiError };
  }
}
