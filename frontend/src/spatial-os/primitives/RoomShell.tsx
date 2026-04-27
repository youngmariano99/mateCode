/**
 * RoomShell.tsx
 * ---------------------------------------------------------------------------
 *  Convenience wrapper that draws floor + walls + label for a room.
 *  Used by every <RoomXxx /> component — and as a standalone fallback for
 *  rooms whose detailed furniture module hasn't been built yet.
 * ---------------------------------------------------------------------------
 */
import type { RoomManifest } from "../manifest";
import { BUILDING } from "../manifest";
import { Floor } from "./Floor";
import { Walls } from "./Walls";
import { RoomLabel } from "./RoomLabel";

export function RoomShell({
  room,
  children,
}: {
  room: RoomManifest;
  children?: React.ReactNode;
}) {
  return (
    <group>
      <Floor room={room} />
      <Walls
        position={room.position}
        size={room.size}
        thickness={BUILDING.wallThickness}
        doors={room.doors}
        accent={room.accent}
      />
      <RoomLabel room={room} />
      {/* Furniture group — children are placed in the room's local frame */}
      <group position={[room.position[0], 0, room.position[2]]}>{children}</group>
    </group>
  );
}
