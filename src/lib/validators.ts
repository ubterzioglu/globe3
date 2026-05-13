const VALID_PIN_TYPES = ['person', 'business', 'ngo', 'creator', 'event'] as const;

export function validateDisplayName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2) return 'Display name must be at least 2 characters';
  if (trimmed.length > 120) return 'Display name must be at most 120 characters';
  return null;
}

export function validateDescription(value: string): string | null {
  if (value.length > 2000) return 'Description must be at most 2000 characters';
  return null;
}

export function validatePinType(value: string): string | null {
  if (!VALID_PIN_TYPES.includes(value as (typeof VALID_PIN_TYPES)[number])) {
    return 'Invalid pin type';
  }
  return null;
}

export function validateSelectedPlace(place: unknown): string | null {
  if (!place) return 'Please select a city';
  return null;
}
