/**
 * SpatialOS.tsx
 * ---------------------------------------------------------------------------
 *  Top-level scene composition + UI overlay for the camera mode toggle.
 *  This is the ONLY file the host app needs to import to mount the experience:
 *
 *    import { SpatialOS } from "@/spatial-os/SpatialOS";
 *    <SpatialOS />
 *
 *  Architecture:
 *    - <Canvas /> (R3F)
 *      - <Lighting />
 *      - <BuildingShell />     // outer ground, corridor, perimeter
 *      - {ROOMS.map(...)}      // detailed rooms render their own RoomShell;
 *                              // remaining rooms render as labeled shells.
 *      - <CameraRig />         // smooth interpolation between view modes.
 * ---------------------------------------------------------------------------
 */
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Lock, Unlock } from "lucide-react";
import { ROOMS } from "./manifest";
import { Lighting } from "./Lighting";
import { BuildingShell } from "./BuildingShell";
import { CameraRig, type ViewMode } from "./CameraRig";
import { RoomShell } from "./primitives/RoomShell";
import { ReceptionRoom } from "./rooms/ReceptionRoom";
import { LibraryRoom } from "./rooms/LibraryRoom";
import { DevHubRoom } from "./rooms/DevHubRoom";
import { ServersRoom } from "./rooms/ServersRoom";
import { TeamRoom } from "./rooms/TeamRoom";
import { VaultRoom } from "./rooms/VaultRoom";
import { DnaLabRoom } from "./rooms/DnaLabRoom";
import { StrategyRoom } from "./rooms/StrategyRoom";
import { ArchitectureRoom } from "./rooms/ArchitectureRoom";
import { Presence } from "./Presence";

/**
 * Map of room.id → detailed component. Rooms not in this map render as a
 * walled, labeled, accent-lit shell (placeholder ready for furniture).
 */
const DETAILED_ROOMS: Record<string, React.FC> = {
  reception: ReceptionRoom,
  library: LibraryRoom,
  devhub: DevHubRoom,
  servers: ServersRoom,
  team: TeamRoom,
  vault: VaultRoom,
  "dna-lab": DnaLabRoom,
  strategy: StrategyRoom,
  architecture: ArchitectureRoom,
};

export function SpatialOS() {
  const [mode, setMode] = useState<ViewMode>("isometric");
  const [isLocked, setIsLocked] = useState(true);

  return (
    <div className="relative h-screen w-screen bg-[#05070b]">
      <Canvas
        shadows
        camera={{ position: [28, 26, 28], fov: 35, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#05070b"]} />
        <fog attach="fog" args={["#05070b", 60, 140]} />
        <Lighting />
        <BuildingShell />
        {ROOMS.map((room) => {
          const Detailed = DETAILED_ROOMS[room.id];
          if (Detailed) return <Detailed key={room.id} />;
          // Fallback: render as labeled empty shell.
          return <RoomShell key={room.id} room={room} />;
        })}
        <Presence />
        <CameraRig mode={mode} locked={isLocked} />
      </Canvas>

      {/* Overlay UI */}
      <div className="pointer-events-none absolute inset-0 flex flex-col p-6">
        <header className="pointer-events-auto flex items-start justify-between">
          <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">
              Spatial OS · v0.1
            </div>
            <h1 className="mt-1 text-lg font-semibold text-white">
              Workspace Floor Plan
            </h1>
            <div className="mt-0.5 text-xs text-white/60">
              {ROOMS.length} salas · 2 alas
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-2 rounded-xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-md">
              <button
                onClick={() => setMode("top")}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                  mode === "top"
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                2D · Plano
              </button>
              <button
                onClick={() => setMode("isometric")}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                  mode === "isometric"
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                3D · Isométrico
              </button>
            </div>

            <button
              onClick={() => setIsLocked((v) => !v)}
              disabled={mode === "top"}
              title={mode === "top" ? "La vista 2D está siempre fija" : undefined}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium backdrop-blur-md transition ${
                mode === "top"
                  ? "cursor-not-allowed border-white/5 bg-black/30 text-white/30"
                  : isLocked
                    ? "border-white/10 bg-black/40 text-white/80 hover:bg-white/10"
                    : "border-emerald-400/40 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
              }`}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              <span>{isLocked ? "Cámara Bloqueada" : "Navegación Libre"}</span>
            </button>
          </div>
        </header>

        <div className="mt-auto flex items-end justify-between">
          <div className="pointer-events-auto rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">
              Leyenda
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-white/80">
              {ROOMS.slice(0, 8).map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: r.accent, boxShadow: `0 0 8px ${r.accent}` }}
                  />
                  <span className="truncate">{r.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-auto rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[11px] text-white/60 backdrop-blur-md">
            {mode === "isometric"
              ? "Arrastra para orbitar · scroll para zoom"
              : "Vista cenital fija"}
          </div>
        </div>
      </div>
    </div>
  );
}
