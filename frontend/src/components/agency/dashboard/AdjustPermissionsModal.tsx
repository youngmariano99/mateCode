import React from 'react';
import { motion } from 'framer-motion';
import { Shield, X, Users, Key, DollarSign, Calendar } from 'lucide-react';

interface AdjustPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: any;
  workspacesWithProjects: any[];
  editRol: string;
  setEditRol: (val: string) => void;
  editRoleTag: string;
  setEditRoleTag: (val: string) => void;
  editModules: any;
  setEditModules: (val: any) => void;
  editWorkspaces: Record<string, boolean>;
  setEditWorkspaces: (val: any) => void;
  editProjects: Record<string, boolean>;
  setEditProjects: (val: any) => void;
  onSavePermissions: (e: React.FormEvent) => Promise<void>;
  onEditWorkspaceChange: (wsId: string, checked: boolean) => void;
}

export const AdjustPermissionsModal: React.FC<AdjustPermissionsModalProps> = ({
  isOpen,
  onClose,
  selectedMember,
  workspacesWithProjects,
  editRol,
  setEditRol,
  editRoleTag,
  setEditRoleTag,
  editModules,
  setEditModules,
  editWorkspaces,
  setEditWorkspaces,
  editProjects,
  setEditProjects,
  onSavePermissions,
  onEditWorkspaceChange
}) => {
  if (!isOpen || !selectedMember) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4 my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="text-indigo-400" />
            <span>Ajustar Permisos: {selectedMember.usuario?.nombre_completo || selectedMember.nombre_completo || selectedMember.email}</span>
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSavePermissions} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Rol en la Organización</label>
              <select value={editRol} onChange={e => setEditRol(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                <option value="Administrador">Administrador</option>
                <option value="Colaborador">Colaborador</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Etiqueta de Especialidad</label>
              <input type="text" placeholder="Ej: Desarrollador | Frontend" value={editRoleTag} onChange={e => setEditRoleTag(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Matriz de Acceso Modular</h4>

            {[
              { key: 'crm', label: 'Clientes/CRM', icon: Users, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Editar / Crear' }] },
              { key: 'secrets', label: 'Accesos Vault', icon: Key, options: [{ v: 'none', l: 'Prohibido' }, { v: 'read', l: 'Permitido Revelar' }] },
              { key: 'finances', label: 'Finanzas', icon: DollarSign, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Registrar Movimientos' }] },
              { key: 'tasks', label: 'Tareas Operativas', icon: Calendar, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Organizar Actividades' }] },
            ].map(p => {
              const Icon = p.icon;
              return (
                <div key={p.key} className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-300 flex items-center gap-2">
                    <Icon size={14} className="text-zinc-500" />
                    <span>{p.label}</span>
                  </span>
                  <select
                    value={editModules[p.key] || 'none'}
                    onChange={e => setEditModules({ ...editModules, [p.key]: e.target.value })}
                    className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white"
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
                  const wsChecked = !!editWorkspaces[ws.id];
                  return (
                    <div key={ws.id} className="p-2 border border-zinc-900 bg-zinc-950/25 rounded-lg space-y-1.5">
                      <label className="flex items-center gap-2 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wsChecked}
                          onChange={e => onEditWorkspaceChange(ws.id, e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-zinc-900 cursor-pointer"
                        />
                        <span className={`text-xs font-bold ${wsChecked ? 'text-emerald-400' : 'text-zinc-450'}`}>
                          {ws.nombre}
                        </span>
                      </label>

                      {ws.projects && ws.projects.length > 0 && (
                        <div className="pl-5 border-l border-zinc-800 ml-1.5 space-y-1">
                          {ws.projects.map((p: any) => {
                            const projChecked = wsChecked && !!editProjects[p.id];
                            return (
                              <label key={p.id} className={`flex items-center gap-2 select-none ${wsChecked ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                                <input
                                  type="checkbox"
                                  disabled={!wsChecked}
                                  checked={projChecked}
                                  onChange={e => setEditProjects({ ...editProjects, [p.id]: e.target.checked })}
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
            <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-450 transition-colors">Guardar Permisos</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
