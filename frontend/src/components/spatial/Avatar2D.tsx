/**
 * ============================================================================
 *  Avatar2D — User presence marker for the Spatial OS blueprint map.
 * ============================================================================
 */

import React from "react";

export interface Avatar2DProps {
  x: number;
  y: number;
  name: string;
  color: string;
  radius?: number;
  live?: boolean;
  activity?: string;
}

const toInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export const Avatar2D: React.FC<Avatar2DProps> = ({
  x,
  y,
  name,
  color,
  radius = 14,
  live = true,
  activity = "Online",
}) => {
  const initials = toInitials(name);
  const TT_W = 180;
  const TT_H = 54;
  const TT_GAP = 10;

  return (
    <g className="avatar2d group" style={{ pointerEvents: "auto", cursor: "pointer" }}>
      {live && (
        <>
          <circle
            cx={x} cy={y} r={radius + 4} fill="none" stroke={color} strokeWidth={1} opacity={0.35}
            style={{
              transformOrigin: `${x}px ${y}px`,
              animation: "avatar2d-ping 2.4s cubic-bezier(0,0,0.2,1) infinite",
            }}
          />
          <circle cx={x} cy={y} r={radius + 4} fill={color} opacity={0.08} />
        </>
      )}

      <circle cx={x} cy={y} r={radius + 1.5} fill={color} opacity={0.18} />

      <circle
        cx={x} cy={y} r={radius} fill="hsl(222 25% 12%)" stroke={color} strokeWidth={1.75}
        className="transition-all duration-300 ease-in-out group-hover:[r:16]"
      />

      <text
        x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={radius * 0.78} fontWeight={600} fill={color}
        style={{ pointerEvents: "none" }}
      >
        {initials}
      </text>

      <text
        x={x} y={y + radius + 11} textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={8.5} fontWeight={500} fill="hsl(215 18% 70%)"
        style={{ pointerEvents: "none" }}
      >
        {name}
      </text>

      <foreignObject
        x={x - TT_W / 2} y={y - radius - TT_GAP - TT_H} width={TT_W} height={TT_H}
        style={{ overflow: "visible", pointerEvents: "none" }}
      >
        <div className="w-full h-full flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none">
          <div className="rounded-md border border-slate-700/80 bg-slate-950/95 backdrop-blur px-2.5 py-1.5 shadow-xl shadow-black/60 text-center" style={{ borderColor: `${color}55` }}>
            <div className="text-[10px] font-semibold tracking-wide leading-tight" style={{ color }}>{name}</div>
            <div className="text-[9px] text-slate-300/90 leading-tight mt-0.5">{activity}</div>
          </div>
        </div>
      </foreignObject>

      <style>{`
        @keyframes avatar2d-ping {
          0%   { transform: scale(1);   opacity: 0.55; }
          80%  { transform: scale(2.1); opacity: 0;    }
          100% { transform: scale(2.1); opacity: 0;    }
        }
      `}</style>
    </g>
  );
};

export default Avatar2D;
