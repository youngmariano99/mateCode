/**
 * Floor.tsx
 * ---------------------------------------------------------------------------
 *  A per-room floor plane with a finish derived from the manifest.
 *  Finishes use procedural color/roughness — no external textures required.
 *
 *  NOTE: the floor sits slightly above the building base (y = 0.012) to
 *  avoid Z-fighting with the building shell ground plane.
 * ---------------------------------------------------------------------------
 */
import type { RoomManifest } from "../manifest";

const FINISH = {
  wood: { color: "#a07a52", roughness: 0.75, metalness: 0.05 },
  porcelain: { color: "#eef0f4", roughness: 0.35, metalness: 0.08 },
  carpet: { color: "#3a3a48", roughness: 0.95, metalness: 0 },
  metal: { color: "#5a6068", roughness: 0.45, metalness: 0.65 },
  grid: { color: "#262a31", roughness: 0.55, metalness: 0.35 },
  glossy: { color: "#f4f6f8", roughness: 0.2, metalness: 0.18 },
} as const;

/**
 * Subtle dotted "grid" overlay for technical floors (servers room).
 * We use a small grid of tiny boxes — NO wireframe — to avoid Z-fighting
 * and the "debug lines" look that wireframe materials produce.
 */
function GridStuds({ w, d }: { w: number; d: number }) {
  const studs: Array<[number, number]> = [];
  const step = 0.6;
  for (let x = -w / 2 + step / 2; x < w / 2; x += step) {
    for (let z = -d / 2 + step / 2; z < d / 2; z += step) {
      studs.push([x, z]);
    }
  }
  return (
    <group position={[0, 0.005, 0]}>
      {studs.map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <boxGeometry args={[0.05, 0.005, 0.05]} />
          <meshStandardMaterial color="#0e1116" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function Floor({ room }: { room: RoomManifest }) {
  const [w, , d] = room.size;
  const finish = FINISH[room.floor];
  const color = room.floorTint ?? finish.color;

  return (
    <group position={[room.position[0], 0.012, room.position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w - 0.05, d - 0.05]} />
        <meshStandardMaterial
          color={color}
          roughness={finish.roughness}
          metalness={finish.metalness}
        />
      </mesh>
      {room.floor === "grid" && <GridStuds w={w - 0.2} d={d - 0.2} />}
    </group>
  );
}
