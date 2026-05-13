import { describe, it, expect } from 'vitest';
import { latLngTo3D, targetRotationFromLatLng } from '@/features/globe/geometry';

describe('latLngTo3D', () => {
  it('returns correct position for equator at longitude 0', () => {
    const result = latLngTo3D(0, 0, 1);
    expect(result.x).toBeCloseTo(1, 4);
    expect(result.y).toBeCloseTo(0, 4);
    expect(result.z).toBeCloseTo(0, 4);
  });

  it('returns correct position for north pole (90, 0)', () => {
    const result = latLngTo3D(90, 0, 1);
    expect(result.x).toBeCloseTo(0, 4);
    expect(result.y).toBeCloseTo(1, 4);
    expect(result.z).toBeCloseTo(0, 4);
  });

  it('returns correct position for south pole (-90, 0)', () => {
    const result = latLngTo3D(-90, 0, 1);
    expect(result.x).toBeCloseTo(0, 4);
    expect(result.y).toBeCloseTo(-1, 4);
    expect(result.z).toBeCloseTo(0, 4);
  });

  it('scales with radius', () => {
    const r1 = latLngTo3D(45, 90, 1);
    const r2 = latLngTo3D(45, 90, 2);
    expect(r2.x).toBeCloseTo(r1.x * 2, 4);
    expect(r2.y).toBeCloseTo(r1.y * 2, 4);
    expect(r2.z).toBeCloseTo(r1.z * 2, 4);
  });

  it('returns Vector3 instance', () => {
    const result = latLngTo3D(30, 60, 1);
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).toHaveProperty('z');
  });

  it('handles negative longitude', () => {
    const result = latLngTo3D(0, -180, 1);
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(typeof result.z).toBe('number');
  });
});

describe('targetRotationFromLatLng', () => {
  it('returns x and y properties', () => {
    const result = targetRotationFromLatLng(40, 30);
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
  });

  it('returns different rotations for different coords', () => {
    const r1 = targetRotationFromLatLng(0, 0);
    const r2 = targetRotationFromLatLng(45, 90);
    expect(r1.x).not.toBeCloseTo(r2.x, 2);
    expect(r1.y).not.toBeCloseTo(r2.y, 2);
  });
});
