import React from 'react';
import { Edit2, Copy, Check, Bell, LogOut } from 'lucide-react';

interface AgencySidebarProps {
  profileData: any;
  currentUser: any;
  userName: string;
  copiedEmail: boolean;
  onCopyEmail: () => void;
  onOpenEditProfile: () => void;
  invitations: any[];
  onAcceptInvite: (id: string) => Promise<void>;
  onRejectInvite: (id: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export const AgencySidebar: React.FC<AgencySidebarProps> = ({
  profileData,
  currentUser,
  userName,
  copiedEmail,
  onCopyEmail,
  onOpenEditProfile,
  invitations,
  onAcceptInvite,
  onRejectInvite,
  onLogout,
}) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-[2rem] flex flex-col justify-between w-full lg:w-80 shrink-0 backdrop-blur-xl shadow-xl min-h-[480px]">
      <div className="space-y-6">
        {/* Perfil del Usuario */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/65 gap-2">
          <div className="flex items-center gap-3.5 min-w-0">
            {profileData?.fotoPerfilUrl ? (
              <img 
                src={profileData.fotoPerfilUrl} 
                alt={userName} 
                className="w-12 h-12 rounded-2xl border border-zinc-800 object-cover shrink-0" 
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center shadow-inner shrink-0">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-white truncate">{userName}</h3>
              {profileData?.nombreUsuario && (
                <span className="text-[11px] text-emerald-400 font-mono block truncate">@{profileData.nombreUsuario}</span>
              )}
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block mt-0.5">Control Personal</span>
            </div>
          </div>
          <button
            onClick={onOpenEditProfile}
            className="p-1.5 bg-zinc-950/40 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400 rounded-xl transition-colors shrink-0"
            title="Editar Perfil"
          >
            <Edit2 size={13} />
          </button>
        </div>

        {/* Identidad copiable para recibir invitaciones */}
        <div className="bg-zinc-950/65 border border-zinc-850 p-4 rounded-2xl space-y-3">
          <div>
            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              Identificador (Búsqueda BD)
            </div>
            <div className="flex items-center justify-between gap-2 bg-zinc-900/40 p-2 rounded-xl border border-zinc-800 mt-1">
              <span className="text-[10px] font-mono text-emerald-400 truncate max-w-[170px]" title={currentUser?.email}>
                {currentUser?.email || 'Cargando...'}
              </span>
              <button
                onClick={onCopyEmail}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 rounded-lg transition-colors shrink-0"
                title="Copiar identificador de búsqueda"
              >
                {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div>
            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              Nombre en Cuenta
            </div>
            <div className="text-xs font-semibold text-zinc-300 mt-0.5">
              {userName}
            </div>
          </div>

          <span className="text-[8px] text-zinc-650 block leading-tight pt-1.5 border-t border-zinc-900">
            Proporciona tu identificador (email) a tus socios para que te inviten a sus organizaciones o contratos.
          </span>
        </div>

        {/* Bandeja de Notificaciones de Invitación */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2">
            <Bell size={12} className="text-indigo-400" />
            <span>Invitaciones Pendientes</span>
            {invitations.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black text-[8px] font-black">{invitations.length}</span>
            )}
          </h4>
          {invitations.length === 0 ? (
            <p className="text-[10px] text-zinc-600 italic">No tienes notificaciones o invitaciones.</p>
          ) : (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 neon-scrollbar">
              {invitations.map((invite: any) => (
                <div key={invite.agencyId} className="bg-zinc-950/70 border border-emerald-500/20 p-3 rounded-2xl space-y-2">
                  <div>
                    <p className="text-[11px] font-bold text-white leading-tight">{invite.agencyNombre}</p>
                    <p className="text-[8px] text-zinc-550 uppercase tracking-widest mt-0.5">Rol: {invite.rolInvitado}</p>
                    {invite.invitadoPor && (
                      <div className="mt-1.5 pt-1 border-t border-zinc-900 text-[9px] text-zinc-400">
                        <span>Invitado por: </span>
                        <span className="font-semibold text-emerald-400">{invite.invitadoPor}</span>
                        {invite.invitadoPorEmail && (
                          <span className="block text-[8px] text-zinc-550 font-mono truncate" title={invite.invitadoPorEmail}>
                            ({invite.invitadoPorEmail})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => onAcceptInvite(invite.agencyId)}
                      className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-bold rounded-lg transition-colors"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => onRejectInvite(invite.agencyId)}
                      className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-bold rounded-lg transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logout button at bottom of sidebar */}
      <button
        onClick={onLogout}
        className="w-full mt-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
      >
        <LogOut size={13} />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
};
