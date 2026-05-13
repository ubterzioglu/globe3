import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { latLngTo3D } from './geometry';
import { EARTH_RADIUS } from './globeVisualConfig';
import type { GlobePinItem } from './globeTypes';
import { GlobePin } from './GlobePin';

interface ProjectedPin {
  pin: GlobePinItem;
  x: number;
  y: number;
  visible: boolean;
}

interface GlobeOverlayLayerProps {
  pins: GlobePinItem[];
  camera: THREE.PerspectiveCamera | null;
  earthRotationX: number;
  earthRotationY: number;
  containerWidth: number;
  containerHeight: number;
}

export function GlobeOverlayLayer({
  pins,
  camera,
  earthRotationX,
  earthRotationY,
  containerWidth,
  containerHeight,
}: GlobeOverlayLayerProps) {
  const [projectedPins, setProjectedPins] = useState<ProjectedPin[]>([]);
  const frameRef = useRef<number>(0);

  const projectPins = useCallback(() => {
    if (!camera || containerWidth === 0 || containerHeight === 0) {
      setProjectedPins([]);
      return;
    }

    const halfW = containerWidth / 2;
    const halfH = containerHeight / 2;

    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    const camWorldPos = new THREE.Vector3();
    camera.getWorldPosition(camWorldPos);

    const earthCenter = new THREE.Vector3(0, 0, 0);
    const toCamera = new THREE.Vector3().subVectors(camWorldPos, earthCenter).normalize();

    const result: ProjectedPin[] = [];

    for (const pin of pins) {
      const pos3D = latLngTo3D(pin.lat, pin.lng, EARTH_RADIUS + 0.005);

      const rotatedPos = pos3D.clone();
      const cosX = Math.cos(earthRotationX);
      const sinX = Math.sin(earthRotationX);
      const cosY = Math.cos(earthRotationY);
      const sinY = Math.sin(earthRotationY);

      const py = rotatedPos.y;
      const pz = rotatedPos.z;
      rotatedPos.y = py * cosX - pz * sinX;
      rotatedPos.z = py * sinX + pz * cosX;

      const rx = rotatedPos.x;
      const rz = rotatedPos.z;
      rotatedPos.x = rx * cosY + rz * sinY;
      rotatedPos.z = -rx * sinY + rz * cosY;

      const dotProduct = rotatedPos.dot(toCamera);
      const visible = dotProduct > 0.05;

      const projected = rotatedPos.clone().project(camera);

      const x = projected.x * halfW + halfW;
      const y = -projected.y * halfH + halfH;

      result.push({ pin, x, y, visible });
    }

    setProjectedPins(result);
  }, [pins, camera, earthRotationX, earthRotationY, containerWidth, containerHeight]);

  useEffect(() => {
    projectPins();
  }, [projectPins]);

  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      projectPins();
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [projectPins]);

  return (
    <div className="globe-overlay-layer">
      {projectedPins.map((p) => (
        <GlobePin
          key={p.pin.id}
          pin={p.pin}
          x={p.x}
          y={p.y}
          visible={p.visible}
        />
      ))}
    </div>
  );
}
