/**
 * DevHubRoom.tsx — PRODUCTION · Centro de Mando DevHub (Fase 3)
 * ---------------------------------------------------------------------------
 *  Modern corporate workstations: bench desks with monitor arms, dual
 *  illuminated screens, ergonomic chairs. Plus a meeting nook and the
 *  hazard-striped QA/Bugs corner. Accent: red.
 * ---------------------------------------------------------------------------
 */
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("phase03")!;

function Monitor({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Bezel/frame */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.42, 0.04]} />
        <meshStandardMaterial color="#0a0c11" roughness={0.5} />
      </mesh>
      {/* Glowing screen surface (sits just in front of the bezel) */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.64, 0.36]} />
        <meshStandardMaterial
          color="#1a2540"
          emissive="#3b82f6"
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[0.05, 0.18, 0.04]} />
        <meshStandardMaterial color="#1a1f29" />
      </mesh>
    </group>
  );
}

function Workstation({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Modern desk top — wider, slimmer */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.05, 0.78]} />
        <meshStandardMaterial color="#3a2f24" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Sleek metal frame legs */}
      <mesh position={[-0.7, 0.36, 0]}>
        <boxGeometry args={[0.04, 0.72, 0.6]} />
        <meshStandardMaterial color="#0e1116" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.7, 0.36, 0]}>
        <boxGeometry args={[0.04, 0.72, 0.6]} />
        <meshStandardMaterial color="#0e1116" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cable tray under desk */}
      <mesh position={[0, 0.68, 0.0]}>
        <boxGeometry args={[1.4, 0.04, 0.15]} />
        <meshStandardMaterial color="#0e1116" roughness={0.6} />
      </mesh>

      {/* Dual monitors on a shared arm */}
      <Monitor position={[-0.4, 1.05, -0.25]} rotation={0.22} />
      <Monitor position={[0.4, 1.05, -0.25]} rotation={-0.22} />

      {/* Keyboard hint */}
      <mesh position={[0, 0.78, 0.15]}>
        <boxGeometry args={[0.5, 0.02, 0.18]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.5} />
      </mesh>

      {/* Ergonomic chair — seat */}
      <mesh position={[0, 0.46, 0.65]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.7} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.85, 0.85]} rotation={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.65, 0.06]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.7} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 0.22, 0.65]}>
        <cylinderGeometry args={[0.05, 0.07, 0.42, 12]} />
        <meshStandardMaterial color="#0e1116" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Wheel base */}
      <mesh position={[0, 0.04, 0.65]}>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 5]} />
        <meshStandardMaterial color="#0e1116" metalness={0.5} />
      </mesh>
    </group>
  );
}

export function DevHubRoom() {
  return (
    <RoomShell room={room}>
      {/* Two long bench rows of workstations facing each other */}
      {[-3.6, -1.8, 0, 1.8].map((x, i) => (
        <Workstation key={`a-${i}`} position={[x, 0, -2.2]} rotation={0} />
      ))}
      {[-3.6, -1.8, 0, 1.8].map((x, i) => (
        <Workstation key={`b-${i}`} position={[x, 0, 0.4]} rotation={Math.PI} />
      ))}

      {/* Meeting nook — round table + 3 stools (east end) */}
      <mesh position={[4.5, 0.42, -2]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.06, 32]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.5} />
      </mesh>
      <mesh position={[4.5, 0.21, -2]}>
        <cylinderGeometry args={[0.1, 0.14, 0.42, 16]} />
        <meshStandardMaterial color="#0e1116" metalness={0.7} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5;
        return (
          <mesh
            key={i}
            position={[4.5 + Math.cos(a) * 1.3, 0.32, -2 + Math.sin(a) * 1.3]}
            castShadow
          >
            <cylinderGeometry args={[0.22, 0.22, 0.5, 20]} />
            <meshStandardMaterial color="#ef4444" roughness={0.7} />
          </mesh>
        );
      })}

      {/* QA/Bugs hazard zone — clean stripes WITHOUT diagonal debug lines */}
      <group position={[4.6, 0, 2.2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <planeGeometry args={[1.8, 1.4]} />
          <meshStandardMaterial color="#facc15" roughness={0.7} />
        </mesh>
        {/* Horizontal hazard stripes (no rotation) */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.018, -0.5 + i * 0.35]}
          >
            <planeGeometry args={[1.7, 0.16]} />
            <meshStandardMaterial color="#0a0c11" roughness={0.7} />
          </mesh>
        ))}
        {/* Bug-tracking pillar */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.4, 1.4, 0.4]} />
          <meshStandardMaterial color="#0a0c11" emissive={room.accent} emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      </group>

      {/* Accent ceiling-down spot */}
      <pointLight position={[-1, 2.8, -1]} color={room.accent} intensity={0.7} distance={10} />
      <pointLight position={[2, 2.8, 1]} color="#ffd8a8" intensity={0.6} distance={10} />
    </RoomShell>
  );
}
