import { describe, it, expect } from 'vitest';
import { validateDisplayName, validateDescription, validatePinType, validateSelectedPlace } from '@/lib/validators';

describe('validateDisplayName', () => {
  it('rejects empty string', () => {
    expect(validateDisplayName('')).not.toBeNull();
  });

  it('rejects whitespace-only string', () => {
    expect(validateDisplayName('   ')).not.toBeNull();
  });

  it('rejects single character', () => {
    expect(validateDisplayName('a')).not.toBeNull();
  });

  it('accepts 2 characters', () => {
    expect(validateDisplayName('ab')).toBeNull();
  });

  it('accepts trimmed value', () => {
    expect(validateDisplayName('  John  ')).toBeNull();
  });

  it('rejects over 120 characters', () => {
    expect(validateDisplayName('a'.repeat(121))).not.toBeNull();
  });

  it('accepts exactly 120 characters', () => {
    expect(validateDisplayName('a'.repeat(120))).toBeNull();
  });
});

describe('validateDescription', () => {
  it('accepts empty string', () => {
    expect(validateDescription('')).toBeNull();
  });

  it('accepts normal text', () => {
    expect(validateDescription('A normal description')).toBeNull();
  });

  it('rejects over 2000 characters', () => {
    expect(validateDescription('x'.repeat(2001))).not.toBeNull();
  });

  it('accepts exactly 2000 characters', () => {
    expect(validateDescription('x'.repeat(2000))).toBeNull();
  });
});

describe('validatePinType', () => {
  it('accepts valid types', () => {
    const validTypes = ['person', 'business', 'ngo', 'creator', 'event'];
    for (const t of validTypes) {
      expect(validatePinType(t)).toBeNull();
    }
  });

  it('rejects invalid type', () => {
    expect(validatePinType('invalid')).not.toBeNull();
  });

  it('rejects empty string', () => {
    expect(validatePinType('')).not.toBeNull();
  });
});

describe('validateSelectedPlace', () => {
  it('rejects null', () => {
    expect(validateSelectedPlace(null)).not.toBeNull();
  });

  it('rejects undefined', () => {
    expect(validateSelectedPlace(undefined)).not.toBeNull();
  });

  it('accepts an object', () => {
    expect(validateSelectedPlace({ id: 'test' })).toBeNull();
  });
});
