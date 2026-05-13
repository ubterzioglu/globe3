import { corsHeaders } from './cors.ts';

export function jsonOk(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ data, error: null }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export function jsonError(status: number, code: string, message: string): Response {
  return new Response(
    JSON.stringify({ data: null, error: { code, message } }),
    { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
  );
}
