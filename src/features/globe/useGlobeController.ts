import { useState, useCallback, useRef } from 'react';
import type { FlyToCoordsInput, GlobeController } from './globeTypes';
import { targetRotationFromLatLng } from './geometry';

export function useGlobeController(): {
  targetRotation: { x: number; y: number } | null;
  controller: GlobeController;
} {
  const [targetRotation, setTargetRotation] = useState<{ x: number; y: number } | null>(null);
  const animatingRef = useRef(false);

  const flyToCoords = useCallback((input: FlyToCoordsInput) => {
    if (animatingRef.current) return;

    setTargetRotation(targetRotationFromLatLng(input.lat, input.lng));

    animatingRef.current = true;
    setTimeout(() => {
      animatingRef.current = false;
    }, input.duration ?? 1500);
  }, []);

  return {
    targetRotation,
    controller: { flyToCoords },
  };
}
