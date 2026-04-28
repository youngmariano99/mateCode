/**
 * Avatar.tsx (v0.2 — Holographic Map Pin)
 * ---------------------------------------------------------------------------
 *  Tall, highly-visible "map pin" avatar designed to float ABOVE eye level so
 *  the user is identifiable from any orbit angle, even when their physical
 *  location sits behind a 3-meter wall.
 *
 *  Features:
 *  - SHAPE: Elevated holographic CRYSTAL (octahedron) ~2.4m above the floor.
 *  - X-RAY OUTLINE: Silhouette remains visible through walls using depthTest={false}.
 *  - HIGH LABEL: Name tag sits at y=3.5m, above the building walls.
 * ---------------------------------------------------------------------------
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export interface AvatarProps {
  /** World position where the pin's tip lands on the floor. Drive from backend. */
  position: [number, number, number];
  /** Display name shown in the floating label. */
  name: string;
  /** Glow color for the crystal, beam, and label accent. */
  color?: string;
}

const PIN_HEIGHT = 2.4; // meters above floor where the crystal floats
const LABEL_HEIGHT = 3.5; // above the 3m wall height so labels never get clipped

export function Avatar({ position, name, color = "#3b82f6" }: AvatarProps) {
  const crystalRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const xrayRef = useRef<THREE.Mesh>(null);

  // Idle bob + crystal spin + halo pulse
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * 0.6;
      crystalRef.current.position.y = PIN_HEIGHT + Math.sin(t * 1.4 + position[0]) * 0.08;
    }
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.2 + Math.sin(t * 2.2 + position[2]) * 0.5;
    }
    if (xrayRef.current) {
      xrayRef.current.rotation.y = (crystalRef.current?.rotation.y ?? 0);
      xrayRef.current.position.y = (crystalRef.current?.position.y ?? PIN_HEIGHT);
    }
  });

  return (
    <group position={position}>
      {/* Floor halo ring */}
      <mesh ref={haloRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.6, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* Soft floor disc */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.18} toneMapped={false} />
      </mesh>

      {/* Vertical energy beam */}
      <mesh position={[0, PIN_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.04, PIN_HEIGHT, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.55} toneMapped={false} />
      </mesh>

      {/* Pin tip */}
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.12, 0.32, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} metalness={0.4} roughness={0.25} toneMapped={false} />
      </mesh>

      {/* Holographic crystal */}
      <group ref={crystalRef} position={[0, PIN_HEIGHT, 0]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.34, 0]} />
          <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={1.4} metalness={0.6} roughness={0.15} transparent opacity={0.92} toneMapped={false} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.46, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} wireframe transparent opacity={0.85} toneMapped={false} />
        </mesh>
      </group>

      {/* X-RAY OUTLINE */}
      <mesh ref={xrayRef} position={[0, PIN_HEIGHT, 0]} renderOrder={2}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.BackSide} depthTest={false} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Floating label */}
      <Html position={[0, LABEL_HEIGHT, 0]} center distanceFactor={9} zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999,
          background: "rgba(5, 7, 11, 0.82)", border: `1px solid ${color}`, color: "#fff",
          font: "600 11px/1 -apple-system, system-ui, sans-serif", letterSpacing: 0.3,
          whiteSpace: "nowrap", boxShadow: `0 0 14px ${color}66`, backdropFilter: "blur(6px)",
          textShadow: `0 0 6px ${color}88`
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: color, boxShadow: `0 0 8px ${color}` }} />
          {name}
        </div>
      </Html>
    </group>
  );
}
