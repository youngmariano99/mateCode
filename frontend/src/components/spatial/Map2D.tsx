/**
 * ============================================================================
 *  Map2D — Top-down architectural blueprint of the Spatial OS complex.
 * ============================================================================
 */

import React from "react";
import {
  ROOMS,
  MAP_WIDTH,
  MAP_HEIGHT,
  CORRIDOR_Y,
  CORRIDOR_HEIGHT,
  type Room,
  type Door,
  type Side,
} from "./rooms";
import { FURNITURE } from "./furniture";
import Avatar2D from "./Avatar2D";

export interface MapUser {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  live?: boolean;
  activity?: string;
}

export interface Map2DProps {
  users?: MapUser[];
  className?: string;
  onRoomClick?: (room: Room) => void;
}

interface Segment { x1: number; y1: number; x2: number; y2: number; }

const computeWallSegments = (room: Room, side: Side): Segment[] => {
  const { x, y, width, height } = room;
  const sideLength = side === "top" || side === "bottom" ? width : height;
  const doors = room.doors.filter((d) => d.side === side).slice().sort((a, b) => a.offset - b.offset);

  const ranges: Array<[number, number]> = [];
  let cursor = 0;
  for (const d of doors) {
    if (d.offset > cursor) ranges.push([cursor, d.offset]);
    cursor = d.offset + d.length;
  }
  if (cursor < sideLength) ranges.push([cursor, sideLength]);

  return ranges.map(([s, e]) => {
    switch (side) {
      case "top":    return { x1: x + s, y1: y,          x2: x + e, y2: y          };
      case "bottom": return { x1: x + s, y1: y + height, x2: x + e, y2: y + height };
      case "left":   return { x1: x,         y1: y + s,  x2: x,         y2: y + e  };
      case "right":  return { x1: x + width, y1: y + s,  x2: x + width, y2: y + e  };
    }
  });
};

export const Map2D: React.FC<Map2DProps> = ({
  users = [],
  className = "",
  onRoomClick,
}) => {
  return (
    <div className={`w-full h-full bg-slate-900 ${className}`}>
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        <defs>
          <pattern id="floor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(215 25% 22%)" strokeWidth="0.5" opacity="0.55" />
          </pattern>
          <pattern id="floor-grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="hsl(215 25% 28%)" strokeWidth="0.8" opacity="0.6" />
          </pattern>
          <radialGradient id="map-vignette" cx="50%" cy="50%" r="75%">
            <stop offset="60%" stopColor="hsl(222 47% 11%)" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(222 47% 4%)" stopOpacity="0.85" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="hsl(222 47% 9%)" />
        <rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#floor-grid)" />
        <rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#floor-grid-major)" />

        <g>
          <rect x={40} y={CORRIDOR_Y} width={MAP_WIDTH - 80} height={CORRIDOR_HEIGHT} fill="hsl(215 25% 14%)" opacity={0.6} />
          <line x1={40} y1={CORRIDOR_Y + CORRIDOR_HEIGHT / 2} x2={MAP_WIDTH - 40} y2={CORRIDOR_Y + CORRIDOR_HEIGHT / 2} stroke="hsl(215 16% 38%)" strokeWidth={0.7} strokeDasharray="6 8" opacity={0.7} />
          <text x={MAP_WIDTH / 2} y={CORRIDOR_Y + CORRIDOR_HEIGHT / 2 + 4} textAnchor="middle" fontFamily="sans-serif" fontSize={10} letterSpacing={6} fill="hsl(215 16% 50%)">CENTRAL CORRIDOR</text>
        </g>

        {ROOMS.map((room) => {
          const Furniture = FURNITURE[room.id];
          const sides: Side[] = ["top", "right", "bottom", "left"];

          return (
            <g key={room.id} className="room" style={{ cursor: "pointer" }} onClick={() => onRoomClick?.(room)}>
              <rect className="room-fill transition-all duration-300" x={room.x} y={room.y} width={room.width} height={room.height} fill={room.accent} fillOpacity={0.05} />
              {Furniture && (
                <g transform={`translate(${room.x}, ${room.y})`} style={{ pointerEvents: "none" }}>
                  <Furniture room={room} />
                </g>
              )}
              {sides.map((side) => {
                const segs = computeWallSegments(room, side);
                return segs.map((s, i) => (
                  <React.Fragment key={`${room.id}-${side}-${i}`}>
                    <line className="room-wall transition-all duration-300" x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="hsl(215 20% 70%)" strokeWidth={room.fortified ? 5 : 3} strokeLinecap="square" style={{ ["--accent" as never]: room.accent }} />
                  </React.Fragment>
                ));
              })}
              {room.doors.map((d, i) => <DoorSwing key={i} room={room} door={d} />)}
              <RoomLabel room={room} />
            </g>
          );
        })}

        <rect x={20} y={20} width={MAP_WIDTH - 40} height={MAP_HEIGHT - 40} fill="none" stroke="hsl(215 25% 78%)" strokeWidth={6} />
        
        <text x={40} y={55} fontFamily="sans-serif" fontSize={11} letterSpacing={5} fill="hsl(215 16% 55%)">ADMINISTRATIVE WING — LEVEL 01</text>
        <text x={MAP_WIDTH - 40} y={MAP_HEIGHT - 30} textAnchor="end" fontFamily="sans-serif" fontSize={11} letterSpacing={5} fill="hsl(215 16% 55%)">PRODUCTION WING — LEVEL 01</text>

        <rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-vignette)" pointerEvents="none" />

        {users.map((u) => (
          <Avatar2D key={u.id} x={u.x} y={u.y} name={u.name} color={u.color} live={u.live ?? true} activity={u.activity} />
        ))}

        <style>{`
          .room:hover .room-fill { fill-opacity: 0.18; }
          .room:hover .room-wall { stroke: var(--accent, #fff); filter: drop-shadow(0 0 4px var(--accent, #fff)); }
        `}</style>
      </svg>
    </div>
  );
};

const RoomLabel: React.FC<{ room: Room }> = ({ room }) => {
  const lx = room.x + 14;
  const ly = room.y + 14;
  return (
    <g>
      <circle cx={lx + 9} cy={ly + 10} r={11} fill="hsl(222 30% 10%)" stroke={room.accent} strokeWidth={1.2} />
      <text x={lx + 9} y={ly + 10} textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif" fontSize={11} fontWeight={700} fill={room.accent}>{room.number}</text>
      <text x={lx + 27} y={ly + 7} fontFamily="sans-serif" fontSize={11} fontWeight={600} fill="hsl(215 18% 82%)" letterSpacing={1.2}>{room.name.toUpperCase()}</text>
      {room.subtitle && <text x={lx + 27} y={ly + 19} fontFamily="sans-serif" fontSize={8} fill="hsl(215 14% 55%)" letterSpacing={2}>{room.subtitle.toUpperCase()}</text>}
    </g>
  );
};

const DoorSwing: React.FC<{ room: Room; door: Door }> = ({ room, door }) => {
  const { x, y, width, height } = room;
  const r = door.length;
  let cx = 0, cy = 0, path = "";
  switch (door.side) {
    case "top": cx = x + door.offset; cy = y; path = `M ${cx} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy + r}`; break;
    case "bottom": cx = x + door.offset; cy = y + height; path = `M ${cx} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy - r}`; break;
    case "left": cx = x; cy = y + door.offset; path = `M ${cx} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy + r}`; break;
    case "right": cx = x + width; cy = y + door.offset; path = `M ${cx} ${cy} A ${r} ${r} 0 0 1 ${cx - r} ${cy + r}`; break;
  }
  return <path d={path} fill="none" stroke={room.accent} strokeWidth={0.8} opacity={0.6} strokeDasharray="2 3" />;
};

export default Map2D;
