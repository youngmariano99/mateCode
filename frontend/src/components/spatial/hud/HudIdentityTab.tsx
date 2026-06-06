import React from "react";
import { User, Camera, Copy } from "lucide-react";

interface HudIdentityTabProps {
  profile: any;
  activeProjectId: string | null;
  activeProject: any;
  workspaceId: string | null;
  isUploadingAvatar: boolean;
  onAvatarSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCopyToClipboard: (text: string, label: string) => void;
}

export const HudIdentityTab: React.FC<HudIdentityTabProps> = ({
  profile,
  activeProjectId,
  activeProject,
  workspaceId,
  isUploadingAvatar,
  onAvatarSelect,
  onCopyToClipboard
}) => {
  return (
    <div className="space-y-4">
      {/* Username */}
      <div className="space-y-1.5">
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Usuario Activo</span>
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-[10px]">
          {/* Avatar Container with upload overlay */}
          <div className="relative group w-10 h-10 rounded-full bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            {(profile?.fotoPerfilUrl || profile?.foto_perfil_url) ? (
              <img 
                src={profile.fotoPerfilUrl || profile.foto_perfil_url} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User size={18} className="text-zinc-500" />
            )}
            
            {isUploadingAvatar ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-3.5 h-3.5 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <Camera size={12} className="text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={onAvatarSelect} 
                  className="hidden" 
                />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-white leading-none truncate">
              {profile?.nombreCompleto || profile?.nombre_completo || "Cargando..."}
            </p>
            <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1 truncate">
              {profile?.nombreUsuario ? `@${profile.nombreUsuario}` : (profile?.nombre_usuario ? `@${profile.nombre_usuario}` : (profile?.email || "Sin email"))}
            </p>
          </div>

          {profile && (
            <button 
              onClick={() => onCopyToClipboard(profile.nombreUsuario || profile.nombre_usuario || profile.email, "Usuario")}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all shrink-0"
            >
              <Copy size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Active Project ID */}
      <div className="space-y-1.5">
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">ID del Proyecto</span>
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-[10px]">
          <div className="truncate pr-2">
            <p className="font-bold text-white leading-none truncate">{activeProject?.nombre || "Ninguno seleccionado"}</p>
            <p className="text-[8px] text-zinc-500 font-mono mt-1 truncate">{activeProjectId || "N/A"}</p>
          </div>
          {activeProjectId && (
            <button 
              onClick={() => onCopyToClipboard(activeProjectId, "ID de Proyecto")}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
            >
              <Copy size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Tenant / Workspace ID */}
      <div className="space-y-1.5">
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">ID del Espacio (Tenant)</span>
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-[10px]">
          <div className="truncate pr-2">
            <p className="text-[8px] text-zinc-500 font-mono truncate">{workspaceId || "N/A"}</p>
          </div>
          {workspaceId && (
            <button 
              onClick={() => onCopyToClipboard(workspaceId, "ID de Espacio")}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
            >
              <Copy size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
