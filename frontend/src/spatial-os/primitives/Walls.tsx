/**
 * Walls.tsx
 * ---------------------------------------------------------------------------
 *  Renders the four walls of a room as solid box geometries, with rectangular
 *  door gaps cut out by SUBDIVIDING each wall into segments around each gap.
 *
 *  Materials use a soft off-white so the architecture bounces light properly
 *  and reads as an interior office space (not a black plastic box).
 * ---------------------------------------------------------------------------
 */
import type { DoorGap, Vec3 } from "../manifest";

interface WallsProps {
  position: Vec3;
  size: Vec3;
  thickness: number;
  doors: DoorGap[];
  accent: string;
}

interface Segment {
  start: number;
  end: number;
}

const WALL_COLOR = "#e6e3dc"; // warm off-white
const WALL_ROUGHNESS = 0.9;

/** Compute solid wall segments by subtracting door gaps from a full-length span. */
function computeSegments(length: number, gaps: DoorGap[]): Segment[] {
  const half = length / 2;
  const sorted = [...gaps].sort((a, b) => a.offset - b.offset);
  const segments: Segment[] = [];
  let cursor = -half;
  for (const g of sorted) {
    const gStart = g.offset - g.width / 2;
    const gEnd = g.offset + g.width / 2;
    if (gStart > cursor) segments.push({ start: cursor, end: gStart });
    cursor = Math.max(cursor, gEnd);
  }
  if (cursor < half) segments.push({ start: cursor, end: half });
  return segments.filter((s) => s.end - s.start > 0.01);
}

function WallSegment({
  position,
  args,
}: {
  position: [number, number, number];
  args: [number, number, number];
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGHNESS} metalness={0} />
    </mesh>
  );
}

export function Walls({ position, size, thickness, doors, accent }: WallsProps) {
  const [w, h, d] = size;
  const [px, , pz] = position;

  const sides = {
    north: doors.filter((x) => x.side === "north"),
    south: doors.filter((x) => x.side === "south"),
    east: doors.filter((x) => x.side === "east"),
    west: doors.filter((x) => x.side === "west"),
  };

  const northSegs = computeSegments(w, sides.north);
  const southSegs = computeSegments(w, sides.south);
  const eastSegs = computeSegments(d, sides.east);
  const westSegs = computeSegments(d, sides.west);

  return (
    <group position={[px, 0, pz]}>
      {northSegs.map((s, i) => {
        const segLen = s.end - s.start;
        const cx = (s.start + s.end) / 2;
        return (
          <WallSegment
            key={`n-${i}`}
            position={[cx, h / 2, -d / 2]}
            args={[segLen, h, thickness]}
          />
        );
      })}
      {southSegs.map((s, i) => {
        const segLen = s.end - s.start;
        const cx = (s.start + s.end) / 2;
        return (
          <WallSegment
            key={`s-${i}`}
            position={[cx, h / 2, d / 2]}
            args={[segLen, h, thickness]}
          />
        );
      })}
      {eastSegs.map((s, i) => {
        const segLen = s.end - s.start;
        const cz = (s.start + s.end) / 2;
        return (
          <WallSegment
            key={`e-${i}`}
            position={[w / 2, h / 2, cz]}
            args={[thickness, h, segLen]}
          />
        );
      })}
      {westSegs.map((s, i) => {
        const segLen = s.end - s.start;
        const cz = (s.start + s.end) / 2;
        return (
          <WallSegment
            key={`w-${i}`}
            position={[-w / 2, h / 2, cz]}
            args={[thickness, h, segLen]}
          />
        );
      })}

      {/* Accent LED baseboards along the four interior walls */}
      <mesh position={[0, 0.05, -d / 2 + 0.16]}>
        <boxGeometry args={[w - 0.4, 0.05, 0.03]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.05, d / 2 - 0.16]}>
        <boxGeometry args={[w - 0.4, 0.05, 0.03]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[-w / 2 + 0.16, 0.05, 0]}>
        <boxGeometry args={[0.03, 0.05, d - 0.4]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[w / 2 - 0.16, 0.05, 0]}>
        <boxGeometry args={[0.03, 0.05, d - 0.4]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  );
}
