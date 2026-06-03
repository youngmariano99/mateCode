import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CalendarDays } from 'lucide-react';
import { useOperationsStore } from '../../store/useOperationsStore';
import type { Member } from '../../store/useAgencyStore';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

interface TasksPanelProps {
  agencyMembers: Member[];
}

export const TasksPanel: React.FC<TasksPanelProps> = ({ agencyMembers }) => {
  const { tasks, fetchTasks, createTask, updateTaskStatus, deleteTask } = useOperationsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    estado: 'Todo',
    fecha_planificada: '',
    usuario_asignado_id: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        titulo: form.titulo,
        descripcion: form.descripcion,
        estado: form.estado,
        fecha_planificada: form.fecha_planificada ? form.fecha_planificada : undefined,
        usuario_asignado_id: form.usuario_asignado_id ? form.usuario_asignado_id : undefined
      });
      setIsModalOpen(false);
      setForm({
        titulo: '',
        descripcion: '',
        estado: 'Todo',
        fecha_planificada: '',
        usuario_asignado_id: ''
      });
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

  const handleDelete = async (id: string) => {
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

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Tareas Operativas</h1>
          <p className="text-zinc-500 text-xs mt-1">Tablero de actividades del día a día (CRM, Finanzas, Contenidos, Contratos, etc.).</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={14} />
          <span>Cargar Actividad</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {[
          { key: 'Todo', label: 'Por Hacer', color: 'border-zinc-800' },
          { key: 'In Progress', label: 'En Curso', color: 'border-indigo-500/20' },
          { key: 'Done', label: 'Completado', color: 'border-emerald-500/20' }
        ].map(col => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.key)}
            className="bg-zinc-900/30 border border-zinc-800/60 rounded-3xl p-5 flex flex-col min-h-[500px]"
          >
            <h4 className="text-xs font-black uppercase text-zinc-400 border-b border-zinc-800 pb-3 mb-4 tracking-wider flex justify-between items-center">
              <span>{col.label}</span>
              <span className="bg-zinc-800/50 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.estado === col.key).length}
              </span>
            </h4>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[550px] neon-scrollbar pr-1">
              {tasks.filter(t => t.estado === col.key).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="bg-zinc-900/70 border border-zinc-850 hover:border-zinc-700/80 p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all group space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-white text-xs">{task.titulo}</h5>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {task.descripcion && <p className="text-[11px] text-zinc-400">{task.descripcion}</p>}
                  
                  {task.fecha_planificada && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500">
                      <CalendarDays size={10} className="text-indigo-400" />
                      <span>Límite: {new Date(task.fecha_planificada).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Cargar Actividad Operativa</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título de la Actividad</label>
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
                    <option value="Todo">Por Hacer</option>
                    <option value="In Progress">En Curso</option>
                    <option value="Done">Completado</option>
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
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">Guardar Actividad</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
