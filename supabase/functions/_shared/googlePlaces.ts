import { ErrorCodes } from './errors.ts';

const PLACES_API_BASE = 'https://places.googleapis.com/v1';

const AUTOCOMPLETE_FIELD_MASK = 'suggestions.placePrediction.text,suggestions.placePrediction.placeId,suggestions.placePrediction.types';

const DETAILS_FIELD_MASK = 'id,name,formattedAddress,shortFormattedAddress,addressComponents,location,viewport,types';

export function getApiKey(): string {
  const key = Deno.env.get('GOOGLE_MAPS_PLACES_API_KEY');
  if (!key) throw new Error('GOOGLE_MAPS_PLACES_API_KEY not configured');
  return key;
}

export async function autocompletePlaces(
  input: string,
  sessionToken: string,
): Promise<GoogleAutocompleteResponse> {
  const url = `${PLACES_API_BASE}/places:autocomplete`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': AUTOCOMPLETE_FIELD_MASK,
    },
    body: JSON.stringify({
      input,
      sessionToken,
      includedPrimaryTypes: ['(cities)'],
      includeQueryPredictions: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${ErrorCodes.GOOGLE_UPSTREAM_ERROR}: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getPlaceDetails(
  placeId: string,
  sessionToken: string,
): Promise<GooglePlaceDetailsResponse> {
  const url = `${PLACES_API_BASE}/places/${placeId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': DETAILS_FIELD_MASK,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`${ErrorCodes.PLACE_NOT_FOUND}: Place not found`);
    }
    const text = await res.text();
    throw new Error(`${ErrorCodes.GOOGLE_UPSTREAM_ERROR}: ${res.status} ${text}`);
  }

  return res.json();
}

export interface GoogleAutocompleteSuggestion {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
    types?: string[];
  };
}

export interface GoogleAutocompleteResponse {
  suggestions?: GoogleAutocompleteSuggestion[];
}

export interface GoogleAddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

export interface GooglePlaceDetailsResponse {
  id?: string;
  name?: string;
  formattedAddress?: string;
  shortFormattedAddress?: string;
  addressComponents?: GoogleAddressComponent[];
  location?: { latitude?: number; longitude?: number };
  viewport?: {
    low?: { latitude?: number; longitude?: number };
    high?: { latitude?: number; longitude?: number };
  };
  types?: string[];
}
