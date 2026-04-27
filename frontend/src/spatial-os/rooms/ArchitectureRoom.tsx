/**
 * ArchitectureRoom.tsx — PRODUCTION · Estudio de Arquitectura (Fase 2)
 * ---------------------------------------------------------------------------
 *  Tilted drafting tables, blueprint shelves, and a holographic 3D model
 *  pedestal. Accent: cyan.
 * ---------------------------------------------------------------------------
 */
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("architecture")!;

function DraftingTable({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Tilted board */}
      <mesh position={[0, 0.95, 0]} rotation={[-0.4, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 1.0]} />
        <meshStandardMaterial color="#f4f6f8" roughness={0.35} />
      </mesh>
      {/* Blueprint accent on board */}
      <mesh position={[0, 0.96, 0]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.2, 0.001, 0.85]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.35} />
      </mesh>
      {/* Support frame */}
      <mesh position={[-0.5, 0.45, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.05, 0.9, 0.05]} />
        <meshStandardMaterial color="#1a1f29" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.5, 0.45, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.05, 0.9, 0.05]} />
        <meshStandardMaterial color="#1a1f29" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#1a1f29" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Stool */}
      <mesh position={[0, 0.45, 0.9]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 20]} />
        <meshStandardMaterial color="#2a313a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.22, 0.9]}>
        <cylinderGeometry args={[0.04, 0.05, 0.45, 12]} />
        <meshStandardMaterial color="#0e1116" metalness={0.7} />
      </mesh>
    </group>
  );
}

export function ArchitectureRoom() {
  return (
    <RoomShell room={room}>
      {/* Four drafting tables in two pairs */}
      <DraftingTable position={[-2, 0, -1.5]} rotation={0} />
      <DraftingTable position={[0, 0, -1.5]} rotation={0} />
      <DraftingTable position={[2, 0, -1.5]} rotation={0} />
      <DraftingTable position={[-1.5, 0, 1.8]} rotation={Math.PI} />
      <DraftingTable position={[1.5, 0, 1.8]} rotation={Math.PI} />

      {/* Central holographic 3D model pedestal */}
      <mesh position={[0, 0.4, 0.3]} castShadow>
        <cylinderGeometry args={[0.45, 0.55, 0.8, 24]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Hologram cone */}
      <mesh position={[0, 1.2, 0.3]}>
        <coneGeometry args={[0.4, 0.8, 4]} />
        <meshStandardMaterial
          color={room.accent}
          emissive={room.accent}
          emissiveIntensity={1.4}
          transparent
          opacity={0.45}
          wireframe
        />
      </mesh>

      <pointLight position={[0, 2.5, 0.3]} color={room.accent} intensity={0.9} distance={7} />
    </RoomShell>
  );
}
