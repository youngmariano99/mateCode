/**
 * DnaLabRoom.tsx — PRODUCTION · Laboratorio de ADN (Fase 0)
 * ---------------------------------------------------------------------------
 *  Long white lab benches, racks of glowing test tubes, and a central
 *  diagnostic monitor. Accent: lime.
 * ---------------------------------------------------------------------------
 */
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("phase00")!;

function LabBench({ position, length = 4 }: { position: [number, number, number]; length?: number }) {
  return (
    <group position={position}>
      {/* Bench top */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.06, 0.7]} />
        <meshStandardMaterial color="#f4f6f8" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Cabinet base */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[length - 0.1, 0.78, 0.65]} />
        <meshStandardMaterial color="#e6e9ee" roughness={0.5} />
      </mesh>
      {/* Toe kick shadow */}
      <mesh position={[0, 0.04, 0]} >
        <boxGeometry args={[length - 0.2, 0.06, 0.55]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.6} />
      </mesh>
    </group>
  );
}

function TestTube({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.75}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.02, 16]} />
        <meshStandardMaterial color="#cfd8e3" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}

function TubeRack({ position }: { position: [number, number, number] }) {
  const colors = ["#84cc16", "#22d3ee", "#a3e635", "#67e8f9", "#bef264"];
  return (
    <group position={position}>
      {/* Rack base */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[0.7, 0.06, 0.18]} />
        <meshStandardMaterial color="#2a313a" roughness={0.5} metalness={0.4} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <TestTube
          key={i}
          position={[-0.28 + i * 0.14, 1.1, 0]}
          color={colors[i]}
        />
      ))}
    </group>
  );
}

export function DnaLabRoom() {
  return (
    <RoomShell room={room}>
      {/* Two long parallel lab benches */}
      <LabBench position={[0, 0, -2.5]} length={9} />
      <LabBench position={[0, 0, 0]} length={9} />

      {/* Tube racks on bench tops */}
      <TubeRack position={[-3, 0, -2.5]} />
      <TubeRack position={[-1, 0, -2.5]} />
      <TubeRack position={[1, 0, -2.5]} />
      <TubeRack position={[3, 0, -2.5]} />
      <TubeRack position={[-3, 0, 0]} />
      <TubeRack position={[-1, 0, 0]} />
      <TubeRack position={[2, 0, 0]} />

      {/* Diagnostic console (south end) */}
      <mesh position={[0, 0.6, 3]} castShadow>
        <boxGeometry args={[2.2, 1.2, 0.5]} />
        <meshStandardMaterial color="#e6e9ee" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.5, 2.78]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.8, 0.9, 0.04]} />
        <meshStandardMaterial color="#0a0c11" emissive={room.accent} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>

      {/* Cool lab uplight */}
      <pointLight position={[0, 2.6, 0]} color={room.accent} intensity={0.7} distance={9} />
    </RoomShell>
  );
}
