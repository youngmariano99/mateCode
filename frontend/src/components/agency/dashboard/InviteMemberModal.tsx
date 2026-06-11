import React from 'react';
import { motion } from 'framer-motion';
import { Users, X, Search, Plus, Key, DollarSign, Calendar } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspacesWithProjects: any[];
  inviteEmail: string;
  setInviteEmail: (val: string) => void;
  inviteRol: string;
  setInviteRol: (val: string) => void;
  inviteRoleTag: string;
  setInviteRoleTag: (val: string) => void;
  inviteModules: any;
  setInviteModules: (val: any) => void;
  inviteWorkspaces: Record<string, boolean>;
  setInviteWorkspaces: (val: any) => void;
  inviteProjects: Record<string, boolean>;
  setInviteProjects: (val: any) => void;
  inviteSearchTerm: string;
  onSearchUsers: (query: string) => Promise<void>;
  inviteSearchResults: any[];
  isInviteSearching: boolean;
  onInviteSubmit: (e: React.FormEvent) => Promise<void>;
  onInviteWorkspaceChange: (wsId: string, checked: boolean) => void;
  onInviteSearchResultsClear: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  workspacesWithProjects,
  inviteEmail,
  setInviteEmail,
  inviteRol,
  setInviteRol,
  inviteRoleTag,
  setInviteRoleTag,
  inviteModules,
  setInviteModules,
  inviteWorkspaces,
  setInviteWorkspaces,
  inviteProjects,
  setInviteProjects,
  inviteSearchTerm,
  onSearchUsers,
  inviteSearchResults,
  isInviteSearching,
  onInviteSubmit,
  onInviteWorkspaceChange,
  onInviteSearchResultsClear
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[250] p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4 my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="text-emerald-400" />
            <span>Invitar Miembro a la Agencia</span>
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Buscador de usuarios registrados */}
        <div className="space-y-1.5 relative">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Buscar Usuario Registrado</label>
          <div className="flex items-center bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
            <Search size={14} className="text-zinc-500 mr-2" />
            <input
              type="text"
              placeholder="Escribe nombre o email (min. 3 caracteres)..."
              value={inviteSearchTerm}
              onChange={e => onSearchUsers(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-white placeholder:text-zinc-650"
            />
            {isInviteSearching && <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
          </div>

          {inviteSearchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[100] max-h-48 overflow-y-auto">
              {inviteSearchResults.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    setInviteEmail(u.email);
                    onSearchUsers(u.nombreCompleto);
                    onInviteSearchResultsClear();
                  }}
                  className="p-2.5 hover:bg-emerald-500/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <p className="font-bold text-white">{u.nombreCompleto}</p>
                    <p className="text-[10px] text-zinc-500">{u.email}</p>
                  </div>
                  <Plus size={14} className="text-emerald-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={onInviteSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Email del Colaborador (Destinatario)</label>
            <input required type="email" placeholder="ejemplo@correo.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Rol en la Organización</label>
              <select value={inviteRol} onChange={e => setInviteRol(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                <option value="Administrador">Administrador</option>
                <option value="Colaborador">Colaborador</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Etiqueta de Especialidad</label>
              <input type="text" placeholder="Ej: Desarrollador | Frontend" value={inviteRoleTag} onChange={e => setInviteRoleTag(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Matriz de Acceso Inicial</h4>

            {[
              { key: 'crm', label: 'Clientes/CRM', icon: Users, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Editar / Crear' }] },
              { key: 'secrets', label: 'Accesos Vault', icon: Key, options: [{ v: 'none', l: 'Prohibido' }, { v: 'read', l: 'Permitido Revelar' }] },
              { key: 'finances', label: 'Finanzas', icon: DollarSign, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Registrar' }] },
              { key: 'tasks', label: 'Tareas Operativas', icon: Calendar, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Organizar' }] },
            ].map(p => {
              const Icon = p.icon;
              return (
                <div key={p.key} className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-300 flex items-center gap-2">
                    <Icon size={14} className="text-zinc-500" />
                    <span>{p.label}</span>
                  </span>
                  <select
                    value={inviteModules[p.key] || 'none'}
                    onChange={e => setInviteModules({ ...inviteModules, [p.key]: e.target.value })}
                    className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-[10px] text-white"
                  >
                    {p.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Árbol Jerárquico de Espacios y Proyectos */}
          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Accesos a Espacios y Proyectos (Jerárquico)</h4>
            
            {workspacesWithProjects.length === 0 ? (
              <p className="text-[10px] text-zinc-550 italic">No hay espacios de trabajo en la agencia.</p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto p-1 bg-zinc-950/20 rounded-xl border border-zinc-800">
                {workspacesWithProjects.map(ws => {
                  const wsChecked = !!inviteWorkspaces[ws.id];
                  return (
                    <div key={ws.id} className="p-2 border border-zinc-900 bg-zinc-950/25 rounded-lg space-y-1.5">
                      <label className="flex items-center gap-2 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wsChecked}
                          onChange={e => onInviteWorkspaceChange(ws.id, e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-zinc-900 cursor-pointer"
                        />
                        <span className={`text-xs font-bold ${wsChecked ? 'text-emerald-400' : 'text-zinc-450'}`}>
                          {ws.nombre}
                        </span>
                      </label>

                      {ws.projects && ws.projects.length > 0 && (
                        <div className="pl-5 border-l border-zinc-800 ml-1.5 space-y-1">
                          {ws.projects.map((p: any) => {
                            const projChecked = wsChecked && !!inviteProjects[p.id];
                            return (
                              <label key={p.id} className={`flex items-center gap-2 select-none ${wsChecked ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                                <input
                                  type="checkbox"
                                  disabled={!wsChecked}
                                  checked={projChecked}
                                  onChange={e => setInviteProjects({ ...inviteProjects, [p.id]: e.target.checked })}
                                  className="w-3.5 h-3.5 rounded border-zinc-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 bg-zinc-900 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <span className={`text-[10px] ${projChecked ? 'text-indigo-400 font-bold' : 'text-zinc-500'}`}>
                                  {p.nombre}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-750 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-450 transition-colors">Enviar Invitación</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
