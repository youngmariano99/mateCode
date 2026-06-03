import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Plus, Shield, ExternalLink } from 'lucide-react';
import { useAgencyStore } from '../../store/useAgencyStore';
import type { Member, Agency } from '../../store/useAgencyStore';

interface StructurePanelProps {
  activeAgency: Agency | null;
  agencyWorkspaces: any[];
  agencyMembers: Member[];
  onOpenInviteModal: () => void;
  onOpenPermModal: (member: Member) => void;
}

export const StructurePanel: React.FC<StructurePanelProps> = ({
  activeAgency,
  agencyWorkspaces,
  agencyMembers,
  onOpenInviteModal,
  onOpenPermModal
}) => {
  const navigate = useNavigate();
  const { setAgencyId } = useAgencyStore();

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Estructura & Equipo</h1>
          <p className="text-zinc-500 text-xs mt-1">Explora los espacios de trabajo de la organización y gestiona los permisos granulares de los miembros.</p>
        </div>
        {activeAgency?.tipo !== 'personal' && (
          <button
            onClick={onOpenInviteModal}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus size={14} />
            <span>Invitar Miembro</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Espacios y Proyectos */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Briefcase size={16} className="text-emerald-400" />
            <span>Árbol de Proyectos</span>
          </h3>
          
          <div className="space-y-4">
            {agencyWorkspaces.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-800 text-center rounded-2xl text-zinc-600 text-xs">
                No se han cimentado espacios de trabajo en esta organización.
              </div>
            ) : (
              agencyWorkspaces.map(ws => (
                <div key={ws.id} className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-zinc-100 flex items-center gap-2">
                      <Briefcase size={14} className="text-zinc-500" />
                      <span>{ws.nombre}</span>
                    </span>
                    <button
                      onClick={() => {
                        setAgencyId(activeAgency?.id || null);
                        localStorage.setItem('mc_current_tenant', ws.id);
                        navigate(`/workspace/mi-oficina`);
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                    >
                      <span>Ingresar al mapa</span>
                      <ExternalLink size={10} />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">ID: {ws.id}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Miembros y Roles */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Users size={16} className="text-indigo-400" />
            <span>Miembros de la Organización</span>
          </h3>

          <div className="space-y-3">
            {agencyMembers.map(m => (
              <div key={m.usuario_id} className="p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-200">{m.usuario?.nombre_completo || 'Usuario'}</p>
                  <p className="text-xs text-zinc-500">{m.usuario?.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] font-black uppercase bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                      {m.rol}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      m.estado_invitacion === 'Aceptada' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {m.estado_invitacion}
                    </span>
                  </div>
                </div>

                {activeAgency?.tipo !== 'personal' && m.rol !== 'Propietario' && (
                  <button
                    onClick={() => onOpenPermModal(m)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Shield size={12} className="text-indigo-400" />
                    <span>Permisos</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
