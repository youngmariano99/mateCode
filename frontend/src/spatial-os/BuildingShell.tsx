/**
 * BuildingShell.tsx
 * ---------------------------------------------------------------------------
 *  Outer envelope + interior corridor walls + perimeter wall.
 * ---------------------------------------------------------------------------
 */
import { BUILDING, ROOMS } from "./manifest";

const WALL_COLOR = "#e6e3dc";
const WALL_ROUGHNESS = 0.9;

interface Segment {
  start: number;
  end: number;
}

function corridorDoorGaps(side: "north" | "south"): Segment[] {
  const wing = side === "north" ? "admin" : "production";
  const expectedDoorSide = side === "north" ? "south" : "north";
  const gaps: Segment[] = [];
  for (const room of ROOMS) {
    if (room.wing !== wing) continue;
    // Special case: full-depth rooms like the Lobby are NOT in the corridor wings
    if (room.id === "lobby") continue;

    for (const door of room.doors) {
      if (door.side !== expectedDoorSide) continue;
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

  // Corridor now starts at its own minX (e.g. -22), not the building's minX.
  const corridorMinX = corridor.minX + 0.5;
  const corridorMaxX = corridor.maxX - 0.5;
  const corridorNorthZ = corridor.z - corridor.width / 2;
  const corridorSouthZ = corridor.z + corridor.width / 2;

  const northSegs = computeSegments(corridorMinX, corridorMaxX, corridorDoorGaps("north"));
  const southSegs = computeSegments(corridorMinX, corridorMaxX, corridorDoorGaps("south"));

  const perimeterThickness = wallThickness * 1.4;

  return (
    <group>
      {/* Outer ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.02, cz]} receiveShadow>
        <planeGeometry args={[width + 16, depth + 16]} />
        <meshStandardMaterial color="#13161c" roughness={0.95} />
      </mesh>

      {/* Building base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0, cz]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#9a8060" roughness={0.85} />
      </mesh>

      {/* Corridor floor - only between corridor.minX and corridor.maxX */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[(corridor.minX + corridor.maxX) / 2, 0.008, corridor.z]}
        receiveShadow
      >
        <planeGeometry args={[corridor.maxX - corridor.minX - 0.5, corridor.width]} />
        <meshStandardMaterial color="#dde0e6" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Corridor centerline */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[(corridor.minX + corridor.maxX) / 2, 0.012, corridor.z]}
      >
        <planeGeometry args={[corridor.maxX - corridor.minX - 1, 0.05]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>

      {/* Perimeter walls */}
      <mesh position={[cx, wallHeight / 2, bounds.minZ]} castShadow receiveShadow>
        <boxGeometry args={[width, wallHeight, perimeterThickness]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGHNESS} />
      </mesh>
      <mesh position={[cx, wallHeight / 2, bounds.maxZ]} castShadow receiveShadow>
        <boxGeometry args={[width, wallHeight, perimeterThickness]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGHNESS} />
      </mesh>
      <mesh position={[bounds.minX, wallHeight / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[perimeterThickness, wallHeight, depth]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGHNESS} />
      </mesh>
      <mesh position={[bounds.maxX, wallHeight / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[perimeterThickness, wallHeight, depth]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGHNESS} />
      </mesh>

      {/* Perimeter LED trims */}
      <mesh position={[cx, wallHeight + 0.02, bounds.minZ]}>
        <boxGeometry args={[width, 0.04, 0.05]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[cx, wallHeight + 0.02, bounds.maxZ]}>
        <boxGeometry args={[width, 0.04, 0.05]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.7} toneMapped={false} />
      </mesh>

      {/* Corridor walls */}
      <CorridorWall z={corridorNorthZ} segments={northSegs} height={wallHeight} thickness={wallThickness} />
      <CorridorWall z={corridorSouthZ} segments={southSegs} height={wallHeight} thickness={wallThickness} />

      {/* Corridor end cap (East only, West is the Lobby) */}
      <mesh position={[bounds.maxX - 0.25, wallHeight / 2, corridor.z]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, corridor.width]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGHNESS} />
      </mesh>

      {/* Corridor LEDs */}
      <mesh position={[(corridor.minX + corridor.maxX) / 2, 0.06, corridorNorthZ + 0.08]}>
        <boxGeometry args={[corridor.maxX - corridor.minX - 1.2, 0.06, 0.03]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <mesh position={[(corridor.minX + corridor.maxX) / 2, 0.06, corridorSouthZ - 0.08]}>
        <boxGeometry args={[corridor.maxX - corridor.minX - 1.2, 0.06, 0.03]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </group>
  );
}
