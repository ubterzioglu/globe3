import { handleOptions, corsHeaders } from '../_shared/cors.ts';
import { jsonOk, jsonError } from '../_shared/json.ts';
import { ErrorCodes } from '../_shared/errors.ts';
import { safeJson } from '../_shared/validators.ts';
import { autocompletePlaces } from '../_shared/googlePlaces.ts';
import type { GoogleAutocompleteSuggestion } from '../_shared/googlePlaces.ts';
import { checkRateLimit, RATE_LIMITS, getRateLimitKey, extractClientIdentifier, rateLimitResponse } from '../_shared/rateLimit.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') {
    return jsonError(405, 'method_not_allowed', 'Only POST is allowed');
  }

  const clientId = extractClientIdentifier(req);
  const rlKey = getRateLimitKey('places-autocomplete', clientId);
  if (!checkRateLimit(rlKey, RATE_LIMITS['places-autocomplete'])) {
    return rateLimitResponse();
  }

  const { data: body, response: parseErr } = await safeJson<Record<string, unknown>>(req);
  if (parseErr) return parseErr;

  const input = body?.input;
  if (typeof input !== 'string' || input.trim().length < 3) {
    return jsonError(400, ErrorCodes.VALIDATION_ERROR, 'input must be at least 3 characters');
  }

  const sessionToken = typeof body?.sessionToken === 'string' ? body.sessionToken : '';

  try {
    const googleRes = await autocompletePlaces(input.trim(), sessionToken);

    const suggestions = (googleRes.suggestions ?? [])
      .filter((s: GoogleAutocompleteSuggestion) => s.placePrediction?.placeId)
      .map((s: GoogleAutocompleteSuggestion) => ({
        placeId: s.placePrediction!.placeId!,
        label: s.placePrediction!.text?.text ?? '',
        primaryText: s.placePrediction!.structuredFormat?.mainText?.text ?? '',
        secondaryText: s.placePrediction!.structuredFormat?.secondaryText?.text ?? '',
        types: s.placePrediction!.types ?? [],
      }));

    return jsonOk({ suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.startsWith(ErrorCodes.GOOGLE_UPSTREAM_ERROR)) {
      return jsonError(502, ErrorCodes.GOOGLE_UPSTREAM_ERROR, 'Failed to fetch suggestions');
    }
    return jsonError(500, ErrorCodes.INTERNAL_ERROR, 'Unexpected error');
  }
});
