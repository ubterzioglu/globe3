import { useState, useCallback, useRef } from 'react';
import type { FlyToCoordsInput, GlobeController } from './globeTypes';

export function useGlobeController(): {
  targetRotation: { x: number; y: number } | null;
  controller: GlobeController;
} {
  const [targetRotation, setTargetRotation] = useState<{ x: number; y: number } | null>(null);
  const animatingRef = useRef(false);

  const flyToCoords = useCallback((input: FlyToCoordsInput) => {
    if (animatingRef.current) return;

    const phi = (90 - input.lat) * (Math.PI / 180);
    const theta = (input.lng + 180) * (Math.PI / 180);

    setTargetRotation({
      x: phi - Math.PI / 2,
      y: -theta + Math.PI,
    });

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
