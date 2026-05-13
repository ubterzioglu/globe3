import { describe, it, expect } from 'vitest';
import { latLngTo3D, targetRotationFromLatLng, shortestAngleDelta } from '@/features/globe/geometry';

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

describe('targetRotationFromLatLng (corrected)', () => {
  it('rotates lat=0 lng=0 to face camera (+Z)', () => {
    const { x, y } = targetRotationFromLatLng(0, 0);
    const pos = latLngTo3D(0, 0, 1);
    const cosY = Math.cos(y), sinY = Math.sin(y);
    const cosX = Math.cos(x), sinX = Math.sin(x);
    const rx = pos.x * cosY + pos.z * sinY;
    const rz1 = -pos.x * sinY + pos.z * cosY;
    const fy = pos.y * cosX - rz1 * sinX;
    const fz = pos.y * sinX + rz1 * cosX;
    expect(rx).toBeCloseTo(0, 2);
    expect(fy).toBeCloseTo(0, 2);
    expect(fz).toBeCloseTo(1, 2);
  });

  it('rotates Berlin to face camera', () => {
    const { x, y } = targetRotationFromLatLng(52.52, 13.405);
    const pos = latLngTo3D(52.52, 13.405, 1);
    const cosY = Math.cos(y), sinY = Math.sin(y);
    const cosX = Math.cos(x), sinX = Math.sin(x);
    const rx = pos.x * cosY + pos.z * sinY;
    const rz1 = -pos.x * sinY + pos.z * cosY;
    const fy = pos.y * cosX - rz1 * sinX;
    const fz = pos.y * sinX + rz1 * cosX;
    expect(rx).toBeCloseTo(0, 2);
    expect(fy).toBeCloseTo(0, 2);
    expect(fz).toBeCloseTo(1, 2);
  });

  it('rotates Sydney to face camera', () => {
    const { x, y } = targetRotationFromLatLng(-33.87, 151.21);
    const pos = latLngTo3D(-33.87, 151.21, 1);
    const cosY = Math.cos(y), sinY = Math.sin(y);
    const cosX = Math.cos(x), sinX = Math.sin(x);
    const rx = pos.x * cosY + pos.z * sinY;
    const rz1 = -pos.x * sinY + pos.z * cosY;
    const fy = pos.y * cosX - rz1 * sinX;
    const fz = pos.y * sinX + rz1 * cosX;
    expect(rx).toBeCloseTo(0, 2);
    expect(fy).toBeCloseTo(0, 2);
    expect(fz).toBeCloseTo(1, 2);
  });
});

describe('shortestAngleDelta', () => {
  it('returns small delta for close angles', () => {
    expect(shortestAngleDelta(0.1, 0.2)).toBeCloseTo(0.1, 4);
  });

  it('wraps around PI boundary', () => {
    const delta = shortestAngleDelta(Math.PI - 0.1, -Math.PI + 0.1);
    expect(Math.abs(delta)).toBeLessThan(0.3);
  });

  it('prefers positive direction when shorter', () => {
    const delta = shortestAngleDelta(0, 0.5);
    expect(delta).toBeCloseTo(0.5, 4);
  });

  it('prefers negative direction when shorter', () => {
    const delta = shortestAngleDelta(0, Math.PI * 1.9);
    expect(delta).toBeLessThan(0);
    expect(delta).toBeCloseTo(-(Math.PI * 0.1), 4);
  });
});
