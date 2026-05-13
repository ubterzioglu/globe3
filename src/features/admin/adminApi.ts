import { supabase } from '@/lib/supabase';
import type { PinStatus } from '@/features/pins/types';

interface AdminPinItem {
  id: string;
  pinType: string;
  displayName: string;
  description: string | null;
  city: string;
  country: string;
  countryCode: string | null;
  lat: number;
  lng: number;
  status: PinStatus;
  rejectionReason: string | null;
  createdAt: string;
  userId: string;
}

interface AdminPinsResult {
  items: AdminPinItem[];
  nextCursor: string | null;
}

export async function fetchAdminPins(
  status: PinStatus = 'pending',
  limit = 50,
  cursor?: string,
): Promise<{ data: AdminPinsResult | null; error: { code: string; message: string } | null }> {
  const params = new URLSearchParams({ status, limit: String(limit) });
  if (cursor) params.set('cursor', cursor);

  const { data, error } = await supabase.functions.invoke(`admin-pins?${params.toString()}`, {
    method: 'GET',
  });

  if (error) {
    return { data: null, error: { code: 'network_error', message: error.message } };
  }

  return data as { data: AdminPinsResult | null; error: { code: string; message: string } | null };
}

export async function reviewPin(
  pinId: string,
  action: 'approve' | 'reject',
  reason?: string,
): Promise<{ data: unknown; error: { code: string; message: string } | null }> {
  const { data, error } = await supabase.functions.invoke('admin-pins-review', {
    body: { pinId, action, reason: reason ?? null },
  });

  if (error) {
    return { data: null, error: { code: 'network_error', message: error.message } };
  }

  return data as { data: unknown; error: { code: string; message: string } | null };
}

export type { AdminPinItem, AdminPinsResult };
