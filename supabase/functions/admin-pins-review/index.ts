import { jsonOk, jsonError } from '../_shared/json.ts';
import { ErrorCodes } from '../_shared/errors.ts';
import { safeJson } from '../_shared/validators.ts';
import { requireAdmin, getSupabaseAdminClient } from '../_shared/auth.ts';
import { checkRateLimit, RATE_LIMITS, getRateLimitKey, extractClientIdentifier, rateLimitResponse } from '../_shared/rateLimit.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    const { corsHeaders: ch } = await import('../_shared/cors.ts');
    return new Response(null, { status: 204, headers: ch });
  }
  if (req.method !== 'POST') {
    return jsonError(405, 'method_not_allowed', 'Only POST is allowed');
  }

  const { user, response: authErr } = await requireAdmin(req);
  if (authErr) return authErr;

  const clientId = extractClientIdentifier(req, user.id);
  const rlKey = getRateLimitKey('admin-pins-review', clientId);
  if (!checkRateLimit(rlKey, RATE_LIMITS['admin-pins-review'])) {
    return rateLimitResponse();
  }

  const { data: body, response: parseErr } = await safeJson<Record<string, unknown>>(req);
  if (parseErr) return parseErr;

  const pinId = body?.pinId;
  if (typeof pinId !== 'string' || pinId.trim().length === 0) {
    return jsonError(400, ErrorCodes.VALIDATION_ERROR, 'pinId is required');
  }

  const action = body?.action;
  if (action !== 'approve' && action !== 'reject') {
    return jsonError(400, ErrorCodes.VALIDATION_ERROR, 'action must be approve or reject');
  }

  const reason = typeof body?.reason === 'string' ? body.reason : null;

  if (action === 'reject' && (!reason || reason.trim().length === 0)) {
    return jsonError(400, ErrorCodes.VALIDATION_ERROR, 'reason is required for rejection');
  }

  const supabase = getSupabaseAdminClient();

  const { data: rpcResult, error: rpcErr } = await supabase.rpc('admin_review_pin', {
    p_pin_id: pinId,
    p_action: action,
    p_reason: reason,
    p_admin_id: user.id,
  });

  if (rpcErr) {
    return jsonError(500, ErrorCodes.INTERNAL_ERROR, rpcErr.message);
  }

  const result = rpcResult as Record<string, unknown>;
  if (result?.error === 'pin_not_found') {
    return jsonError(404, ErrorCodes.NOT_FOUND, 'Pin not found');
  }
  if (result?.error === 'reason_required') {
    return jsonError(400, ErrorCodes.VALIDATION_ERROR, 'reason is required for rejection');
  }
  if (result?.error === 'invalid_action') {
    return jsonError(400, ErrorCodes.VALIDATION_ERROR, 'action must be approve or reject');
  }

  return jsonOk(result);
});
