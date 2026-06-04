import React, { useState, useEffect } from 'react';
import { useAgencyStore } from '../../store/useAgencyStore';
import type { Member } from '../../store/useAgencyStore';
import { Users, Loader2 } from 'lucide-react';

interface CollaboratorsListProps {
  projectId: string; // Used for context or specific permissions filtering if needed
}

export const CollaboratorsList: React.FC<CollaboratorsListProps> = () => {
  const { currentAgencyId, fetchMembers, activeAgency } = useAgencyStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      if (!currentAgencyId) return;
      setLoading(true);
      try {
        const mems = await fetchMembers(currentAgencyId);
        // Only show accepted members
        setMembers(mems.filter(m => m.estado_invitacion === 'Aceptada' || m.estado_invitacion === 'Aceptado' || m.rol === 'Propietario'));
      } catch (err) {
        console.error('Error fetching collaborators:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [currentAgencyId]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const getRoleBadgeStyle = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'propietario':
        return 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5';
      case 'administrador':
        return 'border-blue-500/20 text-blue-400 bg-blue-500/5';
      default:
        return 'border-purple-500/20 text-purple-400 bg-purple-500/5';
    }
  };

  const getAvatarBg = (name: string) => {
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-red-650'
    ];
    return colors[charCodeSum % colors.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
          <Users size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">Equipo de Trabajo</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase">Colaboradores asignados al espacio {activeAgency?.nombre || ''}</p>
        </div>
      </div>

      {members.length === 0 ? (
        <p className="text-center py-6 text-zinc-500 text-xs font-black uppercase">No hay colaboradores activos en este espacio.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => {
            const fullName = member.usuario?.nombre_completo || member.usuario?.email || 'Miembro Invitado';
            return (
              <div
                key={member.usuario_id}
                className="flex items-center gap-4 p-4 bg-zinc-950/40 rounded-2xl border border-zinc-850 hover:border-zinc-800 transition-all group"
              >
                {/* Immersive Avatar */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarBg(fullName)} flex items-center justify-center text-sm font-black text-zinc-950 shadow-md group-hover:scale-105 transition-all`}>
                  {getInitials(fullName)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{fullName}</p>
                  <p className="text-[10px] text-zinc-500 font-medium truncate">{member.usuario?.email}</p>
                </div>

                <div>
                  <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${getRoleBadgeStyle(member.rol)}`}>
                    {member.rol}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
