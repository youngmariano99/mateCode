import React, { useState, useEffect } from 'react';
import { Plus, Check, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { useGoalsStore } from '../../store/useGoalsStore';
import type { Member } from '../../store/useAgencyStore';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface GoalsPanelProps {
  agencyMembers: Member[];
}

export const GoalsPanel: React.FC<GoalsPanelProps> = ({ agencyMembers }) => {
  const { goals, fetchGoals, createGoal, toggleGoal, updateGoal, deleteGoal } = useGoalsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [form, setForm] = useState({
    usuario_asignado_id: '',
    titulo: '',
    descripcion: '',
    tipo_periodo: 'Semanal',
    fecha_limite: ''
  });

  // Filtros
  const [filterMember, setFilterMember] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleStartEdit = (goal: any) => {
    setEditingGoalId(goal.id);
    setForm({
      usuario_asignado_id: goal.usuario_asignado_id,
      titulo: goal.titulo,
      descripcion: goal.descripcion || '',
      tipo_periodo: goal.tipo_periodo,
      fecha_limite: goal.fecha_limite ? new Date(goal.fecha_limite).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoalId(null);
    setForm({
      usuario_asignado_id: '',
      titulo: '',
      descripcion: '',
      tipo_periodo: 'Semanal',
      fecha_limite: ''
    });
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar objetivo?',
      text: 'Se removerá de los objetivos activos de la organización.',
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
      try {
        await deleteGoal(id);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Objetivo eliminado',
          showConfirmButton: false,
          timer: 1500,
          background: '#18181b',
          color: '#fff'
        });
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoalId) {
        await updateGoal(editingGoalId, {
          usuario_asignado_id: form.usuario_asignado_id,
          titulo: form.titulo,
          descripcion: form.descripcion,
          tipo_periodo: form.tipo_periodo,
          fecha_limite: form.fecha_limite ? form.fecha_limite : undefined
        });
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Objetivo actualizado',
          showConfirmButton: false,
          timer: 1500,
          background: '#18181b',
          color: '#fff'
        });
      } else {
        await createGoal({
          usuario_asignado_id: form.usuario_asignado_id,
          titulo: form.titulo,
          descripcion: form.descripcion,
          tipo_periodo: form.tipo_periodo,
          fecha_limite: form.fecha_limite ? form.fecha_limite : undefined
        });
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Objetivo creado con éxito',
          showConfirmButton: false,
          timer: 1500,
          background: '#18181b',
          color: '#fff'
        });
      }
      handleCloseModal();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  // Filtrado de objetivos en caliente
  const filteredGoals = goals.filter(goal => {
    if (filterMember && goal.usuario_asignado_id !== filterMember) {
      return false;
    }
    if (filterPeriod && goal.tipo_periodo !== filterPeriod) {
      return false;
    }
    if (filterStatus === 'pending' && goal.completado) return false;
    if (filterStatus === 'completed' && !goal.completado) return false;
    return true;
  });

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Cabecera */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Objetivos de Operaciones</h1>
          <p className="text-zinc-500 text-xs mt-1">Asigna y controla los objetivos diarios, semanales o mensuales por colaborador.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={14} />
          <span>Nuevo Objetivo</span>
        </button>
      </div>

      {/* 📊 BARRA DE FILTROS EN CALIENTE */}
      <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Filtro Colaborador */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Colaborador</label>
          <select
            value={filterMember}
            onChange={e => setFilterMember(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-400 outline-none focus:border-emerald-500/50"
          >
            <option value="">Cualquier Colaborador</option>
            {agencyMembers.map(m => {
              const userId = m.usuario_id;
              const userName = m.usuario?.nombre_completo || m.usuario?.email || 'Colaborador';
              return (
                <option key={userId} value={userId}>{userName}</option>
              );
            })}
          </select>
        </div>

        {/* Filtro Período */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Período</label>
          <select
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-400 outline-none focus:border-emerald-500/50"
          >
            <option value="">Cualquier Período</option>
            <option value="Diario">Diario</option>
            <option value="Semanal">Semanal</option>
            <option value="Mensual">Mensual</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Anual">Anual</option>
          </select>
        </div>

        {/* Filtro Estado */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Estado</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-400 outline-none focus:border-emerald-500/50"
          >
            <option value="all">Cualquier Estado</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completados</option>
          </select>
        </div>
      </div>

      {/* Grid de Tarjetas de Objetivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredGoals.length === 0 ? (
            <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center rounded-3xl text-zinc-600 text-sm">
              No se encontraron objetivos con los filtros aplicados.
            </div>
          ) : (
            filteredGoals.map(goal => {
              const responsibleName = goal.usuario_asignado?.nombre_completo || 'Sin asignar';
              const initials = responsibleName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || '?';

              return (
                <motion.div 
                  key={goal.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-zinc-900/40 border p-6 rounded-3xl transition-all relative flex flex-col justify-between min-h-[190px] group ${
                    goal.completado ? 'border-emerald-500/20 opacity-70' : 'border-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  {/* Cabecera */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                      {goal.tipo_periodo}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Botones de hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(goal)}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-450 hover:text-white transition-colors"
                          title="Editar Objetivo"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-450 hover:text-red-400 transition-colors"
                          title="Eliminar Objetivo"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      {/* Checkbox completar */}
                      <button
                        onClick={() => toggleGoal(goal.id, !goal.completado)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          goal.completado 
                            ? 'bg-emerald-500 border-emerald-500 text-black' 
                            : 'border-zinc-700 hover:border-emerald-500 text-transparent'
                        }`}
                      >
                        <Check size={12} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo */}
                  <div className="space-y-2 flex-1">
                    <h4 className={`font-extrabold text-sm leading-snug ${goal.completado ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {goal.titulo}
                    </h4>
                    {goal.descripcion && (
                      <p className={`text-xs ${goal.completado ? 'text-zinc-600' : 'text-zinc-400'} line-clamp-3 whitespace-pre-wrap`}>
                        {goal.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Pie (Responsable & Fecha Límite) */}
                  <div className="mt-4 pt-3 border-t border-zinc-850/60 flex justify-between items-center gap-4">
                    {/* Responsable */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-750 flex items-center justify-center text-[9px] font-black text-zinc-350 uppercase font-mono">
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider leading-none">Responsable</span>
                        <span className="text-[10px] text-zinc-400 truncate max-w-[120px] font-bold mt-0.5">{responsibleName}</span>
                      </div>
                    </div>

                    {/* Fecha Límite */}
                    {goal.fecha_limite && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider leading-none mb-0.5">Límite</span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                          <CalendarDays size={10} />
                          <span>{new Date(goal.fecha_limite).toLocaleDateString()}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white">
              {editingGoalId ? 'Editar Objetivo de Operación' : 'Asignar Nuevo Objetivo'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Colaborador Asignado</label>
                <select 
                  required 
                  value={form.usuario_asignado_id} 
                  onChange={e => setForm({ ...form, usuario_asignado_id: e.target.value })} 
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50"
                >
                  <option value="">Selecciona miembro...</option>
                  {agencyMembers.map(m => {
                    const userId = m.usuario_id;
                    const userName = m.usuario?.nombre_completo || m.usuario?.email || 'Colaborador';
                    const userHandle = m.usuario?.nombre_usuario ? ` (@${m.usuario.nombre_usuario})` : '';
                    return (
                      <option key={userId} value={userId}>{userName}{userHandle}</option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título del Objetivo</label>
                <input 
                  required 
                  type="text" 
                  value={form.titulo} 
                  onChange={e => setForm({ ...form, titulo: e.target.value })} 
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Descripción</label>
                <textarea 
                  rows={3} 
                  value={form.descripcion} 
                  onChange={e => setForm({ ...form, descripcion: e.target.value })} 
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50 resize-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Período</label>
                  <select 
                    value={form.tipo_periodo} 
                    onChange={e => setForm({ ...form, tipo_periodo: e.target.value })} 
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="Diario">Diario</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Fecha Límite</label>
                  <input 
                    type="date" 
                    value={form.fecha_limite} 
                    onChange={e => setForm({ ...form, fecha_limite: e.target.value })} 
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-colors hover:bg-zinc-750">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold transition-colors hover:bg-emerald-400">
                  {editingGoalId ? 'Guardar Cambios' : 'Crear Objetivo'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
