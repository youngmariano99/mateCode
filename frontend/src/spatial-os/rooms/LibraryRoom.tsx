/**
 * LibraryRoom.tsx — ADMIN · Biblioteca (Prompts & Plantillas)
 * ---------------------------------------------------------------------------
 *  Tall parallel bookshelves, wooden reading tables with chairs, central
 *  pedestal emitting a subtle hologram. Accent: violet.
 * ---------------------------------------------------------------------------
 */
import { getRoom } from "../manifest";
import { RoomShell } from "../primitives/RoomShell";

const room = getRoom("library")!;

function Bookshelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[2.6, 2.6, 0.4]} />
        <meshStandardMaterial color="#4a3725" roughness={0.85} />
      </mesh>
      {/* Shelves of "books" — alternating colored slabs */}
      {[0.2, 0.85, 1.5, 2.15].map((y, i) => (
        <mesh key={i} position={[0, y, 0.02]}>
          <boxGeometry args={[2.5, 0.5, 0.32]} />
          <meshStandardMaterial
            color={["#7c3aed", "#a855f7", "#6d28d9", "#9333ea"][i]}
            emissive={room.accent}
            emissiveIntensity={0.15}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

export function LibraryRoom() {
  return (
    <RoomShell room={room}>
      {/* Two parallel bookshelf rows along east/west walls */}
      <Bookshelf position={[-4.3, 0, -2]} />
      <Bookshelf position={[-4.3, 0, 1]} />
      <Bookshelf position={[4.3, 0, -2]} />
      <Bookshelf position={[4.3, 0, 1]} />

      {/* Reading tables (wood) with chairs nested */}
      {[-1.2, 1.2].map((x) => (
        <group key={x} position={[x, 0, 2.5]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[1.6, 0.06, 0.9]} />
            <meshStandardMaterial color="#6b4f33" roughness={0.6} />
          </mesh>
          {[
            [-0.6, -0.2],
            [0.6, -0.2],
            [-0.6, 0.2],
            [0.6, 0.2],
          ].map(([lx, lz], i) => (
            <mesh key={i} position={[lx, 0.2, lz]}>
              <boxGeometry args={[0.05, 0.4, 0.05]} />
              <meshStandardMaterial color="#3d2c1c" />
            </mesh>
          ))}
          <mesh position={[0, 0.25, 0.55]} castShadow>
            <boxGeometry args={[0.45, 0.5, 0.05]} />
            <meshStandardMaterial color="#3d2c1c" />
          </mesh>
        </group>
      ))}

      {/* Central holographic pedestal */}
      <mesh position={[0, 0.5, -1]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 1, 24]} />
        <meshStandardMaterial color="#1a1325" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.4, -1]}>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 16, 1, true]} />
        <meshBasicMaterial color={room.accent} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 1.4, -1]}>
        <icosahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color={room.accent}
          emissive={room.accent}
          emissiveIntensity={2}
          wireframe
        />
      </mesh>
      <pointLight position={[0, 1.5, -1]} color={room.accent} intensity={1.2} distance={6} />
    </RoomShell>
  );
}
