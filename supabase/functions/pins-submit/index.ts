import { jsonOk, jsonError } from '../_shared/json.ts';
import { ErrorCodes } from '../_shared/errors.ts';
import { safeJson, validatePinType, validateDisplayName, validateDescription, validatePlaceId } from '../_shared/validators.ts';
import { requireUser, getSupabaseAdminClient } from '../_shared/auth.ts';
import { getPlaceDetails } from '../_shared/googlePlaces.ts';
import { normalizeGooglePlace } from '../_shared/normalizePlace.ts';
import { checkRateLimit, RATE_LIMITS, getRateLimitKey, extractClientIdentifier, rateLimitResponse } from '../_shared/rateLimit.ts';

interface PinSubmitBody {
  pinType: string;
  displayName: string;
  description?: string;
  placeId: string;
  sessionToken?: string;
  languageCode?: string;
  regionCode?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    const { corsHeaders: ch } = await import('../_shared/cors.ts');
    return new Response(null, { status: 204, headers: ch });
  }
  if (req.method !== 'POST') {
    return jsonError(405, 'method_not_allowed', 'Only POST is allowed');
  }

  const { user, response: authErr } = await requireUser(req);
  if (authErr) return authErr;

  const clientId = extractClientIdentifier(req, user.id);
  const rlKey = getRateLimitKey('pins-submit', clientId);
  if (!checkRateLimit(rlKey, RATE_LIMITS['pins-submit'])) {
    return rateLimitResponse();
  }

  const { data: body, response: parseErr } = await safeJson<PinSubmitBody>(req);
  if (parseErr) return parseErr;

  const pinTypeErr = validatePinType(body?.pinType);
  if (pinTypeErr) return jsonError(400, ErrorCodes.VALIDATION_ERROR, pinTypeErr);

  const displayNameErr = validateDisplayName(body?.displayName);
  if (displayNameErr) return jsonError(400, ErrorCodes.VALIDATION_ERROR, displayNameErr);

  const descErr = validateDescription(body?.description);
  if (descErr) return jsonError(400, ErrorCodes.VALIDATION_ERROR, descErr);

  const placeIdErr = validatePlaceId(body?.placeId);
  if (placeIdErr) return jsonError(400, ErrorCodes.VALIDATION_ERROR, placeIdErr);

  const sessionToken = typeof body?.sessionToken === 'string' ? body.sessionToken : '';

  let normalizedPlace: ReturnType<typeof normalizeGooglePlace> extends { place: infer P } ? P : never;

  try {
    const googlePlace = await getPlaceDetails(body.placeId, sessionToken);
    const result = normalizeGooglePlace(googlePlace);

    if (result.error) {
      return jsonError(422, ErrorCodes.PLACE_NOT_CITY_LEVEL, 'Place cannot be resolved to city level');
    }
    normalizedPlace = result.place;
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.startsWith(ErrorCodes.PLACE_NOT_FOUND)) {
      return jsonError(404, ErrorCodes.PLACE_NOT_FOUND, 'Place not found');
    }
    if (message.startsWith(ErrorCodes.GOOGLE_UPSTREAM_ERROR)) {
      return jsonError(502, ErrorCodes.GOOGLE_UPSTREAM_ERROR, 'Failed to fetch place details');
    }
    return jsonError(500, ErrorCodes.INTERNAL_ERROR, 'Unexpected error fetching place');
  }

  const supabase = getSupabaseAdminClient();

  const { data: pin, error: insertErr } = await supabase
    .from('pins')
    .insert({
      user_id: user.id,
      pin_type: body.pinType,
      display_name: body.displayName.trim(),
      description: body.description?.trim() || null,
      place_id: normalizedPlace.placeId,
      place_resource_name: normalizedPlace.resourceName,
      formatted_address: normalizedPlace.formattedAddress,
      short_formatted_address: normalizedPlace.shortFormattedAddress,
      city: normalizedPlace.city,
      region: normalizedPlace.region,
      country: normalizedPlace.country,
      country_code: normalizedPlace.countryCode,
      lat: normalizedPlace.lat,
      lng: normalizedPlace.lng,
      google_types: normalizedPlace.types,
      status: 'pending',
    })
    .select()
    .single();

  if (insertErr || !pin) {
    return jsonError(500, ErrorCodes.DB_INSERT_FAILED, 'Failed to create pin');
  }

  await supabase.from('pin_moderation_events').insert({
    pin_id: pin.id,
    actor_user_id: user.id,
    event_type: 'submitted',
    meta: { place: normalizedPlace },
  });

  return jsonOk({
    pin: {
      id: pin.id,
      pinType: pin.pin_type,
      displayName: pin.display_name,
      city: pin.city,
      country: pin.country,
      countryCode: pin.country_code,
      lat: pin.lat,
      lng: pin.lng,
      status: pin.status,
      isActive: pin.is_active,
      createdAt: pin.created_at,
    },
  }, 201);
});
