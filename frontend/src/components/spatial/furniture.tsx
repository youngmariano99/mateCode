/**
 * ============================================================================
 *  Furniture — Top-down (cenital) SVG renderers, one per room.
 * ============================================================================
 */

import React from "react";
import type { Room } from "./rooms";

interface FurnitureProps {
  room: Room;
}

/* Shared palette */
const STROKE = "hsl(215 16% 47%)";   // slate-500
const STROKE_SOFT = "hsl(215 16% 35%)";
const FURN_FILL = "hsl(222 25% 14%)";
const FURN_FILL_2 = "hsl(222 22% 17%)";

/* ────────────────────────────────────────────────────────────────────────── */
/*  1 · RECEPTION & CRM                                                       */
/* ────────────────────────────────────────────────────────────────────────── */
const Reception: React.FC<FurnitureProps> = ({ room }) => {
  const w = room.width;
  const h = room.height;
  return (
    <g>
      <rect x={w * 0.1} y={40} width={w * 0.55} height={26} rx={6} fill={FURN_FILL_2} stroke={STROKE} strokeWidth={1.2} />
      <rect x={w * 0.1 + 6} y={46} width={w * 0.55 - 12} height={14} rx={3} fill="none" stroke={STROKE_SOFT} strokeWidth={0.6} />

      <rect x={30} y={h - 150} width={90} height={32} rx={10} fill={FURN_FILL_2} stroke={STROKE} strokeWidth={1} />
      <rect x={140} y={h - 150} width={90} height={32} rx={10} fill={FURN_FILL_2} stroke={STROKE} strokeWidth={1} />
      <rect x={250} y={h - 150} width={90} height={32} rx={10} fill={FURN_FILL_2} stroke={STROKE} strokeWidth={1} />
      <rect x={120} y={h - 100} width={130} height={36} rx={4} fill={FURN_FILL} stroke={STROKE} strokeWidth={1} />

      {[ [20, 90], [w - 30, 90], [20, h - 50], [w - 30, h - 50], ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={11} fill="hsl(150 35% 18%)" stroke="hsl(150 30% 40%)" strokeWidth={0.8} />
          <circle cx={cx - 3} cy={cy - 2} r={3} fill="hsl(150 40% 35%)" opacity={0.7} />
        </g>
      ))}
    </g>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  2 · LIBRARY                                                               */
/* ────────────────────────────────────────────────────────────────────────── */
const Library: React.FC<FurnitureProps> = ({ room }) => {
  const w = room.width;
  const h = room.height;
  const shelves = [60, 95, 130, 165];
  return (
    <g>
      {shelves.map((y) => (
        <g key={y}>
          <rect x={30} y={y} width={w - 60} height={10} fill={FURN_FILL_2} stroke={STROKE} strokeWidth={1} />
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={i} x1={30 + ((w - 60) / 18) * i} y1={y} x2={30 + ((w - 60) / 18) * i} y2={y + 10} stroke={STROKE_SOFT} strokeWidth={0.5} />
          ))}
        </g>
      ))}
      {[60, w - 180].map((tx) => (
        <g key={tx}>
          <rect x={tx} y={h - 130} width={120} height={60} rx={4} fill={FURN_FILL} stroke={STROKE} strokeWidth={1.1} />
          <circle cx={tx + 25} cy={h - 138} r={9} fill={FURN_FILL_2} stroke={STROKE_SOFT} strokeWidth={0.8} />
          <circle cx={tx + 60} cy={h - 138} r={9} fill={FURN_FILL_2} stroke={STROKE_SOFT} strokeWidth={0.8} />
          <circle cx={tx + 95} cy={h - 138} r={9} fill={FURN_FILL_2} stroke={STROKE_SOFT} strokeWidth={0.8} />
          <circle cx={tx + 25} cy={h - 62} r={9} fill={FURN_FILL_2} stroke={STROKE_SOFT} strokeWidth={0.8} />
          <circle cx={tx + 60} cy={h - 62} r={9} fill={FURN_FILL_2} stroke={STROKE_SOFT} strokeWidth={0.8} />
          <circle cx={tx + 95} cy={h - 62} r={9} fill={FURN_FILL_2} stroke={STROKE_SOFT} strokeWidth={0.8} />
        </g>
      ))}
    </g>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  3 · TEAM LOUNGE                                                           */
/* ────────────────────────────────────────────────────────────────────────── */
const TeamLounge: React.FC<FurnitureProps> = ({ room }) => {
  const w = room.width;
  const h = room.height;
  const cx = w / 2;
  const cy = h / 2 + 10;
  return (
    <g>
      <polygon points={`40,60 95,55 110,95 70,115 35,95`} fill={FURN_FILL_2} stroke={STROKE} strokeWidth={1} />
      <polygon points={`120,55 175,65 170,110 125,110 110,80`} fill={FURN_FILL_2} stroke={STROKE} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={62} fill={FURN_FILL} stroke={STROKE} strokeWidth={1.4} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 80;
        return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={11} fill={FURN_FILL_2} stroke={STROKE_SOFT} strokeWidth={0.8} />;
      })}
      <rect x={w - 110} y={h - 100} width={90} height={70} rx={4} fill="none" stroke={STROKE_SOFT} strokeWidth={0.8} strokeDasharray="3 3" />
    </g>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  4 · THE VAULT                                                             */
/* ────────────────────────────────────────────────────────────────────────── */
const Vault: React.FC<FurnitureProps> = ({ room }) => {
  const w = room.width;
  const h = room.height;
  return (
    <g>
      <defs>
        <pattern id="vault-grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M 22 0 L 0 0 0 22" fill="none" stroke={room.accent} strokeWidth="0.4" opacity="0.35" />
        </pattern>
      </defs>
      <rect x={20} y={20} width={w - 40} height={h - 40} fill="url(#vault-grid)" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={`t${i}`} x={30 + i * 30} y={35} width={26} height={26} fill={FURN_FILL_2} stroke={room.accent} strokeWidth={1} />
      ))}
      <circle cx={w / 2} cy={h / 2} r={28} fill={FURN_FILL_2} stroke={room.accent} strokeWidth={1.4} />
    </g>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  5 · DNA LAB                                                               */
/* ────────────────────────────────────────────────────────────────────────── */
const DnaLab: React.FC<FurnitureProps> = ({ room }) => {
  const w = room.width;
  const h = room.height;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const y = 80 + i * 75;
        return (
          <g key={i}>
            <rect x={30} y={y} width={w - 60} height={36} rx={3} fill="hsl(210 20% 86%)" stroke={STROKE} strokeWidth={1.1} opacity={0.92} />
            {[0.18, 0.42, 0.66, 0.88].map((p, k) => (
              <g key={k}>
                <circle cx={30 + (w - 60) * p} cy={y + 18} r={9} fill={FURN_FILL_2} stroke={room.accent} strokeWidth={1} />
                <circle cx={30 + (w - 60) * p} cy={y + 18} r={4} fill="none" stroke={room.accent} strokeWidth={0.7} />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  6 · STRATEGY ROOM                                                         */
/* ────────────────────────────────────────────────────────────────────────── */
const Strategy: React.FC<FurnitureProps> = ({ room }) => {
  const w = room.width;
  const h = room.height;
  return (
    <g>
      <rect x={w * 0.18} y={h * 0.28} width={w * 0.64} height={h * 0.44} rx={4} fill={FURN_FILL} stroke={STROKE} strokeWidth={1.5} />
      {[ [0.28, 0.38], [0.36, 0.5], [0.5, 0.4], [0.62, 0.48], [0.72, 0.55], [0.4, 0.6], [0.55, 0.62], [0.66, 0.36], ].map(([px, py], i) => (
        <rect key={i} x={w * px} y={h * py} width={11} height={11} fill={i % 2 === 0 ? room.accent : "#FB923C"} opacity={0.85} transform={`rotate(${(i * 17) % 30 - 15} ${w * px + 5.5} ${h * py + 5.5})`} />
      ))}
    </g>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  7 · ARCHITECTURE STUDIO                                                   */
/* ────────────────────────────────────────────────────────────────────────── */
const Architecture: React.FC<FurnitureProps> = ({ room }) => {
  const w = room.width;
  const h = room.height;
  return (
    <g>
      {[0, 1].map((col) => [0, 1].map((row) => {
        const x = 30 + col * (w / 2 - 10);
        const y = 40 + row * 80;
        return (
          <g key={`${col}-${row}`}>
            <rect x={x} y={y} width={w / 2 - 30} height={50} fill={FURN_FILL_2} stroke={STROKE} strokeWidth={1} />
            <line x1={x} y1={y} x2={x + w / 2 - 30} y2={y + 50} stroke={STROKE_SOFT} strokeWidth={0.7} />
          </g>
        );
      }))}
      {(() => {
        const cx = w / 2;
        const cy = h - 90;
        const nodes = [ [cx, cy - 40], [cx - 60, cy], [cx + 60, cy], [cx - 30, cy + 40], [cx + 30, cy + 40] ];
        return (
          <g>
            {nodes.slice(1).map(([nx, ny], i) => <line key={i} x1={cx} y1={cy - 40} x2={nx} y2={ny} stroke={room.accent} strokeWidth={0.8} opacity={0.7} />)}
            {nodes.map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={5} fill={FURN_FILL} stroke={room.accent} strokeWidth={1.2} />)}
          </g>
        );
      })()}
    </g>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  8 · DEVHUB                                                                */
/* ────────────────────────────────────────────────────────────────────────── */
const DevHub: React.FC<FurnitureProps> = ({ room }) => {
  const w = room.width;
  const h = room.height;
  return (
    <g>
      <defs>
        <pattern id="qa-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="10" fill="#FBBF24" opacity="0.55" />
          <rect x="5" width="5" height="10" fill="hsl(222 25% 12%)" />
        </pattern>
      </defs>
      {[0, 1].map((row) => (
        <g key={row}>
          <rect x={30} y={50 + row * 70} width={w - 180} height={40} rx={2} fill={FURN_FILL_2} stroke={STROKE} strokeWidth={1} />
          {Array.from({ length: 6 }).map((_, i) => {
            const mx = 50 + i * ((w - 220) / 6);
            return (
              <g key={i}>
                <line x1={mx} y1={50 + row * 70 + 6} x2={mx + 22} y2={50 + row * 70 + 6} stroke={room.accent} strokeWidth={2.2} opacity={0.95} />
                <line x1={mx + 26} y1={50 + row * 70 + 6} x2={mx + 48} y2={50 + row * 70 + 6} stroke={room.accent} strokeWidth={2.2} opacity={0.95} />
              </g>
            );
          })}
        </g>
      ))}
      <rect x={w - 130} y={50} width={100} height={h - 90} fill="url(#qa-stripes)" stroke="#FBBF24" strokeWidth={1.2} opacity={0.85} />
    </g>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  9 · SERVER ROOM                                                           */
/* ────────────────────────────────────────────────────────────────────────── */
const Servers: React.FC<FurnitureProps> = ({ room }) => {
  const w = room.width;
  const h = room.height;
  return (
    <g>
      <defs>
        <pattern id="tech-floor" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke={room.accent} strokeWidth="0.3" opacity="0.3" />
        </pattern>
      </defs>
      <rect x={20} y={20} width={w - 40} height={h - 40} fill="url(#tech-floor)" />
      {[0, 1].map((col) => Array.from({ length: 8 }).map((_, i) => {
        const x = 30 + col * 60;
        const y = 40 + i * 36;
        return (
          <g key={`${col}-${i}`}>
            <rect x={x} y={y} width={45} height={28} fill="hsl(222 30% 8%)" stroke={STROKE} strokeWidth={1} />
            <circle cx={x + 5} cy={y + 5} r={1.4} fill={room.accent} opacity={0.95} />
            <circle cx={x + 10} cy={y + 5} r={1.4} fill="#34D399" opacity={0.9} />
          </g>
        );
      }))}
    </g>
  );
};

export const FURNITURE: Record<string, React.FC<FurnitureProps>> = {
  reception: Reception,
  library: Library,
  team: TeamLounge,
  vault: Vault,
  "dna-lab": DnaLab,
  strategy: Strategy,
  architecture: Architecture,
  devhub: DevHub,
  servers: Servers,
};
