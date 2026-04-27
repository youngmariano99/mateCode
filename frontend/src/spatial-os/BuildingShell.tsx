/**
 * BuildingShell.tsx
 * ---------------------------------------------------------------------------
 *  Outer envelope + interior corridor walls.
 *
 *  - Building base (porcelain ground)
 *  - Central corridor floor band (east/west)
 *  - PHYSICAL corridor walls (north & south sides of the corridor) with door
 *    openings projected from each room's door.
 *  - Subtle directional centerline accent.
 * ---------------------------------------------------------------------------
 */
import { BUILDING, ROOMS } from "./manifest";

const WALL_COLOR = "#e6e3dc";
const WALL_ROUGHNESS = 0.9;

interface Segment {
  start: number;
  end: number;
}

/**
 * For a corridor wall on a given side (north = -Z edge of corridor,
 * south = +Z edge), collect door gaps projected from rooms on that side.
 *
 * Admin rooms (wing="admin") sit north of corridor → they put a doorway in
 *   the corridor's NORTH wall (z = -corridor.width/2).
 * Production rooms (wing="production") sit south of corridor → they put a
 *   doorway in the corridor's SOUTH wall (z = +corridor.width/2).
 * Rooms whose door is on east/west are interior doors (e.g. servers room
 *   opens west into devhub) and don't punch the corridor wall.
 */
function corridorDoorGaps(side: "north" | "south"): Segment[] {
  const wing = side === "north" ? "admin" : "production";
  const expectedDoorSide = side === "north" ? "south" : "north";
  const gaps: Segment[] = [];
  for (const room of ROOMS) {
    if (room.wing !== wing) continue;
    for (const door of room.doors) {
      if (door.side !== expectedDoorSide) continue;
      // Project door from room-local X to world X.
      const worldX = room.position[0] + door.offset;
      gaps.push({
        start: worldX - door.width / 2,
        end: worldX + door.width / 2,
      });
    }
  }
  return gaps;
}

function computeSegments(min: number, max: number, gaps: Segment[]): Segment[] {
  const sorted = [...gaps].sort((a, b) => a.start - b.start);
  const segs: Segment[] = [];
  let cursor = min;
  for (const g of sorted) {
    if (g.start > cursor) segs.push({ start: cursor, end: g.start });
    cursor = Math.max(cursor, g.end);
  }
  if (cursor < max) segs.push({ start: cursor, end: max });
  return segs.filter((s) => s.end - s.start > 0.05);
}

function CorridorWall({
  z,
  segments,
  height,
  thickness,
}: {
  z: number;
  segments: Segment[];
  height: number;
  thickness: number;
}) {
  return (
    <>
      {segments.map((s, i) => {
        const len = s.end - s.start;
        const cx = (s.start + s.end) / 2;
        return (
          <mesh key={i} position={[cx, height / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[len, height, thickness]} />
            <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGHNESS} />
          </mesh>
        );
      })}
    </>
  );
}

export function BuildingShell() {
  const { bounds, corridor, wallHeight, wallThickness } = BUILDING;
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;

  const corridorMinX = bounds.minX + 0.5;
  const corridorMaxX = bounds.maxX - 0.5;
  const corridorNorthZ = corridor.z - corridor.width / 2;
  const corridorSouthZ = corridor.z + corridor.width / 2;

  const northSegs = computeSegments(corridorMinX, corridorMaxX, corridorDoorGaps("north"));
  const southSegs = computeSegments(corridorMinX, corridorMaxX, corridorDoorGaps("south"));

  return (
    <group>
      {/* Outer ground (dark porcelain) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, -0.02, cz]}
        receiveShadow
      >
        <planeGeometry args={[width + 16, depth + 16]} />
        <meshStandardMaterial color="#13161c" roughness={0.95} />
      </mesh>

      {/* Building base */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, 0, cz]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#9a8060" roughness={0.85} />
      </mesh>

      {/* Central corridor floor band — light porcelain */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, 0.008, corridor.z]}
        receiveShadow
      >
        <planeGeometry args={[width - 0.5, corridor.width]} />
        <meshStandardMaterial color="#dde0e6" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Corridor center directional accent stripe */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, 0.012, corridor.z]}
      >
        <planeGeometry args={[width - 1, 0.05]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Physical corridor walls with door openings */}
      <CorridorWall
        z={corridorNorthZ}
        segments={northSegs}
        height={wallHeight}
        thickness={wallThickness}
      />
      <CorridorWall
        z={corridorSouthZ}
        segments={southSegs}
        height={wallHeight}
        thickness={wallThickness}
      />

      {/* Corridor end caps (east & west) — short walls so the corridor reads as a tunnel */}
      <mesh
        position={[bounds.minX + 0.25, wallHeight / 2, corridor.z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, corridor.width]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGHNESS} />
      </mesh>
      <mesh
        position={[bounds.maxX - 0.25, wallHeight / 2, corridor.z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, corridor.width]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGHNESS} />
      </mesh>

      {/* Corridor LED baseboard — runs along both interior walls */}
      <mesh position={[cx, 0.06, corridorNorthZ + 0.08]}>
        <boxGeometry args={[width - 1.2, 0.06, 0.03]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[cx, 0.06, corridorSouthZ - 0.08]}>
        <boxGeometry args={[width - 1.2, 0.06, 0.03]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
