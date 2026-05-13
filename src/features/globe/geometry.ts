import * as THREE from 'three';

export const TEXTURE_Y_OFFSET = 0;

export function latLngTo3D(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

export function targetRotationFromLatLng(lat: number, lng: number): { x: number; y: number } {
  const pos = latLngTo3D(lat, lng, 1);

  const ry = Math.atan2(-pos.x, pos.z);
  const zPrime = -pos.x * Math.sin(ry) + pos.z * Math.cos(ry);
  const rx = Math.atan2(pos.y, zPrime);

  return {
    x: rx,
    y: ry + TEXTURE_Y_OFFSET,
  };
}

export function shortestAngleDelta(from: number, to: number): number {
  let delta = to - from;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
}
