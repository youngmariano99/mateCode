import React from 'react';
import { ShieldCheck, Layers, Zap, Rocket } from 'lucide-react';

interface ProjectStandardsAsideProps {
  onNavigatePhase1: () => void;
}

export const ProjectStandardsAside = ({ onNavigatePhase1 }: ProjectStandardsAsideProps) => {
  return (
    <aside className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl sticky top-8 border-b-emerald-500/20 border-b-4">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl"><ShieldCheck className="text-emerald-500 h-6 w-6" /></div>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-[0.2em]">MateCode Engine</h3>
        </div>
        <p className="text-xs text-zinc-500 font-medium mb-10 leading-relaxed italic border-l-4 border-zinc-800 pl-6">
            "El ADN constituye la semilla del software. Capturá la lógica de negocio aquí para automatizar los diagramas y requisitos más adelante."
        </p>
        <ul className="space-y-6">
            <li className="flex items-start gap-4 transition-all hover:translate-x-1 group/li"><Layers className="text-zinc-700 h-5 w-5 mt-0.5 group-hover/li:text-emerald-500" /><div><h4 className="text-[10px] font-black text-zinc-300 uppercase italic">Clean Architecture</h4><p className="text-[10px] text-zinc-600 font-medium leading-tight mt-1">Estructura agnóstica a la base de datos.</p></div></li>
            <li className="flex items-start gap-4 transition-all hover:translate-x-1 group/li"><Zap className="text-zinc-700 h-5 w-5 mt-0.5 group-hover/li:text-emerald-500" /><div><h4 className="text-[10px] font-black text-zinc-300 uppercase italic">Requisitos IA</h4><p className="text-[10px] text-zinc-600 font-medium leading-tight mt-1">Generación de HU automática en Fase 1.</p></div></li>
        </ul>
        <div className="mt-12 pt-8 border-t border-zinc-800">
            <button onClick={onNavigatePhase1} className="w-full py-5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg">Avanzar a Phase 1 <Rocket size={18} /></button>
        </div>
      </div>
    </aside>
  );
};
