import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, User, Briefcase, FileText, CheckCircle2, RotateCcw, Copy, ExternalLink } from 'lucide-react';
import { useOperationsStore, parseColumnName, type TaskOperative } from '../../store/useOperationsStore';
import { useAgencyStore } from '../../store/useAgencyStore';
import type { Member } from '../../store/useAgencyStore';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface OperationalCalendarSubTabProps {
  agencyMembers: Member[];
}

export const OperationalCalendarSubTab: React.FC<OperationalCalendarSubTabProps> = ({ agencyMembers }) => {
  const { 
    tasks, fetchTasks, createTask, updateTask, deleteTask,
    kanbanColumns, fetchKanbanColumns, resources, fetchResources 
  } = useOperationsStore();

  const { activeAgency, getAgencyWorkspacesWithProjects } = useAgencyStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modals & Forms states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskOperative | null>(null);
  const [selectedDateString, setSelectedDateString] = useState<string | null>(null);
  
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
    if (form.espacioTrabajoId) {
      const selectedWs = workspaces.find(w => w.id === form.espacioTrabajoId);
      setProjects(selectedWs?.proyectos || []);
    } else {
      setProjects([]);
    }
  }, [form.espacioTrabajoId, workspaces]);

  // Calendar calculations
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6; // Sunday becomes index 6

  const totalDays = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  
  const prevMonthDays = Array.from({ length: startOffset }, (_, i) => {
    const dayVal = prevMonthLastDay - startOffset + i + 1;
    const date = new Date(year, month - 1, dayVal);
    // Adjust for local timezone date-string formatting
    const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return {
      day: dayVal,
      isCurrentMonth: false,
      dateString: localDateStr
    };
  });

  const currentMonthDays = Array.from({ length: totalDays }, (_, i) => {
    const dayVal = i + 1;
    return {
      day: dayVal,
      isCurrentMonth: true,
      dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`
    };
  });

  const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => {
    const dayVal = i + 1;
    const date = new Date(year, month + 1, dayVal);
    const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return {
      day: dayVal,
      isCurrentMonth: false,
      dateString: localDateStr
    };
  });

  const allCells = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Sidebars filtering
  // 1. Constant Tasks (Templates) -> state === 'Constante'
  const constantTasks = tasks.filter(t => t.estado === 'Constante');

  // 2. Uncompleted Tasks -> Column color parsed isUncompleted === true
  const uncompletedColumnsNames = kanbanColumns
    .filter(c => parseColumnName(c.nombre).isUncompleted)
    .map(c => parseColumnName(c.nombre).name);

  const uncompletedTasks = tasks.filter(t => t.estado !== 'Constante' && uncompletedColumnsNames.includes(t.estado));

  // Regular scheduled tasks to show in the calendar
  const activeTasks = tasks.filter(t => t.estado !== 'Constante');

  // Active columns for regular task assignment
  const activeColumns = kanbanColumns.length > 0 
    ? kanbanColumns.map(c => parseColumnName(c.nombre).name)
    : ['Todo', 'In Progress', 'Done'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragStart = (e: React.DragEvent, taskId: string, type: 'constant' | 'active') => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('dragType', type);
  };

  const handleDrop = async (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const dragType = e.dataTransfer.getData('dragType');
    if (!taskId) return;

    if (dragType === 'constant') {
      const template = tasks.find(t => t.id === taskId);
      if (template) {
        const firstColName = kanbanColumns.length > 0 ? parseColumnName(kanbanColumns[0].nombre).name : 'Todo';
        try {
          await createTask({
            titulo: template.titulo,
            descripcion: template.descripcion || '',
            estado: firstColName,
            fecha_planificada: dateString,
            usuario_asignado_id: template.usuario_asignado_id || undefined,
            espacioTrabajoId: template.espacio_trabajo_id || undefined,
            proyectoId: template.proyecto_id || undefined,
            recursoId: template.recurso_id || undefined
          });
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Actividad programada',
            showConfirmButton: false,
            timer: 1500,
            background: '#09090b',
            color: '#f4f4f5'
          });
        } catch (err: any) {
          Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
        }
      }
    } else {
      const activeTask = tasks.find(t => t.id === taskId);
      if (activeTask) {
        try {
          // If task was in uncompleted column, move it back to the first active column (e.g. Todo) upon rescheduling
          const isTaskUncompleted = uncompletedColumnsNames.includes(activeTask.estado);
          const firstColName = kanbanColumns.length > 0 ? parseColumnName(kanbanColumns[0].nombre).name : 'Todo';
          const nextStatus = isTaskUncompleted ? firstColName : activeTask.estado;

          await updateTask(activeTask.id, {
            titulo: activeTask.titulo,
            descripcion: activeTask.descripcion || '',
            estado: nextStatus,
            fecha_planificada: dateString,
            usuario_asignado_id: activeTask.usuario_asignado_id || undefined,
            espacioTrabajoId: activeTask.espacio_trabajo_id || undefined,
            proyectoId: activeTask.proyecto_id || undefined,
            recursoId: activeTask.recurso_id || undefined
          });
          
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Actividad reprogramada',
            showConfirmButton: false,
            timer: 1500,
            background: '#09090b',
            color: '#f4f4f5'
          });
        } catch (err: any) {
          Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
        }
      }
    }
  };

  const handleOpenCreateConstant = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<h3 style="color: #fff; font-size:16px; font-weight:900;">CREAR TAREA CONSTANTE</h3>',
      html: `
        <div style="text-align: left; font-family: sans-serif; display: flex; flex-direction: column; gap: 8px;">
          <label style="color:#a1a1aa; font-size:10px; font-weight:bold; uppercase; tracking-wider">Título de la Plantilla</label>
          <input id="swal-const-title" class="swal2-input" style="margin: 0; width: 100%; background: #09090b; border: 1px solid #27272a; color: white; border-radius: 12px; font-size: 13px;" placeholder="Ej: Grabar video semanal">
          <label style="color:#a1a1aa; font-size:10px; font-weight:bold; uppercase; tracking-wider; margin-top:8px;">Descripción</label>
          <textarea id="swal-const-desc" class="swal2-textarea" style="margin: 0; width: 100%; background: #09090b; border: 1px solid #27272a; color: white; border-radius: 12px; font-size: 12px; height: 70px;" placeholder="Escribe detalles o links..."></textarea>
        </div>
      `,
      background: '#18181b',
      color: '#fff',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'CREAR PLANTILLA',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'CANCELAR',
      cancelButtonColor: '#27272a',
      preConfirm: () => [
        (document.getElementById('swal-const-title') as HTMLInputElement).value,
        (document.getElementById('swal-const-desc') as HTMLTextAreaElement).value
      ]
    });

    if (formValues && formValues[0]) {
      try {
        await createTask({
          titulo: formValues[0],
          descripcion: formValues[1],
          estado: 'Constante',
          fecha_planificada: undefined
        });
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Plantilla constante creada',
          showConfirmButton: false,
          timer: 1500,
          background: '#09090b',
          color: '#f4f4f5'
        });
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
      }
    }
  };

  const handleOpenCreateOnDate = (dateString: string) => {
    setEditingTask(null);
    setSelectedDateString(dateString);
    setForm({
      titulo: '',
      descripcion: '',
      estado: activeColumns[0] || 'Todo',
      fecha_planificada: dateString,
      usuario_asignado_id: '',
      espacioTrabajoId: '',
      proyectoId: '',
      recursoId: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenCreateGeneral = () => {
    setEditingTask(null);
    setSelectedDateString(null);
    setForm({
      titulo: '',
      descripcion: '',
      estado: activeColumns[0] || 'Todo',
      fecha_planificada: new Date().toISOString().split('T')[0],
      usuario_asignado_id: '',
      espacioTrabajoId: '',
      proyectoId: '',
      recursoId: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskOperative, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setSelectedDateString(null);
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

  const handleDeleteTask = async (e: React.MouseEvent, id: string) => {
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
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch h-full min-h-[600px]">
      
      {/* SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        
        {/* Constant tasks templates sidebar */}
        <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-3xl p-4 flex flex-col h-[300px]">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80 mb-3">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Tareas Constantes</span>
            <button
              onClick={handleOpenCreateConstant}
              className="p-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-colors"
              title="Nueva Plantilla Constante"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 neon-scrollbar">
            {constantTasks.map(t => (
              <div
                key={t.id}
                draggable
                onDragStart={(e) => handleDragStart(e, t.id, 'constant')}
                className="p-2.5 bg-zinc-950/70 border border-zinc-850 hover:border-zinc-750 rounded-xl cursor-grab active:cursor-grabbing text-xs text-white flex items-center justify-between group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="font-bold truncate" title={t.titulo}>{t.titulo}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteTask(e, t.id)}
                  className="text-zinc-650 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            {constantTasks.length === 0 && (
              <p className="text-[10px] text-zinc-600 text-center py-8">Arrastra constantes aquí para crearlas, o haz clic en +</p>
            )}
          </div>
        </div>

        {/* Uncompleted activities sidebar */}
        <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-3xl p-4 flex flex-col flex-1 h-[300px] lg:h-auto">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80 mb-3">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">No Completadas</span>
            <span className="bg-red-950/40 border border-red-900/50 text-red-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
              {uncompletedTasks.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 neon-scrollbar">
            {uncompletedTasks.map(t => (
              <div
                key={t.id}
                draggable
                onDragStart={(e) => handleDragStart(e, t.id, 'active')}
                className="p-2.5 bg-zinc-950/70 border border-zinc-850 hover:border-red-900/40 rounded-xl cursor-grab active:cursor-grabbing text-xs text-white space-y-1 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-red-300 truncate" title={t.titulo}>{t.titulo}</span>
                  <button
                    onClick={(e) => handleDeleteTask(e, t.id)}
                    className="text-zinc-650 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
                {t.descripcion && (
                  <p className="text-[10px] text-zinc-500 truncate leading-relaxed">{t.descripcion}</p>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-zinc-850/40 text-[8px] text-zinc-500">
                  <span className="font-bold bg-zinc-900 px-1 rounded border border-zinc-850">{t.estado}</span>
                  {t.fecha_planificada && <span>{new Date(t.fecha_planificada).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
            {uncompletedTasks.length === 0 && (
              <p className="text-[10px] text-zinc-600 text-center py-8">No hay actividades no completadas acumuladas.</p>
            )}
          </div>
        </div>

      </div>

      {/* CALENDAR BODY */}
      <div className="flex-1 flex flex-col bg-zinc-950/40 border border-zinc-800/80 rounded-3xl p-5 space-y-4">
        
        {/* Navigation bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-sky-400" />
            <span>Calendario de Actividades</span>
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-900 border border-zinc-850 rounded-xl p-0.5 shadow-md">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <ChevronLeft size={14} />
              </button>
              <span className="px-3 text-xs font-bold text-white min-w-[110px] text-center">
                {monthNames[month]} {year}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
            
            <button onClick={handleToday} className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-colors">
              Hoy
            </button>
            <button
              onClick={handleOpenCreateGeneral}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-lg shadow-emerald-500/10"
            >
              <Plus size={14} />
              <span>Cargar Actividad</span>
            </button>
          </div>
        </div>

        {/* Calendar days grid */}
        <div className="flex-1 flex flex-col bg-zinc-950/80 border border-zinc-850 rounded-2xl overflow-hidden min-h-[400px]">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-zinc-850 bg-zinc-900/30 text-center py-2">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                {day}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 flex-1">
            {allCells.map((cell, idx) => {
              const cellTasks = activeTasks.filter(t => t.fecha_planificada && t.fecha_planificada.split('T')[0] === cell.dateString);
              const isToday = cell.dateString === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, cell.dateString)}
                  className={`min-h-[75px] border-b border-r border-zinc-850/70 p-1.5 flex flex-col gap-1.5 transition-all ${
                    cell.isCurrentMonth ? 'bg-transparent' : 'bg-zinc-900/10 opacity-30'
                  } hover:bg-zinc-900/20`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ${
                        isToday 
                          ? 'bg-sky-500 text-black shadow-md font-bold' 
                          : 'text-zinc-500'
                      }`}
                    >
                      {cell.day}
                    </span>
                    <button
                      onClick={() => handleOpenCreateOnDate(cell.dateString)}
                      className="p-1 bg-zinc-900/80 border border-zinc-800/80 rounded-md text-zinc-400 hover:text-emerald-450 hover:border-emerald-500/30 transition-all text-[10px] font-black flex items-center justify-center w-5 h-5 shadow-sm"
                      title="Agregar actividad para este día"
                    >
                      +
                    </button>
                  </div>

                  {/* Tasks in the day */}
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar pr-0.5">
                    {cellTasks.map((t) => {
                      const col = kanbanColumns.find(c => parseColumnName(c.nombre).name === t.estado);
                      const parsedCol = col ? parseColumnName(col.nombre) : { color: '#71717a' };
                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id, 'active')}
                          onClick={(e) => handleOpenEditModal(t, e)}
                          style={{
                            backgroundColor: `${parsedCol.color}15`,
                            borderLeft: `2.5px solid ${parsedCol.color}`,
                            color: parsedCol.color
                          }}
                          className="w-full text-left px-1.5 py-0.5 rounded text-[8px] font-black truncate hover:brightness-125 transition-all cursor-grab active:cursor-grabbing"
                          title={`${t.titulo} (${t.estado})`}
                        >
                          {t.titulo}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* TASK DETAILS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto neon-scrollbar"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                {editingTask ? 'Detalles de la Actividad' : 'Cargar Actividad Operativa'}
              </h3>
              {editingTask && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteTask(e, editingTask.id)}
                  className="p-1.5 text-zinc-550 hover:text-red-400 rounded-lg hover:bg-zinc-950 transition-colors"
                  title="Eliminar Actividad"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Título</label>
                <input required type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white" />
              </div>
              
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Descripción</label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Estado</label>
                  <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white">
                    {activeColumns.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {editingTask?.estado === 'Constante' && <option value="Constante">Constante</option>}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Planificada Para</label>
                  <input 
                    type="date" 
                    value={form.fecha_planificada} 
                    onChange={e => setForm({ ...form, fecha_planificada: e.target.value })} 
                    onClick={(e) => (e.target as any).showPicker?.()}
                    className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white cursor-pointer focus:border-emerald-500/50" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Usuario Asignado</label>
                <select value={form.usuario_asignado_id} onChange={e => setForm({ ...form, usuario_asignado_id: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white">
                  <option value="">Sin asignar...</option>
                  {agencyMembers.map(m => (
                    <option key={m.usuario_id} value={m.usuario_id}>
                      {m.usuario?.nombre_completo} {m.usuario?.nombre_usuario ? `(@${m.usuario.nombre_usuario})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linkages selectors */}
              <div className="pt-2 border-t border-zinc-850 space-y-3">
                <h4 className="text-xs font-black text-zinc-400">Vincular a Entidades</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Espacio de Trabajo</label>
                    <select value={form.espacioTrabajoId} onChange={e => setForm({ ...form, espacioTrabajoId: e.target.value, proyectoId: '' })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white">
                      <option value="">Ninguno...</option>
                      {workspaces.map(w => (
                        <option key={w.id} value={w.id}>{w.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Proyecto Relacionado</label>
                    <select disabled={!form.espacioTrabajoId} value={form.proyectoId} onChange={e => setForm({ ...form, proyectoId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white disabled:opacity-50">
                      <option value="">Ninguno...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Recurso/Prompt del Vault</label>
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
