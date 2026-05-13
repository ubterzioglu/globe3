import { describe, it, expect } from 'vitest';

interface AddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

interface PlaceDetails {
  id?: string;
  name?: string;
  formattedAddress?: string;
  shortFormattedAddress?: string;
  addressComponents?: AddressComponent[];
  location?: { latitude?: number; longitude?: number };
  viewport?: {
    low?: { latitude?: number; longitude?: number };
    high?: { latitude?: number; longitude?: number };
  };
  types?: string[];
}

function pickComponent(components: AddressComponent[], targetType: string): AddressComponent | undefined {
  return components.find((c) => c.types?.includes(targetType));
}

function normalizePlace(place: PlaceDetails) {
  const components = place.addressComponents ?? [];

  const locality = pickComponent(components, 'locality');
  const postalTown = pickComponent(components, 'postal_town');
  const adminLevel3 = pickComponent(components, 'administrative_area_level_3');
  const adminLevel1 = pickComponent(components, 'administrative_area_level_1');
  const countryComp = pickComponent(components, 'country');

  const city = locality?.longText ?? postalTown?.longText ?? adminLevel3?.longText;
  const region = adminLevel1?.longText ?? null;
  const country = countryComp?.longText;
  const countryCode = countryComp?.shortText ?? null;

  if (!city) return { error: 'place_not_city_level' as const };
  if (!country) return { error: 'place_not_city_level' as const };

  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (lat === undefined || lng === undefined) return { error: 'place_not_city_level' as const };

  return {
    error: null,
    place: {
      city,
      region,
      country,
      countryCode,
      lat,
      lng,
      placeId: place.id ?? '',
      label: `${city}, ${country}`,
    },
  };
}

describe('normalizePlace', () => {
  const makePlace = (overrides: Partial<PlaceDetails> = {}): PlaceDetails => ({
    id: 'test-place-id',
    name: 'places/test-place-id',
    formattedAddress: 'Istanbul, Turkey',
    addressComponents: [
      { longText: 'Istanbul', shortText: 'Istanbul', types: ['locality', 'political'] },
      { longText: 'Istanbul Province', shortText: 'Istanbul', types: ['administrative_area_level_1', 'political'] },
      { longText: 'Turkey', shortText: 'TR', types: ['country', 'political'] },
    ],
    location: { latitude: 41.0082, longitude: 28.9784 },
    types: ['locality', 'political'],
    ...overrides,
  });

  it('normalizes a valid place with locality', () => {
    const result = normalizePlace(makePlace());
    expect(result.error).toBeNull();
    if (result.error === null) {
      expect(result.place.city).toBe('Istanbul');
      expect(result.place.country).toBe('Turkey');
      expect(result.place.countryCode).toBe('TR');
      expect(result.place.lat).toBe(41.0082);
      expect(result.place.lng).toBe(28.9784);
      expect(result.place.label).toBe('Istanbul, Turkey');
    }
  });

  it('falls back to postal_town when locality missing', () => {
    const place = makePlace({
      addressComponents: [
        { longText: 'London', shortText: 'London', types: ['postal_town'] },
        { longText: 'England', shortText: 'England', types: ['administrative_area_level_1'] },
        { longText: 'United Kingdom', shortText: 'GB', types: ['country'] },
      ],
    });
    const result = normalizePlace(place);
    expect(result.error).toBeNull();
    if (result.error === null) {
      expect(result.place.city).toBe('London');
    }
  });

  it('falls back to administrative_area_level_3 when locality and postal_town missing', () => {
    const place = makePlace({
      addressComponents: [
        { longText: 'Some District', shortText: 'Some', types: ['administrative_area_level_3'] },
        { longText: 'Region', shortText: 'Region', types: ['administrative_area_level_1'] },
        { longText: 'Country', shortText: 'CC', types: ['country'] },
      ],
    });
    const result = normalizePlace(place);
    expect(result.error).toBeNull();
    if (result.error === null) {
      expect(result.place.city).toBe('Some District');
    }
  });

  it('returns error when no city-level component found', () => {
    const place = makePlace({
      addressComponents: [
        { longText: 'Region', shortText: 'Region', types: ['administrative_area_level_1'] },
        { longText: 'Country', shortText: 'CC', types: ['country'] },
      ],
    });
    const result = normalizePlace(place);
    expect(result.error).toBe('place_not_city_level');
  });

  it('returns error when country missing', () => {
    const place = makePlace({
      addressComponents: [
        { longText: 'Istanbul', shortText: 'Istanbul', types: ['locality'] },
      ],
    });
    const result = normalizePlace(place);
    expect(result.error).toBe('place_not_city_level');
  });

  it('returns error when location missing', () => {
    const place = makePlace({ location: undefined });
    const result = normalizePlace(place);
    expect(result.error).toBe('place_not_city_level');
  });

  it('returns error when latitude missing', () => {
    const place = makePlace({ location: { longitude: 28.9784 } });
    const result = normalizePlace(place);
    expect(result.error).toBe('place_not_city_level');
  });

  it('returns region when admin_level_1 present', () => {
    const result = normalizePlace(makePlace());
    expect(result.error).toBeNull();
    if (result.error === null) {
      expect(result.place.region).toBe('Istanbul Province');
    }
  });

  it('returns null region when admin_level_1 absent', () => {
    const place = makePlace({
      addressComponents: [
        { longText: 'City', shortText: 'City', types: ['locality'] },
        { longText: 'Country', shortText: 'CC', types: ['country'] },
      ],
    });
    const result = normalizePlace(place);
    expect(result.error).toBeNull();
    if (result.error === null) {
      expect(result.place.region).toBeNull();
    }
  });
});
