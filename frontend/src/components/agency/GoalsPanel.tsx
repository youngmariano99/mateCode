import React, { useState, useEffect } from 'react';
import { Plus, Check, CalendarDays, Pencil, Trash2, Flame, Target, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useGoalsStore } from '../../store/useGoalsStore';
import type { Member } from '../../store/useAgencyStore';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface GoalsPanelProps {
  agencyMembers: Member[];
}

interface GoalParsedDescription {
  goal_type: 'smart' | 'constant';
  text_description: string;
  smart_specific?: string;
  smart_measurable?: string;
  smart_achievable?: string;
  smart_relevant?: string;
  streak?: number;
  history?: string[];
}

const parseGoalDescription = (descString: string | undefined): GoalParsedDescription => {
  if (!descString) {
    return { goal_type: 'smart', text_description: '' };
  }
  try {
    const parsed = JSON.parse(descString);
    if (parsed && (parsed.goal_type === 'smart' || parsed.goal_type === 'constant')) {
      return parsed;
    }
  } catch (e) {
    // not JSON
  }
  return {
    goal_type: 'smart',
    text_description: descString
  };
};

const getCurrentPeriodId = (periodType: string, date = new Date()): string => {
  const y = date.getFullYear();
  if (periodType === 'Diario') {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } else if (periodType === 'Semanal') {
    const d = new Date(Date.UTC(y, date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  } else if (periodType === 'Mensual') {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-M${m}`;
  } else if (periodType === 'Trimestral') {
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `${y}-Q${q}`;
  } else if (periodType === 'Anual') {
    return String(y);
  }
  return `${y}-unknown`;
};

const getPreviousPeriodId = (periodType: string, periodId: string): string => {
  if (periodType === 'Diario') {
    const date = new Date(periodId + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    return getCurrentPeriodId('Diario', date);
  } else if (periodType === 'Semanal') {
    const parts = periodId.split('-W');
    if (parts.length !== 2) return '';
    let y = parseInt(parts[0]);
    let w = parseInt(parts[1]);
    w -= 1;
    if (w <= 0) {
      y -= 1;
      w = 52;
    }
    return `${y}-W${String(w).padStart(2, '0')}`;
  } else if (periodType === 'Mensual') {
    const parts = periodId.split('-M');
    if (parts.length !== 2) return '';
    let y = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    m -= 1;
    if (m <= 0) {
      y -= 1;
      m = 12;
    }
    return `${y}-M${String(m).padStart(2, '0')}`;
  } else if (periodType === 'Trimestral') {
    const parts = periodId.split('-Q');
    if (parts.length !== 2) return '';
    let y = parseInt(parts[0]);
    let q = parseInt(parts[1]);
    q -= 1;
    if (q <= 0) {
      y -= 1;
      q = 4;
    }
    return `${y}-Q${q}`;
  } else if (periodType === 'Anual') {
    return String(parseInt(periodId) - 1);
  }
  return '';
};

const calculateStreak = (periodType: string, history: string[]): number => {
  if (!history || history.length === 0) return 0;
  const current = getCurrentPeriodId(periodType);
  const previous = getPreviousPeriodId(periodType, current);
  
  let startPeriod = '';
  if (history.includes(current)) {
    startPeriod = current;
  } else if (history.includes(previous)) {
    startPeriod = previous;
  } else {
    return 0; // broken
  }
  
  let streak = 0;
  let check = startPeriod;
  while (history.includes(check)) {
    streak += 1;
    check = getPreviousPeriodId(periodType, check);
    if (streak > 1000) break;
  }
  return streak;
};

const formatPeriodId = (periodType: string, periodId: string): string => {
  if (!periodId) return '';
  if (periodType === 'Diario') {
    try {
      const d = new Date(periodId + 'T00:00:00');
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return periodId;
    }
  } else if (periodType === 'Semanal') {
    const parts = periodId.split('-W');
    return parts.length === 2 ? `Semana ${parts[1]}, ${parts[0]}` : periodId;
  } else if (periodType === 'Mensual') {
    const parts = periodId.split('-M');
    if (parts.length === 2) {
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const mIdx = parseInt(parts[1]) - 1;
      return `${monthNames[mIdx]} ${parts[0]}`;
    }
    return periodId;
  } else if (periodType === 'Trimestral') {
    const parts = periodId.split('-Q');
    return parts.length === 2 ? `Trimestre ${parts[1]}, ${parts[0]}` : periodId;
  } else if (periodType === 'Anual') {
    return `Año ${periodId}`;
  }
  return periodId;
};

export const GoalsPanel: React.FC<GoalsPanelProps> = ({ agencyMembers }) => {
  const { goals, fetchGoals, createGoal, toggleGoal, updateGoal, deleteGoal } = useGoalsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  // Expanded card tracking
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Form Core States
  const [form, setForm] = useState({
    usuario_asignado_id: '',
    titulo: '',
    descripcion: '',
    tipo_periodo: 'Semanal',
    fecha_limite: ''
  });

  // SMART guidance form states
  const [goalType, setGoalType] = useState<'smart' | 'constant'>('smart');
  const [smartSpecific, setSmartSpecific] = useState('');
  const [smartMeasurable, setSmartMeasurable] = useState('');
  const [smartAchievable, setSmartAchievable] = useState('');
  const [smartRelevant, setSmartRelevant] = useState('');

  // Filtros
  const [filterMember, setFilterMember] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleStartEdit = (goal: any) => {
    setEditingGoalId(goal.id);
    const parsed = parseGoalDescription(goal.descripcion);
    setGoalType(parsed.goal_type);
    setForm({
      usuario_asignado_id: goal.usuario_asignado_id,
      titulo: goal.titulo,
      descripcion: parsed.text_description || '',
      tipo_periodo: goal.tipo_periodo,
      fecha_limite: goal.fecha_limite ? new Date(goal.fecha_limite).toISOString().split('T')[0] : ''
    });
    setSmartSpecific(parsed.smart_specific || '');
    setSmartMeasurable(parsed.smart_measurable || '');
    setSmartAchievable(parsed.smart_achievable || '');
    setSmartRelevant(parsed.smart_relevant || '');
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
    setGoalType('smart');
    setSmartSpecific('');
    setSmartMeasurable('');
    setSmartAchievable('');
    setSmartRelevant('');
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
      let finalDesc = '';
      if (goalType === 'smart') {
        finalDesc = JSON.stringify({
          goal_type: 'smart',
          text_description: form.descripcion,
          smart_specific: smartSpecific,
          smart_measurable: smartMeasurable,
          smart_achievable: smartAchievable,
          smart_relevant: smartRelevant
        });
      } else {
        // Find existing history if editing
        let history: string[] = [];
        let streak = 0;
        if (editingGoalId) {
          const originalGoal = goals.find(g => g.id === editingGoalId);
          if (originalGoal) {
            const parsed = parseGoalDescription(originalGoal.descripcion);
            history = parsed.history || [];
            streak = parsed.streak || 0;
          }
        }
        finalDesc = JSON.stringify({
          goal_type: 'constant',
          text_description: form.descripcion,
          history,
          streak
        });
      }

      if (editingGoalId) {
        await updateGoal(editingGoalId, {
          usuario_asignado_id: form.usuario_asignado_id,
          titulo: form.titulo,
          descripcion: finalDesc,
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
          descripcion: finalDesc,
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

  const handleToggleGoalCompletion = async (goal: any) => {
    const parsed = parseGoalDescription(goal.descripcion);
    if (parsed.goal_type === 'constant') {
      const currentPeriod = getCurrentPeriodId(goal.tipo_periodo);
      let history = parsed.history || [];
      const isCompleted = history.includes(currentPeriod);
      
      let newHistory: string[];
      if (isCompleted) {
        newHistory = history.filter(p => p !== currentPeriod);
      } else {
        newHistory = [...history, currentPeriod];
      }
      
      const newStreak = calculateStreak(goal.tipo_periodo, newHistory);
      const updatedDesc = JSON.stringify({
        ...parsed,
        history: newHistory,
        streak: newStreak
      });
      const newCompleted = !isCompleted;

      try {
        // 1. Update the description (stores the new history & streak list)
        await updateGoal(goal.id, {
          usuario_asignado_id: goal.usuario_asignado_id,
          titulo: goal.titulo,
          descripcion: updatedDesc,
          tipo_periodo: goal.tipo_periodo,
          fecha_limite: goal.fecha_limite
        });
        // 2. Toggle database completion status column via the toggle endpoint
        await toggleGoal(goal.id, newCompleted);
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: newCompleted ? '¡Marcado para este período!' : 'Cumplimiento removido',
          showConfirmButton: false,
          timer: 1500,
          background: '#18181b',
          color: '#fff'
        });
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
      }
    } else {
      // Normal SMART or legacy goal
      try {
        await toggleGoal(goal.id, !goal.completado);
      } catch (err: any) {
        console.error(err);
      }
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
    
    const parsedDesc = parseGoalDescription(goal.descripcion);
    const currentPeriod = getCurrentPeriodId(goal.tipo_periodo);
    const isCompleted = parsedDesc.goal_type === 'constant'
      ? (parsedDesc.history?.includes(currentPeriod) || false)
      : goal.completado;

    if (filterStatus === 'pending' && isCompleted) return false;
    if (filterStatus === 'completed' && !isCompleted) return false;
    return true;
  });

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Cabecera */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Target className="text-emerald-400" />
            <span>Objetivos de Operaciones</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Asigna y controla los objetivos diarios, semanales o mensuales por colaborador.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/10"
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
            <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center rounded-3xl text-zinc-650 text-xs">
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

              const parsedDesc = parseGoalDescription(goal.descripcion);
              const currentPeriod = getCurrentPeriodId(goal.tipo_periodo);
              const isCompleted = parsedDesc.goal_type === 'constant'
                ? (parsedDesc.history?.includes(currentPeriod) || false)
                : goal.completado;

              return (
                <motion.div 
                  key={goal.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-zinc-900/40 border p-6 rounded-3xl transition-all relative flex flex-col justify-between min-h-[200px] group ${
                    isCompleted ? 'border-emerald-500/20 opacity-80' : 'border-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  {/* Cabecera */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                        {goal.tipo_periodo}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full bg-zinc-950 border text-[9px] font-black uppercase tracking-wider ${
                        parsedDesc.goal_type === 'constant' 
                          ? 'border-indigo-500/30 text-indigo-400' 
                          : 'border-emerald-500/30 text-emerald-400'
                      }`}>
                        {parsedDesc.goal_type === 'constant' ? 'Constante' : 'SMART'}
                      </span>
                      {parsedDesc.goal_type === 'constant' && (parsedDesc.streak || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-400 flex items-center gap-0.5">
                          <Flame size={10} className="fill-amber-400" />
                          <span>x{parsedDesc.streak}</span>
                        </span>
                      )}
                    </div>
                    
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
                        onClick={() => handleToggleGoalCompletion(goal)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isCompleted 
                            ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                            : 'border-zinc-700 hover:border-emerald-500 text-transparent'
                        }`}
                      >
                        <Check size={12} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo */}
                  <div className="space-y-2 flex-1 flex flex-col justify-start">
                    <h4 className={`font-extrabold text-sm leading-snug ${isCompleted ? 'line-through text-zinc-500 font-bold' : 'text-white'}`}>
                      {goal.titulo}
                    </h4>
                    {parsedDesc.text_description && (
                      <p className={`text-xs ${isCompleted ? 'text-zinc-650' : 'text-zinc-400'} line-clamp-3 whitespace-pre-wrap`}>
                        {parsedDesc.text_description}
                      </p>
                    )}

                    {/* Botón para expandir detalles */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id);
                      }}
                      className="text-[10px] text-zinc-400 hover:text-emerald-400 font-bold uppercase tracking-wider mt-2.5 flex items-center gap-1 transition-colors self-start"
                    >
                      <span>{expandedGoalId === goal.id ? 'Ocultar detalles' : 'Ver detalles'}</span>
                      {expandedGoalId === goal.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </button>
                    
                    {/* Detalles Expandidos */}
                    <AnimatePresence>
                      {expandedGoalId === goal.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3.5 bg-zinc-950/80 border border-zinc-850 rounded-2xl space-y-2 text-xs text-zinc-400 overflow-hidden"
                        >
                          {parsedDesc.goal_type === 'smart' ? (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 border-b border-zinc-850 pb-1.5">
                                <Award size={12} />
                                <span>Metodología SMART</span>
                              </p>
                              {parsedDesc.smart_specific && <p className="leading-relaxed"><strong className="text-zinc-300">S (Específico):</strong> {parsedDesc.smart_specific}</p>}
                              {parsedDesc.smart_measurable && <p className="leading-relaxed"><strong className="text-zinc-300">M (Medible):</strong> {parsedDesc.smart_measurable}</p>}
                              {parsedDesc.smart_achievable && <p className="leading-relaxed"><strong className="text-zinc-300">A (Alcanzable):</strong> {parsedDesc.smart_achievable}</p>}
                              {parsedDesc.smart_relevant && <p className="leading-relaxed"><strong className="text-zinc-300">R (Relevante):</strong> {parsedDesc.smart_relevant}</p>}
                              <p className="leading-relaxed"><strong className="text-zinc-300">T (Temporal):</strong> {goal.fecha_limite ? new Date(goal.fecha_limite).toLocaleDateString() : 'Sin fecha establecida'}</p>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 border-b border-zinc-850 pb-1.5">
                                <Flame size={12} />
                                <span>Objetivo Constante / Hábito</span>
                              </p>
                              <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded-xl">
                                <span>Racha de cumplimiento:</span>
                                <span className="text-amber-400 font-black flex items-center gap-0.5 bg-amber-400/5 px-2 py-0.5 rounded-lg border border-amber-500/10">
                                  🔥 x{parsedDesc.streak || 0}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold mb-1.5 text-[9px] uppercase text-zinc-550 tracking-wider">Historial de cumplimiento:</p>
                                {parsedDesc.history && parsedDesc.history.length > 0 ? (
                                  <ul className="list-disc pl-4 space-y-1 max-h-28 overflow-y-auto text-[11px] text-zinc-400 custom-scrollbar">
                                    {parsedDesc.history.map((histPeriod) => (
                                      <li key={histPeriod}>
                                        <span className="font-mono text-zinc-500 mr-1.5 text-[10px]">{histPeriod}:</span>
                                        <span className="font-bold text-zinc-300">{formatPeriodId(goal.tipo_periodo, histPeriod)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[10px] text-zinc-550 italic">Sin registros de cumplimiento aún.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                        <span className="text-[10px] text-zinc-355 truncate max-w-[120px] font-extrabold mt-0.5">{responsibleName}</span>
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
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
              <h3 className="text-lg font-bold text-white">
                {editingGoalId ? 'Editar Objetivo de Operación' : 'Asignar Nuevo Objetivo'}
              </h3>
            </div>

            {/* Selector de Tipo de Objetivo (SMART vs Constante) */}
            <div className="flex bg-zinc-950 p-1 rounded-xl gap-1 border border-zinc-850">
              <button
                type="button"
                onClick={() => setGoalType('smart')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  goalType === 'smart'
                    ? 'bg-zinc-850 text-white border border-zinc-750'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Objetivo SMART
              </button>
              <button
                type="button"
                onClick={() => setGoalType('constant')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  goalType === 'constant'
                    ? 'bg-zinc-850 text-white border border-zinc-750'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Constante / Hábito
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Colaborador Asignado</label>
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
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Título del Objetivo</label>
                <input 
                  required 
                  type="text" 
                  placeholder={goalType === 'smart' ? 'Ej: Lanzar la nueva landing page del cliente' : 'Ej: Subir 10 videos semanales de contenidos'}
                  value={form.titulo} 
                  onChange={e => setForm({ ...form, titulo: e.target.value })} 
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50" 
                />
              </div>

              {/* Guía Formulario SMART */}
              {goalType === 'smart' ? (
                <div className="space-y-3 p-3 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Metodología SMART (Guía)</span>
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Specific (S): ¿Qué quieres lograr exactamente?</label>
                    <input 
                      type="text" 
                      required={goalType === 'smart'}
                      placeholder="Ej: Programar e implementar el formulario de contacto..."
                      value={smartSpecific}
                      onChange={e => setSmartSpecific(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Measurable (M): ¿Cómo medirás el éxito?</label>
                    <input 
                      type="text" 
                      required={goalType === 'smart'}
                      placeholder="Ej: Que el formulario envíe correos y los registre en Supabase..."
                      value={smartMeasurable}
                      onChange={e => setSmartMeasurable(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Achievable (A): ¿Es realista con tus recursos?</label>
                    <input 
                      type="text" 
                      required={goalType === 'smart'}
                      placeholder="Ej: Sí, ya tenemos la API configurada y testeada..."
                      value={smartAchievable}
                      onChange={e => setSmartAchievable(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Relevant (R): ¿Por qué es relevante para la agencia ahora?</label>
                    <input 
                      type="text" 
                      required={goalType === 'smart'}
                      placeholder="Ej: Es necesario para que el cliente empiece a captar leads..."
                      value={smartRelevant}
                      onChange={e => setSmartRelevant(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Descripción General (Opcional)</label>
                <textarea 
                  rows={2} 
                  placeholder="Detalles adicionales o notas operativas..."
                  value={form.descripcion} 
                  onChange={e => setForm({ ...form, descripcion: e.target.value })} 
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50 resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Período / Recurrencia</label>
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
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                    {goalType === 'smart' ? 'Fecha Límite (T)' : 'Fecha Límite (Opcional)'}
                  </label>
                  <input 
                    required={goalType === 'smart'}
                    type="date" 
                    value={form.fecha_limite} 
                    onChange={e => setForm({ ...form, fecha_limite: e.target.value })} 
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-all">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all">
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
