import { jsonError } from './json.ts';
import { ErrorCodes } from './errors.ts';

const VALID_PIN_TYPES = ['person', 'business', 'ngo', 'creator', 'event'] as const;

export function validatePinType(value: unknown): string | null {
  if (typeof value !== 'string' || !VALID_PIN_TYPES.includes(value as (typeof VALID_PIN_TYPES)[number])) {
    return 'pinType must be one of: person, business, ngo, creator, event';
  }
  return null;
}

export function validateDisplayName(value: unknown): string | null {
  if (typeof value !== 'string') return 'displayName must be a string';
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 120) {
    return 'displayName must be between 2 and 120 characters';
  }
  return null;
}

export function validateDescription(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return 'description must be a string';
  if (value.length > 2000) return 'description must be at most 2000 characters';
  return null;
}

export function validatePlaceId(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'placeId is required';
  }
  return null;
}

export async function safeJson<T>(req: Request): Promise<{ data: T | null; response?: Response }> {
  try {
    const body = await req.json();
    return { data: body as T };
  } catch {
    return { data: null, response: jsonError(400, ErrorCodes.INVALID_BODY, 'Invalid JSON body') };
  }
}
