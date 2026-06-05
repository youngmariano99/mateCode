import React, { useState, useEffect } from 'react';
import { Plus, Check, CalendarDays } from 'lucide-react';
import { useGoalsStore } from '../../store/useGoalsStore';
import type { Member } from '../../store/useAgencyStore';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

interface GoalsPanelProps {
  agencyMembers: Member[];
}

export const GoalsPanel: React.FC<GoalsPanelProps> = ({ agencyMembers }) => {
  const { goals, fetchGoals, createGoal, toggleGoal } = useGoalsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    usuario_asignado_id: '',
    titulo: '',
    descripcion: '',
    tipo_periodo: 'Semanal',
    fecha_limite: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGoal({
        usuario_asignado_id: form.usuario_asignado_id,
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo_periodo: form.tipo_periodo,
        fecha_limite: form.fecha_limite ? form.fecha_limite : undefined
      });
      setIsModalOpen(false);
      setForm({
        usuario_asignado_id: '',
        titulo: '',
        descripcion: '',
        tipo_periodo: 'Semanal',
        fecha_limite: ''
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center rounded-3xl text-zinc-600 text-sm">
            No hay objetivos cargados para el período actual.
          </div>
        ) : (
          goals.map(goal => (
            <div 
              key={goal.id} 
              className={`bg-zinc-900/40 border p-6 rounded-3xl transition-all relative flex flex-col justify-between min-h-[160px] ${
                goal.completado ? 'border-emerald-500/20 opacity-60' : 'border-zinc-800/60'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h4 className={`font-bold text-sm leading-snug ${goal.completado ? 'line-through text-zinc-500' : 'text-white'}`}>
                    {goal.titulo}
                  </h4>
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
                
                {goal.descripcion && <p className="text-xs text-zinc-400 mb-4">{goal.descripcion}</p>}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-800/60 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                  {goal.tipo_periodo}
                </span>
                {goal.fecha_limite && (
                  <span className="flex items-center gap-1">
                    <CalendarDays size={11} className="text-indigo-400" />
                    <span>{new Date(goal.fecha_limite).toLocaleDateString()}</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Asignar Nuevo Objetivo</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Colaborador Asignado</label>
                <select required value={form.usuario_asignado_id} onChange={e => setForm({ ...form, usuario_asignado_id: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
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
                <input required type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Descripción</label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Período</label>
                  <select value={form.tipo_periodo} onChange={e => setForm({ ...form, tipo_periodo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                    <option value="Diario">Diario</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Fecha Límite</label>
                  <input type="date" value={form.fecha_limite} onChange={e => setForm({ ...form, fecha_limite: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">Crear Objetivo</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
