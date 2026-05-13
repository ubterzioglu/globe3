import { handleOptions } from '../_shared/cors.ts';
import { jsonOk, jsonError } from '../_shared/json.ts';
import { ErrorCodes } from '../_shared/errors.ts';
import { requireAdmin, getSupabaseAdminClient } from '../_shared/auth.ts';
import { checkRateLimit, getRateLimitKey, extractClientIdentifier, rateLimitResponse } from '../_shared/rateLimit.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    const { corsHeaders: ch } = await import('../_shared/cors.ts');
    return new Response(null, { status: 204, headers: ch });
  }
  if (req.method !== 'GET') {
    return jsonError(405, 'method_not_allowed', 'Only GET is allowed');
  }

  const { user, response: authErr } = await requireAdmin(req);
  if (authErr) return authErr;

  const clientId = extractClientIdentifier(req, user.id);
  const rlKey = getRateLimitKey('admin-pins', clientId);
  if (!checkRateLimit(rlKey, { maxRequests: 120, windowMs: 3_600_000 })) {
    return rateLimitResponse();
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? 'pending';
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '50'), 1), 100);
  const cursor = url.searchParams.get('cursor') ?? null;

  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return jsonError(400, ErrorCodes.VALIDATION_ERROR, 'status must be pending, approved, or rejected');
  }

  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from('pins')
    .select('id, pin_type, display_name, description, city, country, country_code, lat, lng, status, rejection_reason, created_at, user_id')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    const { data: cursorPin } = await supabase
      .from('pins')
      .select('created_at')
      .eq('id', cursor)
      .single();

    if (cursorPin) {
      query = query.lt('created_at', cursorPin.created_at);
    }
  }

  const { data, error } = await query;

  if (error) {
    return jsonError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to fetch pins');
  }

  const items = (data ?? []).slice(0, limit);
  const hasNext = (data ?? []).length > limit;
  const nextCursor = hasNext && items.length > 0 ? items[items.length - 1]!.id : null;

  return jsonOk({ items, nextCursor });
});
