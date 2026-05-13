export const ErrorCodes = {
  INVALID_BODY: 'invalid_body',
  VALIDATION_ERROR: 'validation_error',
  UNAUTHENTICATED: 'unauthenticated',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  PLACE_NOT_CITY_LEVEL: 'place_not_city_level',
  PLACE_NOT_FOUND: 'place_not_found',
  RATE_LIMITED: 'rate_limited',
  GOOGLE_UPSTREAM_ERROR: 'google_upstream_error',
  DB_INSERT_FAILED: 'db_insert_failed',
  INTERNAL_ERROR: 'internal_error',
} as const;
