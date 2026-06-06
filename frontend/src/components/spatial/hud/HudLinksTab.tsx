import React from "react";
import { ExternalLink, Trash2, Plus } from "lucide-react";

interface CustomLink {
  id: string;
  name: string;
  url: string;
}

interface HudLinksTabProps {
  activeProjectId: string | null;
  customLinks: CustomLink[];
  newLinkName: string;
  setNewLinkName: (val: string) => void;
  newLinkUrl: string;
  setNewLinkUrl: (val: string) => void;
  onAddLink: (e: React.FormEvent) => void;
  onDeleteLink: (id: string) => void;
}

export const HudLinksTab: React.FC<HudLinksTabProps> = ({
  activeProjectId,
  customLinks,
  newLinkName,
  setNewLinkName,
  newLinkUrl,
  setNewLinkUrl,
  onAddLink,
  onDeleteLink
}) => {
  return (
    <div className="space-y-4">
      {/* Static Preconfigured Links */}
      <div>
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Globales</span>
        <div className="mt-1.5 space-y-1.5">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] text-zinc-300 hover:text-white transition-all font-bold"
          >
            <span>Documentación MateCode</span>
            <ExternalLink size={12} className="text-zinc-500" />
          </a>
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] text-zinc-300 hover:text-white transition-all font-bold"
          >
            <span>Supabase Console</span>
            <ExternalLink size={12} className="text-zinc-500" />
          </a>
        </div>
      </div>

      {/* Custom Project Links */}
      <div>
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">De este Proyecto</span>
        {!activeProjectId ? (
          <div className="mt-2 p-3 border border-dashed border-zinc-800 rounded-2xl text-center text-[9px] text-zinc-600 font-bold uppercase">
            Selecciona un proyecto para configurar enlaces.
          </div>
        ) : (
          <div className="mt-1.5 space-y-1.5">
            {customLinks.length === 0 ? (
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-[9px] text-zinc-600 text-center uppercase font-bold">
                Sin enlaces personalizados
              </div>
            ) : (
              customLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2">
                  <a 
                    href={link.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] text-zinc-300 hover:text-white transition-all font-bold truncate"
                  >
                    <span className="truncate">{link.name}</span>
                    <ExternalLink size={12} className="text-zinc-500 shrink-0 ml-2" />
                  </a>
                  <button 
                    onClick={() => onDeleteLink(link.id)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}

            {/* Add link form */}
            <form onSubmit={onAddLink} className="mt-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
              <input 
                type="text"
                required
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                placeholder="Nombre (Ej: Figma)"
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30"
              />
              <div className="flex gap-2">
                <input 
                  type="text"
                  required
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="URL (Ej: figma.com/file/...)"
                  className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30"
                />
                <button 
                  type="submit"
                  className="px-3 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-xl text-[9px] uppercase tracking-widest transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
