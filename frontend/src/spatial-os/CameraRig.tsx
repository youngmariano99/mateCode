/**
 * CameraRig.tsx
 * ---------------------------------------------------------------------------
 *  Smoothly interpolates the camera between two presets:
 *    - "top"        → orthographic-like top-down 2D blueprint view
 *    - "isometric"  → 2.5D / 3D corporate isometric perspective
 *
 *  We use a perspective camera and animate position + lookAt in useFrame.
 *  OrbitControls is disabled while transitioning, then re-enabled in iso mode.
 * ---------------------------------------------------------------------------
 */
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export type ViewMode = "top" | "isometric";

const PRESETS: Record<ViewMode, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
  top: {
    pos: new THREE.Vector3(0, 55, 0.001),
    target: new THREE.Vector3(0, 0, 0),
  },
  isometric: {
    pos: new THREE.Vector3(28, 26, 28),
    target: new THREE.Vector3(0, 0, 0),
  },
};

export function CameraRig({ mode }: { mode: ViewMode }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPos = useRef(PRESETS[mode].pos.clone());
  const targetLook = useRef(PRESETS[mode].target.clone());
  const currentLook = useRef(PRESETS[mode].target.clone());

  useEffect(() => {
    targetPos.current.copy(PRESETS[mode].pos);
    targetLook.current.copy(PRESETS[mode].target);
  }, [mode]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.18);
    currentLook.current.lerp(targetLook.current, 0.18);
    camera.lookAt(currentLook.current);
    if (controlsRef.current) {
      controlsRef.current.target.copy(currentLook.current);
      controlsRef.current.enabled = mode === "isometric";
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableRotate
      enableZoom
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={10}
      maxDistance={70}
    />
  );
}
