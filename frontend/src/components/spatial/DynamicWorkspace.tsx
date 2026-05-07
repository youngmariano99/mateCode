/**
 * ============================================================================
 *  <DynamicWorkspace /> — High-Performance Tool Container
 * ============================================================================
 */

import React, { useEffect, useState } from "react";
import { Maximize2, Minimize2, PanelRight, X, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface QuickSwitchItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export type WorkspaceViewMode = "windowed" | "maximized" | "drawer";

export interface WorkspaceRoomRef {
  id: string;
  name: string;
  subtitle?: string;
  accent?: string;
}

export interface DynamicWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  activeRoom?: WorkspaceRoomRef | null;
  initialView?: WorkspaceViewMode;
  loading?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  onViewModeChange?: (mode: WorkspaceViewMode) => void;
  quickSwitch?: QuickSwitchItem[];
  onQuickSwitch?: (id: string) => void;
}

const VIEW_CLASSES: Record<WorkspaceViewMode, string> = {
  windowed: "w-[90vw] h-[85vh] rounded-2xl shadow-2xl shadow-black/50 border border-white/10",
  maximized: "flex-1 h-screen rounded-none m-0 border-none",
  drawer: "absolute right-0 top-0 w-full md:w-[45vw] h-screen rounded-l-3xl rounded-r-none shadow-2xl shadow-black/50 border-l border-white/10",
};

const WRAPPER_POSITION: Record<WorkspaceViewMode, string> = {
  windowed: "items-center justify-center p-4",
  maximized: "items-stretch justify-stretch p-0",
  drawer: "items-stretch justify-end p-0",
};

export const DynamicWorkspace: React.FC<DynamicWorkspaceProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  activeRoom,
  initialView = "windowed",
  loading = false,
  actions,
  children,
  onViewModeChange,
  quickSwitch,
  onQuickSwitch,
}) => {
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>(initialView);

  // Solo resetear al modo inicial cuando el workspace se ABRE (no cuando cambia la sala estando abierto)
  useEffect(() => {
    if (isOpen) {
      // Si ya estaba abierto, no tocamos el viewMode para que no se minimice al usar QuickSwitch
    }
  }, [isOpen]);

  // Si cambia la sala y estamos cerrados, ahí sí preparamos el modo inicial para la siguiente apertura
  useEffect(() => {
    if (!isOpen) {
      setViewMode(initialView);
    }
  }, [isOpen, initialView]);

  useEffect(() => {
    onViewModeChange?.(isOpen ? viewMode : "windowed");
  }, [isOpen, viewMode, onViewModeChange]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const accent = activeRoom?.accent ?? "#10B981";
  const isMaximized = viewMode === "maximized";
  const backdropClass = isMaximized ? "bg-zinc-950" : "bg-zinc-950/60 backdrop-blur-xl";

  const ctrlBtn = "h-9 w-9 grid place-items-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all";
  const ctrlBtnActive = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";

  return (
    <div
      className={`fixed inset-0 z-[200] flex ${WRAPPER_POSITION[viewMode]} ${backdropClass} transition-all duration-500 ease-in-out`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {isMaximized && quickSwitch && quickSwitch.length > 0 && (
        <aside className="shrink-0 w-16 h-screen bg-zinc-950 border-r border-white/5 flex flex-col items-center py-6 gap-3 z-50">
          {quickSwitch.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeRoom?.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onQuickSwitch?.(item.id)}
                  className={`h-11 w-11 grid place-items-center rounded-xl transition-all ${
                    active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "text-zinc-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </button>
                
                {/* Tooltip Dinámico */}
                <div className="absolute left-full ml-3 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-[-10px] group-hover:translate-x-0 transition-all z-[60] shadow-2xl">
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
                </div>
              </div>
            );
          })}
        </aside>
      )}

      <section className={`relative flex flex-col overflow-hidden bg-[#0A0F1A] transition-all duration-500 ease-in-out ${VIEW_CLASSES[viewMode]}`}>
        <div className="h-[3px] w-full shrink-0" style={{ backgroundColor: accent, boxShadow: `0 0 15px ${accent}40` }} />

        <header className="shrink-0 flex items-center justify-between gap-4 px-8 py-5 border-b border-white/5 bg-zinc-900/20 backdrop-blur-md">
          <div className="min-w-0 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}>
               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-white text-xl font-black tracking-tight truncate uppercase italic">{title}</h2>
              {subtitle && <p className="text-zinc-500 text-[10px] font-black tracking-[0.2em] uppercase mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions && <div className="flex items-center gap-2 mr-4">{actions}</div>}
            <button onClick={() => setViewMode(isMaximized ? "windowed" : "maximized")} className={`${ctrlBtn} ${isMaximized ? ctrlBtnActive : ""}`}>
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={() => setViewMode(viewMode === "drawer" ? "windowed" : "drawer")} className={`${ctrlBtn} ${viewMode === "drawer" ? ctrlBtnActive : ""}`}>
              <PanelRight size={18} />
            </button>
            <div className="w-[1px] h-6 bg-white/10 mx-1" />
            <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[#05070a] relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Workspace...</p>
            </div>
          ) : children}
        </div>
      </section>
    </div>
  );
};

export default DynamicWorkspace;
