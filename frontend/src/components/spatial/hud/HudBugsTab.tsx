import React from "react";
import { Trash2, Copy } from "lucide-react";

interface PlatformBug {
  id: string;
  title: string;
  section: string;
  context: string;
  consoleLogs?: string;
  resolved: boolean;
  date: string;
}

interface HudBugsTabProps {
  bugs: PlatformBug[];
  bugTitle: string;
  setBugTitle: (val: string) => void;
  bugSection: string;
  setBugSection: (val: string) => void;
  bugContext: string;
  setBugContext: (val: string) => void;
  bugConsole: string;
  setBugConsole: (val: string) => void;
  onAddBug: (e: React.FormEvent) => void;
  onToggleResolveBug: (id: string) => void;
  onDeleteBug: (id: string) => void;
  onCopyBugForAI: (bug: PlatformBug) => void;
}

export const HudBugsTab: React.FC<HudBugsTabProps> = ({
  bugs,
  bugTitle,
  setBugTitle,
  bugSection,
  setBugSection,
  bugContext,
  setBugContext,
  bugConsole,
  setBugConsole,
  onAddBug,
  onToggleResolveBug,
  onDeleteBug,
  onCopyBugForAI
}) => {
  return (
    <div className="space-y-5">
      {/* Form to add bug */}
      <form onSubmit={onAddBug} className="p-4 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-3">
        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Reportar Error en MateCode</h4>
        
        <input 
          type="text"
          required
          value={bugTitle}
          onChange={(e) => setBugTitle(e.target.value)}
          placeholder="Título del error"
          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30"
        />
        
        <input 
          type="text"
          required
          value={bugSection}
          onChange={(e) => setBugSection(e.target.value)}
          placeholder="Sección (Auto-detectada)"
          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30"
        />

        <textarea 
          value={bugContext}
          onChange={(e) => setBugContext(e.target.value)}
          placeholder="Contexto / Pasos para reproducir..."
          rows={2}
          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30 resize-none"
        />

        <textarea 
          value={bugConsole}
          onChange={(e) => setBugConsole(e.target.value)}
          placeholder="Volcado de consola / Logs de error..."
          rows={2}
          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white font-mono outline-none focus:border-emerald-500/30 resize-none"
        />

        <button 
          type="submit"
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-xl text-[9px] uppercase tracking-widest transition-all"
        >
          Registrar Bug
        </button>
      </form>

      {/* List of bugs */}
      <div className="space-y-3">
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Historial de Bugs ({bugs.length})</span>
        {bugs.length === 0 ? (
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-[9px] text-zinc-600 text-center font-bold uppercase">
            Sin errores registrados. ¡Todo marcha bien!
          </div>
        ) : (
          bugs.map((bug) => (
            <div key={bug.id} className={`p-3 bg-white/5 border rounded-2xl flex flex-col gap-2 transition-all ${bug.resolved ? "border-zinc-800 opacity-60" : "border-white/5 hover:bg-white/[0.08]"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 truncate">
                  <input 
                    type="checkbox"
                    checked={bug.resolved}
                    onChange={() => onToggleResolveBug(bug.id)}
                    className="mt-1 accent-emerald-500 cursor-pointer"
                  />
                  <div className="truncate">
                    <h5 className={`text-[10px] font-black text-white uppercase truncate ${bug.resolved ? "line-through text-zinc-500" : ""}`}>{bug.title}</h5>
                    <p className="text-[7px] text-zinc-500 font-bold uppercase mt-0.5">{bug.section}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteBug(bug.id)}
                  className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {bug.context && (
                <p className="text-[9px] text-zinc-400 leading-normal italic pl-5">"{bug.context}"</p>
              )}

              <div className="flex gap-2 pl-5 mt-1">
                <button 
                  onClick={() => onCopyBugForAI(bug)}
                  className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
                >
                  <Copy size={10} /> Copiar para IA
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export type { PlatformBug };
