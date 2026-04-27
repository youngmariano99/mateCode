/**
 * VaultRoom.tsx — ADMIN · La Bóveda (Credenciales & Seguridad)
 * ---------------------------------------------------------------------------
 *  Dark metal-floored vault. Two long rows of lockboxes/safes against the
 *  east & west walls, plus a central security pedestal.
 *  Accent: emerald.
 * ---------------------------------------------------------------------------
 */
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("vault")!;

function SafeBlock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.85, 0.55]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Door panel */}
      <mesh position={[0, 0.45, 0.28]}>
        <boxGeometry args={[0.55, 0.7, 0.02]} />
        <meshStandardMaterial color="#23272d" roughness={0.4} metalness={0.85} />
      </mesh>
      {/* Dial */}
      <mesh position={[0, 0.45, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
        <meshStandardMaterial color="#0e1116" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Status LED */}
      <mesh position={[0.22, 0.7, 0.3]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function VaultRoom() {
  return (
    <RoomShell room={room}>
      {/* West wall safes */}
      {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((z) => (
        <SafeBlock key={`w-${z}`} position={[-3.4, 0, z]} />
      ))}
      {/* East wall safes */}
      {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((z) => (
        <SafeBlock key={`e-${z}`} position={[3.4, 0, z]} />
      ))}

      {/* Central security pedestal with biometric scanner */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.55, 1, 24]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 24]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>

      <pointLight position={[0, 2.4, 0]} color={room.accent} intensity={0.7} distance={8} />
    </RoomShell>
  );
}
