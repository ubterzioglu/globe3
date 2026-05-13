import type { GoogleAddressComponent, GooglePlaceDetailsResponse } from './googlePlaces.ts';

function pickComponent(components: GoogleAddressComponent[], targetType: string): GoogleAddressComponent | undefined {
  return components.find((c) => c.types?.includes(targetType));
}

export function normalizeGooglePlace(place: GooglePlaceDetailsResponse) {
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

  if (!city) {
    return { error: 'place_not_city_level' as const };
  }
  if (!country) {
    return { error: 'place_not_city_level' as const };
  }

  const lat = place.location?.latitude;
  const lng = place.location?.longitude;

  if (lat === undefined || lng === undefined) {
    return { error: 'place_not_city_level' as const };
  }

  const viewport = place.viewport
    ? {
        north: place.viewport.high?.latitude ?? 0,
        south: place.viewport.low?.latitude ?? 0,
        east: place.viewport.high?.longitude ?? 0,
        west: place.viewport.low?.longitude ?? 0,
      }
    : null;

  return {
    error: null,
    place: {
      provider: 'google_places_new' as const,
      placeId: place.id ?? '',
      resourceName: place.name ?? '',
      label: `${city}, ${country}`,
      city,
      region,
      country,
      countryCode,
      formattedAddress: place.formattedAddress ?? null,
      shortFormattedAddress: place.shortFormattedAddress ?? null,
      lat,
      lng,
      viewport,
      types: place.types ?? [],
      refreshedAt: new Date().toISOString(),
    },
  };
}
