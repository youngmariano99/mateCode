/**
 * CameraRig.tsx
 * ---------------------------------------------------------------------------
 *  Smoothly interpolates the camera between two presets and arbitrates control
 *  between SCRIPTED motion (lerp to a preset) and FREE user navigation
 *  (OrbitControls). This is the only place camera state is driven.
 *
 *  ──────────────────────────────────────────────────────────────────────────
 *  PROPS
 *  ──────────────────────────────────────────────────────────────────────────
 *  - mode  : "top" | "isometric"
 *  - locked : boolean
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

interface CameraRigProps {
  mode: ViewMode;
  locked: boolean;
}

export function CameraRig({ mode, locked }: CameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPos = useRef(PRESETS[mode].pos.clone());
  const targetLook = useRef(PRESETS[mode].target.clone());
  const currentLook = useRef(PRESETS[mode].target.clone());
  const transitioningRef = useRef(false);

  useEffect(() => {
    targetPos.current.copy(PRESETS[mode].pos);
    targetLook.current.copy(PRESETS[mode].target);
    transitioningRef.current = true;
    const t = setTimeout(() => {
      transitioningRef.current = false;
    }, 700);
    return () => clearTimeout(t);
  }, [mode]);

  const effectiveLocked = locked || mode === "top";

  useFrame(() => {
    const shouldDrive = effectiveLocked || transitioningRef.current;

    if (shouldDrive) {
      camera.position.lerp(targetPos.current, 0.18);
      currentLook.current.lerp(targetLook.current, 0.18);
      camera.lookAt(currentLook.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(currentLook.current);
      }
    }

    if (controlsRef.current) {
      controlsRef.current.enabled =
        mode === "isometric" && !locked && !transitioningRef.current;
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
      minDistance={6}
      maxDistance={90}
    />
  );
}
