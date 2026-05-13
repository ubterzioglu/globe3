import { supabase } from '@/lib/supabase';
import type { PinListItem, PinFormValues } from './types';
import type { NormalizedPlace } from '@/features/places/types';

interface ApiResult<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

export async function submitPin(
  values: PinFormValues,
  place: NormalizedPlace,
): Promise<ApiResult<PinListItem>> {
  const { data, error } = await supabase.functions.invoke('pins-submit', {
    body: {
      pinType: values.pinType,
      displayName: values.displayName,
      description: values.description || undefined,
      placeId: place.placeId,
      sessionToken: values.sessionToken,
    },
  });

  if (error) {
    return { data: null, error: { code: 'network_error', message: error.message } };
  }
  return data as ApiResult<PinListItem>;
}

export async function fetchMyPins(): Promise<ApiResult<PinListItem[]>> {
  const { data, error } = await supabase
    .from('pins')
    .select('id, pin_type, display_name, description, city, country, country_code, lat, lng, status, rejection_reason, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: { code: 'db_error', message: error.message } };
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const pins: PinListItem[] = rows.map((p) => ({
    id: p.id as string,
    pinType: p.pin_type as PinListItem['pinType'],
    displayName: p.display_name as string,
    description: p.description as string | null,
    city: p.city as string,
    country: p.country as string,
    countryCode: p.country_code as string | null,
    lat: p.lat as number,
    lng: p.lng as number,
    status: p.status as PinListItem['status'],
    rejectionReason: p.rejection_reason as string | null,
    createdAt: p.created_at as string,
  }));

  return { data: pins, error: null };
}
