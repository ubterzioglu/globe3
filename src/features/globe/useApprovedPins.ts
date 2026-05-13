import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { GlobePinItem } from './globeTypes';

interface UseApprovedPinsResult {
  pins: GlobePinItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApprovedPins(): UseApprovedPinsResult {
  const [pins, setPins] = useState<GlobePinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPins = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('pins')
      .select('id, pin_type, display_name, city, country, country_code, lat, lng, created_at')
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as Record<string, unknown>[];
    const mapped: GlobePinItem[] = rows.map((p) => ({
      id: p.id as string,
      pinType: p.pin_type as string,
      displayName: p.display_name as string,
      city: p.city as string,
      country: p.country as string,
      countryCode: p.country_code as string | null,
      lat: p.lat as number,
      lng: p.lng as number,
      createdAt: p.created_at as string,
    }));

    setPins(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  useEffect(() => {
    const channel = supabase
      .channel('public-pins-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, () => {
        fetchPins();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPins]);

  return { pins, loading, error, refetch: fetchPins };
}
