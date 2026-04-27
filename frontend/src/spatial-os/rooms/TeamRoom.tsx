/**
 * TeamRoom.tsx — ADMIN · Sala de Equipo (Roles & Permisos)
 * ---------------------------------------------------------------------------
 *  Round meeting table, soft puff seats, and a small coffee bar.
 *  Accent: pink.
 * ---------------------------------------------------------------------------
 */
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("team")!;

function Puff({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.38, 0.42, 0.42, 24]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

export function TeamRoom() {
  return (
    <RoomShell room={room}>
      {/* Round meeting table */}
      <mesh position={[0, 0.42, -0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 1.4, 0.08, 48]} />
        <meshStandardMaterial color="#d8c4b0" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.21, -0.5]}>
        <cylinderGeometry args={[0.18, 0.25, 0.42, 16]} />
        <meshStandardMaterial color="#2a313a" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Six puffs around the table */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = 2.0;
        const colors = ["#ec4899", "#f472b6", "#db2777", "#f9a8d4", "#be185d", "#f472b6"];
        return (
          <Puff
            key={i}
            position={[Math.cos(a) * r, 0.21, -0.5 + Math.sin(a) * r]}
            color={colors[i]}
          />
        );
      })}

      {/* Coffee bar (against south wall) */}
      <mesh position={[-2.5, 0.5, 3]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.0, 0.55]} />
        <meshStandardMaterial color="#3a2a20" roughness={0.7} />
      </mesh>
      <mesh position={[-2.5, 1.02, 3]}>
        <boxGeometry args={[2.25, 0.04, 0.6]} />
        <meshStandardMaterial color="#1a1310" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Coffee machine */}
      <mesh position={[-3.1, 1.25, 3]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.4]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[-3.1, 1.49, 3.05]}>
        <boxGeometry args={[0.3, 0.06, 0.06]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* Cups */}
      {[-2.0, -1.7, -1.4].map((x, i) => (
        <mesh key={i} position={[x, 1.08, 3]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.1, 12]} />
          <meshStandardMaterial color="#f4f6f8" roughness={0.4} />
        </mesh>
      ))}

      {/* Soft accent uplight */}
      <pointLight position={[0, 2.4, 0]} color={room.accent} intensity={0.6} distance={8} />
    </RoomShell>
  );
}
