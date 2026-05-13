export type NormalizedPlace = {
  provider: 'google_places_new';
  placeId: string;
  resourceName: string;
  label: string;
  city: string;
  region: string | null;
  country: string;
  countryCode: string | null;
  formattedAddress: string | null;
  shortFormattedAddress: string | null;
  lat: number;
  lng: number;
  viewport: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null;
  types: string[];
  refreshedAt: string;
};

export type PlaceSuggestion = {
  placeId: string;
  label: string;
  primaryText: string;
  secondaryText: string;
  types: string[];
};

export type PlacesApiError = {
  code: string;
  message: string;
};
