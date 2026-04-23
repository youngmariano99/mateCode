import React from 'react';
import { ShieldCheck, Layers, Zap, Rocket, Cpu } from 'lucide-react';

interface ProjectStandardsAsideProps {
  onNavigatePhase1: () => void;
  progress: number;
  engineeringDone: boolean;
  stackCount: number;
  standardsCount: number;
}

export const ProjectStandardsAside = ({ 
    onNavigatePhase1, 
    progress, 
    engineeringDone, 
    stackCount, 
    standardsCount 
}: ProjectStandardsAsideProps) => {
  return (
    <aside className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl sticky top-8 border-b-emerald-500/20 border-b-4 overflow-hidden">
        {/* EFECTO DE FONDO */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
        
        <div className="flex items-center gap-3 mb-10 relative z-10">
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-emerald-500 shadow-inner">
                <ShieldCheck size={24} />
            </div>
            <div>
                <h3 className="font-black text-white text-xs uppercase tracking-[0.2em]">DNA Health</h3>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Estado de Madurez</p>
            </div>
        </div>

        {/* BARRA DE PROGRESO GLOBAL */}
        <div className="space-y-4 mb-10 relative z-10">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-zinc-400 uppercase italic">Integridad Total</span>
                <span className="text-2xl font-black text-emerald-500 italic tracking-tighter">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>

        <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-4">
                    <Cpu className={`h-5 w-5 ${engineeringDone ? 'text-emerald-500' : 'text-zinc-700'}`} />
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Ingeniería</span>
                </div>
                {engineeringDone ? <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" /> : <div className="w-2 h-2 rounded-full bg-zinc-800" />}
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-4">
                    <Layers className={`h-5 w-5 ${stackCount > 0 ? 'text-emerald-500' : 'text-zinc-700'}`} />
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Stack Tecnológico</span>
                </div>
                <span className="text-[10px] font-black text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">{stackCount}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-4">
                    <Zap className={`h-5 w-5 ${standardsCount > 0 ? 'text-emerald-500' : 'text-zinc-700'}`} />
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Blueprint</span>
                </div>
                <span className="text-[10px] font-black text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">{standardsCount}</span>
            </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 relative z-10">
            <p className="text-[10px] text-zinc-500 leading-relaxed italic mb-8 text-center px-4">
                "Completá el ADN para habilitar la generación de HU y Requisitos en la Fase 1."
            </p>
            <button 
                onClick={onNavigatePhase1} 
                disabled={progress < 30}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-lg ${progress >= 30 ? 'bg-emerald-500 text-zinc-950 hover:scale-105 shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}`}
            >
                Avanzar a Phase 1 <Rocket size={18} />
            </button>
        </div>
      </div>
    </aside>
  );
};
