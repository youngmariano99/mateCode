/**
 * RoomLabel.tsx
 * ---------------------------------------------------------------------------
 *  Floating HTML label rendered with drei's <Html /> so labels stay crisp
 *  regardless of camera distance. Auto-faces the camera.
 * ---------------------------------------------------------------------------
 */
import { Html } from "@react-three/drei";
import type { RoomManifest } from "../manifest";

export function RoomLabel({ room }: { room: RoomManifest }) {
  const [x, , z] = room.position;
  const y = room.size[1] + 0.6;
  return (
    <Html
      position={[x, y, z]}
      center
      distanceFactor={14}
      occlude={false}
      style={{ pointerEvents: "none" }}
    >
      <div
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          background: "rgba(10,12,18,0.78)",
          backdropFilter: "blur(6px)",
          border: `1px solid ${room.accent}`,
          color: "#fff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.3,
          whiteSpace: "nowrap",
          boxShadow: `0 0 18px ${room.accent}55`,
          textAlign: "center",
        }}
      >
        <div>{room.name}</div>
        <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>
          {room.subtitle}
        </div>
      </div>
    </Html>
  );
}
