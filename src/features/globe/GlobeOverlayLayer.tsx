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
  interactive: boolean;
  opacity: number;
  baseX: number;
  baseY: number;
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
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
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

    const rawProjectedPins: ProjectedPin[] = [];

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
      const opacity = Math.max(0, Math.min(1, (dotProduct + 0.18) / 0.34));
      const visible = opacity > 0.02;
      const interactive = dotProduct > 0.035;

      const projected = rotatedPos.clone().project(camera);

      const x = projected.x * halfW + halfW;
      const y = -projected.y * halfH + halfH;

      rawProjectedPins.push({ pin, x, y, visible, interactive, opacity, baseX: x, baseY: y });
    }

    setProjectedPins(distributeProjectedPins(rawProjectedPins, selectedPinId));
  }, [pins, camera, earthRotationX, earthRotationY, containerWidth, containerHeight, selectedPinId]);

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
    <div className="globe-overlay-layer" onClick={() => setSelectedPinId(null)} role="presentation">
      {projectedPins.map((p) => (
        <GlobePin
          key={p.pin.id}
          pin={p.pin}
          x={p.x}
          y={p.y}
          visible={p.visible}
          opacity={p.opacity}
          interactive={p.interactive}
          selected={selectedPinId === p.pin.id}
          onSelect={(pinId) => setSelectedPinId((current) => (current === pinId ? null : pinId))}
        />
      ))}
    </div>
  );
}

function distributeProjectedPins(
  pins: ProjectedPin[],
  selectedPinId: string | null,
): ProjectedPin[] {
  const visiblePins = pins.filter((pin) => pin.visible);
  const hiddenPins = pins.filter((pin) => !pin.visible);
  const assigned = new Set<string>();
  const clusters: ProjectedPin[][] = [];
  const threshold = 22;

  for (const pin of visiblePins) {
    if (assigned.has(pin.pin.id)) continue;

    const cluster = visiblePins.filter((candidate) => {
      if (assigned.has(candidate.pin.id)) return false;
      return Math.hypot(candidate.baseX - pin.baseX, candidate.baseY - pin.baseY) <= threshold;
    });

    cluster.forEach((item) => assigned.add(item.pin.id));
    clusters.push(cluster);
  }

  const adjusted = clusters.flatMap((cluster) => {
    if (cluster.length <= 1) return cluster;

    const anchor = (selectedPinId
      ? cluster.find((item) => item.pin.id === selectedPinId) ?? cluster[0]
      : cluster[0])!;

    const others = cluster.filter((item) => item.pin.id !== anchor.pin.id);
    const radius = Math.min(18 + cluster.length * 2, 34);

    return [
      anchor,
      ...others.map((item, index) => {
        const angle = (index / Math.max(others.length, 1)) * Math.PI * 2 - Math.PI / 2;
        return {
          ...item,
          x: item.baseX + Math.cos(angle) * radius,
          y: item.baseY + Math.sin(angle) * radius,
        };
      }),
    ];
  });

  return [...adjusted, ...hiddenPins];
}
