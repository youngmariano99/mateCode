/**
 * ReceptionRoom.tsx — ADMIN · Recepción & CRM
 * ---------------------------------------------------------------------------
 *  Furniture: long reception counter, waiting area with 3 sofas + coffee
 *  table, voluminous indoor plants. Accent: white / light grey.
 *
 *  EXPORT GUIDE:
 *    Copy this file + RoomShell + manifest entry "reception".
 *    Coordinates inside this component are LOCAL to the room center.
 * ---------------------------------------------------------------------------
 */
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("reception")!;

function Sofa({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.6, 0.4, 0.7]} />
        <meshStandardMaterial color="#3b4252" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.65, -0.28]} castShadow>
        <boxGeometry args={[1.6, 0.5, 0.18]} />
        <meshStandardMaterial color="#434c5e" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.5, 16]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#2d5a3d" roughness={0.85} />
      </mesh>
      <mesh position={[0.25, 1.2, 0.1]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#356b48" roughness={0.85} />
      </mesh>
    </group>
  );
}

export function ReceptionRoom() {
  return (
    <RoomShell room={room}>
      {/* Long reception counter (against north wall) */}
      <mesh position={[0, 0.55, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[6, 1.1, 0.9]} />
        <meshStandardMaterial color="#e8eef5" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.05, -3.5]}>
        <boxGeometry args={[6.05, 0.08, 0.95]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.8} />
      </mesh>
      {/* Counter top trim */}
      <mesh position={[0, 1.12, -3.5]}>
        <boxGeometry args={[6.1, 0.04, 1]} />
        <meshStandardMaterial color="#2a313a" roughness={0.4} />
      </mesh>

      {/* Waiting area: 3 sofas around a coffee table */}
      <Sofa position={[-2, 0, 1.5]} rotation={Math.PI / 2} />
      <Sofa position={[2, 0, 1.5]} rotation={-Math.PI / 2} />
      <Sofa position={[0, 0, 3]} rotation={Math.PI} />

      {/* Coffee table */}
      <mesh position={[0, 0.3, 1.5]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 24]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.15, 1.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 12]} />
        <meshStandardMaterial color="#2a313a" />
      </mesh>

      {/* Plants in corners */}
      <Plant position={[-5.2, 0, 4]} />
      <Plant position={[5.2, 0, 4]} />
      <Plant position={[-5.2, 0, -4]} />
    </RoomShell>
  );
}
