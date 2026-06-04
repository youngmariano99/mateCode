import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, User, Copy, ExternalLink, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { useOperationsStore } from '../../store/useOperationsStore';
import type { TaskOperative } from '../../store/useOperationsStore';
import { useAgencyStore } from '../../store/useAgencyStore';
import type { Member } from '../../store/useAgencyStore';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

interface KanbanBoardSubTabProps {
  agencyMembers: Member[];
}

export const KanbanBoardSubTab: React.FC<KanbanBoardSubTabProps> = ({ agencyMembers }) => {
  const { 
    tasks, fetchTasks, createTask, updateTaskStatus, updateTask, deleteTask,
    kanbanColumns, fetchKanbanColumns, resources, fetchResources 
  } = useOperationsStore();
  
  const { activeAgency, getAgencyWorkspacesWithProjects } = useAgencyStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskOperative | null>(null);
  
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]); // Filtered by selected workspace
  
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    estado: '',
    fecha_planificada: '',
    usuario_asignado_id: '',
    espacioTrabajoId: '',
    proyectoId: '',
    recursoId: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchKanbanColumns();
    fetchResources();
    if (activeAgency?.id) {
      getAgencyWorkspacesWithProjects(activeAgency.id).then(data => {
        setWorkspaces(data || []);
      });
    }
  }, [activeAgency?.id]);

  useEffect(() => {
    // Sync default column status in form if columns load
    if (kanbanColumns.length > 0 && !form.estado) {
      setForm(prev => ({ ...prev, estado: kanbanColumns[0].nombre }));
    }
  }, [kanbanColumns]);

  // Update projects list when workspace changes in form
  useEffect(() => {
    if (form.espacioTrabajoId) {
      const selectedWs = workspaces.find(w => w.id === form.espacioTrabajoId);
      setProjects(selectedWs?.proyectos || []);
    } else {
      setProjects([]);
    }
  }, [form.espacioTrabajoId, workspaces]);

  const columnsToRender = kanbanColumns.length > 0 
    ? kanbanColumns 
    : [
        { id: 'Todo', nombre: 'Todo', orden: 0 },
        { id: 'In Progress', nombre: 'In Progress', orden: 1 },
        { id: 'Done', nombre: 'Done', orden: 2 }
      ];

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setForm({
      titulo: '',
      descripcion: '',
      estado: columnsToRender[0]?.nombre || 'Todo',
      fecha_planificada: '',
      usuario_asignado_id: '',
      espacioTrabajoId: '',
      proyectoId: '',
      recursoId: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskOperative) => {
    setEditingTask(task);
    setForm({
      titulo: task.titulo,
      descripcion: task.descripcion || '',
      estado: task.estado,
      fecha_planificada: task.fecha_planificada ? task.fecha_planificada.split('T')[0] : '',
      usuario_asignado_id: task.usuario_asignado_id || '',
      espacioTrabajoId: task.espacio_trabajo_id || '',
      proyectoId: task.proyecto_id || '',
      recursoId: task.recurso_id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        estado: form.estado,
        fecha_planificada: form.fecha_planificada || undefined,
        usuario_asignado_id: form.usuario_asignado_id || undefined,
        espacioTrabajoId: form.espacioTrabajoId || undefined,
        proyectoId: form.proyectoId || undefined,
        recursoId: form.recursoId || undefined
      };

      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      await updateTaskStatus(id, targetStatus);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar actividad?',
      icon: 'warning',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (isConfirmed) {
      await deleteTask(id);
    }
  };

  const handleCopyPrompt = (e: React.MouseEvent, content: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Prompt copiado',
      showConfirmButton: false,
      timer: 1500,
      background: '#09090b',
      color: '#f4f4f5'
    });
  };

  const handleOpenLink = (e: React.MouseEvent, content: string) => {
    e.stopPropagation();
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const match = content.match(urlPattern);
    const url = match ? match[0] : content;
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/10"
        >
          <Plus size={14} />
          <span>Cargar Actividad</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start overflow-x-auto pb-4">
        {columnsToRender.map(col => (
          <div
            key={col.id || col.nombre}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.nombre)}
            className="bg-zinc-900/30 border border-zinc-800/60 rounded-3xl p-4 flex flex-col min-w-[280px] max-h-[700px]"
          >
            <h4 className="text-xs font-black uppercase text-zinc-400 border-b border-zinc-850 pb-3 mb-3 tracking-wider flex justify-between items-center">
              <span>{col.nombre}</span>
              <span className="bg-zinc-800/50 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.estado === col.nombre).length}
              </span>
            </h4>

            <div className="flex-1 space-y-3 overflow-y-auto neon-scrollbar pr-1 min-h-[450px]">
              {tasks.filter(t => t.estado === col.nombre).map(task => {
                const assignedUser = agencyMembers.find(m => m.usuario_id === task.usuario_asignado_id);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => handleOpenEditModal(task)}
                    className="bg-zinc-950/70 border border-zinc-850 hover:border-zinc-750 p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all group space-y-3 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-white text-xs leading-snug">{task.titulo}</h5>
                      <button
                        onClick={(e) => handleDelete(e, task.id)}
                        className="text-zinc-650 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {task.descripcion && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{task.descripcion}</p>
                    )}

                    {/* Linkages display */}
                    {(task.espacio_trabajo || task.proyecto || task.recurso) && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-850">
                        {task.espacio_trabajo && (
                          <span className="text-[9px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-md flex items-center gap-1 border border-zinc-800">
                            <Briefcase size={8} className="text-amber-400" />
                            <span className="max-w-[70px] truncate">{task.espacio_trabajo.nombre}</span>
                          </span>
                        )}
                        {task.proyecto && (
                          <span className="text-[9px] bg-zinc-900 text-zinc-450 px-2 py-0.5 rounded-md flex items-center gap-1 border border-zinc-800">
                            <CheckCircle2 size={8} className="text-teal-400" />
                            <span className="max-w-[70px] truncate">{task.proyecto.nombre}</span>
                          </span>
                        )}
                        {task.recurso && (
                          <span className="text-[9px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-md flex items-center gap-1 border border-zinc-800">
                            <FileText size={8} className="text-indigo-400" />
                            <span className="max-w-[60px] truncate">{task.recurso.titulo}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action buttons for resource */}
                    {task.recurso && (
                      <div className="flex gap-1.5">
                        {task.recurso.tipo === 'prompt' && task.recurso.contenido && (
                          <button
                            onClick={(e) => handleCopyPrompt(e, task.recurso?.contenido || '')}
                            className="w-full py-1 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-350 text-[9px] font-bold rounded-lg border border-indigo-900/40 flex items-center justify-center gap-1 transition-colors"
                          >
                            <Copy size={9} />
                            <span>Copiar Prompt</span>
                          </button>
                        )}
                        {task.recurso.tipo !== 'prompt' && task.recurso.contenido && (
                          <button
                            onClick={(e) => handleOpenLink(e, task.recurso?.contenido || '')}
                            className="w-full py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-[9px] font-bold rounded-lg border border-zinc-800 flex items-center justify-center gap-1 transition-colors"
                          >
                            <ExternalLink size={9} />
                            <span>Abrir Recurso</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 text-[9px] text-zinc-500">
                      {task.fecha_planificada ? (
                        <div className="flex items-center gap-1 font-semibold">
                          <Calendar size={10} className="text-indigo-450" />
                          <span>{new Date(task.fecha_planificada).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <div />
                      )}
                      
                      {assignedUser && (
                        <div className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded-md border border-zinc-850">
                          <User size={8} />
                          <span className="font-bold">{assignedUser.usuario?.nombre_completo.split(' ')[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto neon-scrollbar"
          >
            <h3 className="text-lg font-bold text-white">
              {editingTask ? 'Editar Actividad Operativa' : 'Cargar Actividad Operativa'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título</label>
                <input required type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white" />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Descripción</label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Estado</label>
                  <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white">
                    {columnsToRender.map(c => (
                      <option key={c.id || c.nombre} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Planificada Para</label>
                  <input type="date" value={form.fecha_planificada} onChange={e => setForm({ ...form, fecha_planificada: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Usuario Asignado</label>
                <select value={form.usuario_asignado_id} onChange={e => setForm({ ...form, usuario_asignado_id: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white">
                  <option value="">Sin asignar...</option>
                  {agencyMembers.map(m => (
                    <option key={m.usuario_id} value={m.usuario_id}>{m.usuario?.nombre_completo}</option>
                  ))}
                </select>
              </div>

              {/* Linkages selectors */}
              <div className="pt-2 border-t border-zinc-850 space-y-3">
                <h4 className="text-xs font-bold text-zinc-400">Vincular a Entidades</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Espacio de Trabajo</label>
                    <select value={form.espacioTrabajoId} onChange={e => setForm({ ...form, espacioTrabajoId: e.target.value, proyectoId: '' })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white">
                      <option value="">Ninguno...</option>
                      {workspaces.map(w => (
                        <option key={w.id} value={w.id}>{w.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Proyecto Relacionado</label>
                    <select disabled={!form.espacioTrabajoId} value={form.proyectoId} onChange={e => setForm({ ...form, proyectoId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white disabled:opacity-50">
                      <option value="">Ninguno...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Recurso/Prompt del Vault</label>
                  <select value={form.recursoId} onChange={e => setForm({ ...form, recursoId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white">
                    <option value="">Ninguno...</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>[{r.tipo.toUpperCase()}] {r.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-850 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors">
                  {editingTask ? 'Guardar Cambios' : 'Crear Actividad'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
