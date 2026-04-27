import React from 'react';
import { Box, Sparkles, ArrowRight } from 'lucide-react';

export const ProjectSelectorRequired: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-transparent animate-in fade-in zoom-in duration-700">
      <div className="relative mb-10">
        <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 bg-zinc-900 border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
          <Box size={48} className="text-emerald-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-950 border border-emerald-500/50 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles size={16} className="text-emerald-400" />
        </div>
      </div>
      
      <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">
        Sincronización Interrumpida
      </h3>
      
      <p className="text-zinc-500 max-w-md text-lg font-medium leading-relaxed mb-10">
        Esta sala requiere una conexión activa con un proyecto. Por favor, selecciona un <span className="text-emerald-500 font-bold">Proyecto Activo</span> en la barra superior para proyectar los datos en el mapa.
      </p>

      <div className="flex items-center gap-4 px-6 py-3 bg-zinc-900/50 border border-white/5 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        Esperando señal del Oráculo...
      </div>
    </div>
  );
};
