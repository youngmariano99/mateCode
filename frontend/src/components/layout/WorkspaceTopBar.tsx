import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { ChevronDown, User, Zap } from 'lucide-react';

interface Project {
  id: string;
  nombre: string;
}

export const WorkspaceTopBar: React.FC = () => {
  const { activeProjectId, setActiveProjectId } = useWorkspaceStore();
  
  // Proyectos hardcodeados según requerimiento de Fase 3
  const [projects] = useState<Project[]>([
    { id: 'proj-01', nombre: 'QuantumERP' },
    { id: 'proj-02', nombre: 'SaaS Indumentaria' },
    { id: 'proj-03', nombre: 'MateCode Platform' }
  ]);

  useEffect(() => {
    if (projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId, setActiveProjectId]);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-[100] shadow-2xl">
      {/* Lado Izquierdo: Logo */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] group hover:scale-105 transition-transform duration-500">
          <Zap size={22} className="text-emerald-400 fill-emerald-400/20 group-hover:animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-black tracking-[0.25em] text-white uppercase italic">
            MateCode OS
          </span>
          <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-[0.4em] -mt-0.5">
            Spatial Interface v3.0
          </span>
        </div>
      </div>

      {/* Centro: Selector de Proyecto Activo */}
      <div className="flex-1 max-w-md mx-12">
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <select
            value={activeProjectId || ''}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="relative w-full bg-zinc-950/40 border border-white/10 rounded-2xl px-6 py-3 text-xs font-black text-zinc-200 appearance-none focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-900/80 transition-all cursor-pointer hover:border-white/20 uppercase tracking-widest"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-zinc-950 text-white">
                {p.nombre}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-emerald-400 transition-colors">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Lado Derecho: Avatar */}
      <div className="flex items-center gap-5">
        <div className="text-right hidden md:block">
          <div className="text-[11px] font-black text-white uppercase tracking-widest">Mariano</div>
          <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter opacity-70">Architect Mode</div>
        </div>
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white transition-all cursor-pointer shadow-2xl overflow-hidden">
              <User size={24} />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
            </div>
        </div>
      </div>
    </header>
  );
};
