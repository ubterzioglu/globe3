import { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import {
  EARTH_RADIUS,
  ATMOSPHERE_RADIUS,
  CAMERA_DISTANCE,
  CAMERA_FOV,
  EARTH_TEXTURE_DAY,
  AUTO_ROTATION_SPEED,
  ZOOM_MIN,
  ZOOM_MAX,
} from './globeVisualConfig';
import { shortestAngleDelta } from './geometry';
import type { GlobePinItem } from './globeTypes';
import { GlobeOverlayLayer } from './GlobeOverlayLayer';
import './GlobeScene.css';

interface GlobeSceneProps {
  pins: GlobePinItem[];
  targetRotation: { x: number; y: number } | null;
  onFlyComplete?: () => void;
}

export function GlobeScene({ pins, targetRotation, onFlyComplete }: GlobeSceneProps) {
  const MAX_PITCH = Math.PI / 2.8;
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    earth: THREE.Mesh;
    animationId: number;
  } | null>(null);

  const rotationX = useRef(0);
  const rotationY = useRef(0);
  const autoRotate = useRef(true);
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const cameraDistance = useRef(CAMERA_DISTANCE);
  const targetCameraDistance = useRef(CAMERA_DISTANCE);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [currentRotationX, setCurrentRotationX] = useState(0);
  const [currentRotationY, setCurrentRotationY] = useState(0);

  const init = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 100);
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
    scene.add(ambientLight);

    scene.add(createStarLayer(900, 18, 0xffffff, 0.8, 0.04));
    scene.add(createStarLayer(240, 24, 0x8fb9ff, 1.4, 0.06));

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3a5c,
      roughness: 0.8,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      EARTH_TEXTURE_DAY,
      (texture) => {
        earthMaterial.map = texture;
        earthMaterial.color.set(0xffffff);
        earthMaterial.needsUpdate = true;
      },
      undefined,
      () => {},
    );

    const atmosphereGeometry = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f8cff,
      transparent: true,
      opacity: 0.045,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      earth,
      animationId: 0,
    };

    setCamera(camera);
    setContainerSize({ width, height });
  }, []);

  useEffect(() => {
    init();

    const ref = sceneRef.current;
    if (!ref) return;

    let sizeUpdateCounter = 0;

    const animate = () => {
      ref.animationId = requestAnimationFrame(animate);

      if (autoRotate.current && !isDragging.current) {
        rotationY.current += AUTO_ROTATION_SPEED * 0.01;
      }

      ref.earth.rotation.x = rotationX.current;
      ref.earth.rotation.y = rotationY.current;

      const diff = targetCameraDistance.current - cameraDistance.current;
      cameraDistance.current += diff * 0.05;
      ref.camera.position.z = cameraDistance.current;

      ref.renderer.render(ref.scene, ref.camera);

      sizeUpdateCounter++;
      if (sizeUpdateCounter % 3 === 0) {
        setCurrentRotationX(rotationX.current);
        setCurrentRotationY(rotationY.current);
      }
    };

    animate();

    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !ref) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      ref.camera.aspect = w / h;
      ref.camera.updateProjectionMatrix();
      ref.renderer.setSize(w, h);
      setContainerSize({ width: w, height: h });
    };

    window.addEventListener('resize', handleResize);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', (e: MouseEvent) => {
        isDragging.current = true;
        autoRotate.current = false;
        previousMouse.current = { x: e.clientX, y: e.clientY };
      });

      container.addEventListener('mousemove', (e: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - previousMouse.current.x;
        const dy = e.clientY - previousMouse.current.y;
        rotationY.current += dx * 0.005;
        rotationX.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, rotationX.current + dy * 0.005));
        previousMouse.current = { x: e.clientX, y: e.clientY };
      });

      container.addEventListener('mouseup', () => {
        isDragging.current = false;
        setTimeout(() => { autoRotate.current = true; }, 3000);
      });

      container.addEventListener('mouseleave', () => {
        isDragging.current = false;
        setTimeout(() => { autoRotate.current = true; }, 3000);
      });

      container.addEventListener('wheel', (e: WheelEvent) => {
        e.preventDefault();
        targetCameraDistance.current = Math.max(
          ZOOM_MIN,
          Math.min(ZOOM_MAX, targetCameraDistance.current + e.deltaY * 0.002),
        );
      }, { passive: false });

      container.addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length === 1) {
          isDragging.current = true;
          autoRotate.current = false;
          previousMouse.current = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY };
        }
      });

      container.addEventListener('touchmove', (e: TouchEvent) => {
        if (!isDragging.current || e.touches.length !== 1) return;
        const dx = e.touches[0]!.clientX - previousMouse.current.x;
        const dy = e.touches[0]!.clientY - previousMouse.current.y;
        rotationY.current += dx * 0.005;
        rotationX.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, rotationX.current + dy * 0.005));
        previousMouse.current = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY };
      });

      container.addEventListener('touchend', () => {
        isDragging.current = false;
        setTimeout(() => { autoRotate.current = true; }, 3000);
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ref) {
        cancelAnimationFrame(ref.animationId);
        ref.renderer.dispose();
        ref.renderer.domElement.remove();
      }
    };
  }, [init]);

  useEffect(() => {
    if (!targetRotation || !sceneRef.current) return;

    const startX = rotationX.current;
    const startY = rotationY.current;
    const endX = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, targetRotation.x));
    const endY = targetRotation.y;

    const deltaY = shortestAngleDelta(startY, endY);
    const actualEndY = startY + deltaY;

    const duration = 1500;
    const startTime = performance.now();

    autoRotate.current = false;

    function animateFly(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      rotationX.current = startX + (endX - startX) * eased;
      rotationY.current = startY + deltaY * eased;

      if (progress < 1) {
        requestAnimationFrame(animateFly);
      } else {
        rotationY.current = actualEndY;
        setTimeout(() => { autoRotate.current = true; }, 2000);
        onFlyComplete?.();
      }
    }

    requestAnimationFrame(animateFly);
  }, [targetRotation, onFlyComplete]);

  return (
    <div className="globe-scene-wrapper">
      <div ref={containerRef} className="globe-scene" />
      <GlobeOverlayLayer
        pins={pins}
        camera={camera}
        earthRotationX={currentRotationX}
        earthRotationY={currentRotationY}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
      />
    </div>
  );
}

function createStarLayer(count: number, radius: number, color: number, size: number, opacity: number): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius + Math.random() * 8;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}
