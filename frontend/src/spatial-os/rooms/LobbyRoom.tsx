/**
 * LobbyRoom.tsx
 * ---------------------------------------------------------------------------
 *  Lobby / Spawn Point — the room every new user materializes into before
 *  walking east into the central corridor.
 * ---------------------------------------------------------------------------
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const ACCENT = "#f1f5f9";

function SpawnPad() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const m = ringRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 1.6 + Math.sin(clock.getElapsedTime() * 1.4) * 0.6;
  });
  return (
    <group position={[0, 0, 0]}>
      {/* Outer halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[1.8, 64]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.25}
          transparent
          opacity={0.22}
          toneMapped={false}
        />
      </mesh>
      {/* Pulsing main ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.018, 0]}
      >
        <ringGeometry args={[1.15, 1.45, 96]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={1.8}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* Inner solid disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.0, 64]} />
        <meshStandardMaterial
          color="#cbd5e1"
          emissive={ACCENT}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
      {/* Inner accent ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.024, 0]}>
        <ringGeometry args={[0.55, 0.62, 64]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={1.2}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* Vertical light beam */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 3, 12]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={1.4}
          transparent
          opacity={0.45}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Bench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.12, 0.55]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[-0.95, 0.21, 0]} castShadow>
        <boxGeometry args={[0.08, 0.42, 0.5]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.95, 0.21, 0]} castShadow>
        <boxGeometry args={[0.08, 0.42, 0.5]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[2.2, 0.02, 0.04]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

function DirectionArrow() {
  return (
    <group position={[2.5, 0.014, 0]}>
      {[0, 0.55, 1.1].map((dx, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[dx, 0, 0]}>
          <ringGeometry args={[0.16, 0.22, 4, 1, 0, Math.PI / 2]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.9 + i * 0.2} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function LobbyRoom() {
  const room = getRoom("lobby");
  if (!room) return null;
  return (
    <RoomShell room={room}>
      <SpawnPad />
      <Bench position={[0, 0, -6]} rotationY={0} />
      <Bench position={[0, 0, 6]} rotationY={0} />
      <DirectionArrow />
      <pointLight position={[0, 2.6, 0]} intensity={1.2} distance={9} color={ACCENT} castShadow={false} />
    </RoomShell>
  );
}
