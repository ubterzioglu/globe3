import { jsonError } from './json.ts';
import { ErrorCodes } from './errors.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
}

function getSupabaseAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

export async function requireUser(req: Request): Promise<{ user: { id: string; email?: string }; response?: Response }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { user: { id: '' }, response: jsonError(401, ErrorCodes.UNAUTHENTICATED, 'Missing Authorization header') };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { user: { id: '' }, response: jsonError(401, ErrorCodes.UNAUTHENTICATED, 'Invalid or expired token') };
  }

  return { user: data.user };
}

export async function getOptionalUser(req: Request): Promise<{ id: string; email?: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function requireAdmin(req: Request): Promise<{ user: { id: string; email?: string; role?: string }; response?: Response }> {
  const result = await requireUser(req);
  if (result.response) return result as { user: { id: string; email?: string; role?: string }; response: Response };

  const role = (result.user as Record<string, unknown>).app_metadata
    ? ((result.user as Record<string, unknown>).app_metadata as Record<string, unknown>).role as string | undefined
    : undefined;

  if (role !== 'admin') {
    return { user: result.user, response: jsonError(403, ErrorCodes.FORBIDDEN, 'Admin access required') };
  }

  return { user: { ...result.user, role } };
}

export { getSupabaseClient, getSupabaseAdminClient };
