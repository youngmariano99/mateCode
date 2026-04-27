/**
 * StrategyRoom.tsx — PRODUCTION · Sala de Estrategia (Fase 1)
 * ---------------------------------------------------------------------------
 *  Long rectangular "war table" with executive chairs, two free-standing
 *  whiteboards, and a wall-mounted timeline screen. Accent: amber/gold.
 * ---------------------------------------------------------------------------
 */
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("strategy")!;

function ExecChair({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.78, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.06]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.42, 12]} />
        <meshStandardMaterial color="#0e1116" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Whiteboard({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.6, 1.1, 0.06]} />
        <meshStandardMaterial color="#2a313a" roughness={0.5} />
      </mesh>
      {/* Whiteboard surface */}
      <mesh position={[0, 1.1, 0.04]}>
        <boxGeometry args={[1.5, 1.0, 0.02]} />
        <meshStandardMaterial color="#f8f9fb" roughness={0.2} />
      </mesh>
      {/* Tripod legs */}
      <mesh position={[-0.5, 0.28, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.05, 0.55, 0.05]} />
        <meshStandardMaterial color="#1a1f29" />
      </mesh>
      <mesh position={[0.5, 0.28, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.05, 0.55, 0.05]} />
        <meshStandardMaterial color="#1a1f29" />
      </mesh>
      {/* Sticky notes (yellow accent dots) */}
      {[
        [-0.5, 1.3],
        [-0.2, 1.1],
        [0.3, 1.4],
        [0.5, 1.0],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.06]}>
          <boxGeometry args={[0.14, 0.14, 0.005]} />
          <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function StrategyRoom() {
  return (
    <RoomShell room={room}>
      {/* War table — long rectangular boardroom table */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.08, 1.6]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Table base */}
      <mesh position={[-1.6, 0.37, 0]}>
        <boxGeometry args={[0.2, 0.7, 1.2]} />
        <meshStandardMaterial color="#0e1116" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[1.6, 0.37, 0]}>
        <boxGeometry args={[0.2, 0.7, 1.2]} />
        <meshStandardMaterial color="#0e1116" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Chairs along both sides */}
      {[-1.5, -0.5, 0.5, 1.5].map((x) => (
        <ExecChair key={`n-${x}`} position={[x, 0, -1.2]} rotation={0} />
      ))}
      {[-1.5, -0.5, 0.5, 1.5].map((x) => (
        <ExecChair key={`s-${x}`} position={[x, 0, 1.2]} rotation={Math.PI} />
      ))}
      {/* Head chairs */}
      <ExecChair position={[-2.8, 0, 0]} rotation={Math.PI / 2} />
      <ExecChair position={[2.8, 0, 0]} rotation={-Math.PI / 2} />

      {/* Two free-standing whiteboards */}
      <Whiteboard position={[-3.5, 0, 2.8]} rotation={Math.PI} />
      <Whiteboard position={[3.5, 0, 2.8]} rotation={Math.PI} />

      <pointLight position={[0, 2.6, 0]} color={room.accent} intensity={0.55} distance={8} />
    </RoomShell>
  );
}
