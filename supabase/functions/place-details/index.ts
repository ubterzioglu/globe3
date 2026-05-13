import { jsonOk, jsonError } from '../_shared/json.ts';
import { ErrorCodes } from '../_shared/errors.ts';
import { safeJson, validatePlaceId } from '../_shared/validators.ts';
import { getPlaceDetails } from '../_shared/googlePlaces.ts';
import { normalizeGooglePlace } from '../_shared/normalizePlace.ts';
import { checkRateLimit, RATE_LIMITS, getRateLimitKey, extractClientIdentifier, rateLimitResponse } from '../_shared/rateLimit.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    const { corsHeaders: ch } = await import('../_shared/cors.ts');
    return new Response(null, { status: 204, headers: ch });
  }
  if (req.method !== 'POST') {
    return jsonError(405, 'method_not_allowed', 'Only POST is allowed');
  }

  const clientId = extractClientIdentifier(req);
  const rlKey = getRateLimitKey('place-details', clientId);
  if (!checkRateLimit(rlKey, RATE_LIMITS['place-details'])) {
    return rateLimitResponse();
  }

  const { data: body, response: parseErr } = await safeJson<Record<string, unknown>>(req);
  if (parseErr) return parseErr;

  const placeIdErr = validatePlaceId(body?.placeId);
  if (placeIdErr) {
    return jsonError(400, ErrorCodes.VALIDATION_ERROR, placeIdErr);
  }

  const placeId = (body?.placeId as string).trim();
  const sessionToken = typeof body?.sessionToken === 'string' ? body.sessionToken : '';

  try {
    const googlePlace = await getPlaceDetails(placeId, sessionToken);
    const result = normalizeGooglePlace(googlePlace);

    if (result.error) {
      return jsonError(422, ErrorCodes.PLACE_NOT_CITY_LEVEL, 'Place cannot be resolved to city level');
    }

    return jsonOk({ place: result.place });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.startsWith(ErrorCodes.PLACE_NOT_FOUND)) {
      return jsonError(404, ErrorCodes.PLACE_NOT_FOUND, 'Place not found');
    }
    if (message.startsWith(ErrorCodes.GOOGLE_UPSTREAM_ERROR)) {
      return jsonError(502, ErrorCodes.GOOGLE_UPSTREAM_ERROR, 'Failed to fetch place details');
    }
    return jsonError(500, ErrorCodes.INTERNAL_ERROR, 'Unexpected error');
  }
});
