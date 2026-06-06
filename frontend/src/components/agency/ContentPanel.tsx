import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Calendar, Grid, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { useOperationsStore } from '../../store/useOperationsStore';
import type { Member } from '../../store/useAgencyStore';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

interface ContentPanelProps {
  agencyMembers: Member[];
}

export const ContentPanel: React.FC<ContentPanelProps> = ({ agencyMembers }) => {
  const { contents, fetchContents, createContent, updateContent, deleteContent } = useOperationsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['TikTok']);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);

  const [form, setForm] = useState({
    miembroId: '',
    titulo: '',
    guionPlantilla: '',
    dialogo: '',
    procedimientoEstandar: '',
    estado: 'Idea',
    notasMejora: '',
    fechaPublicacion: ''
  });

  useEffect(() => {
    fetchContents();
  }, []);

  // Stats calculation
  const platformStats = contents.reduce((acc, c) => {
    c.plataformas?.forEach(p => {
      acc[p] = (acc[p] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const handleCreateNew = (initialDateStr: string = '') => {
    setSelectedContent(null);
    setSelectedPlatforms(['TikTok']);
    setForm({
      miembroId: agencyMembers[0]?.usuario_id || '',
      titulo: '',
      guionPlantilla: '',
      dialogo: '',
      procedimientoEstandar: '',
      estado: 'Idea',
      notasMejora: '',
      fechaPublicacion: initialDateStr
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (c: any) => {
    setSelectedContent(c);
    setSelectedPlatforms(c.plataformas || []);
    setForm({
      miembroId: c.miembro_id || '',
      titulo: c.titulo || '',
      guionPlantilla: c.guion_plantilla || '',
      dialogo: c.dialogo || '',
      procedimientoEstandar: c.procedimiento_estandar || '',
      estado: c.estado || 'Idea',
      notasMejora: c.notas_mejora || '',
      fechaPublicacion: c.fecha_publicacion ? c.fecha_publicacion.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = (c: any) => {
    setSelectedContent(null);
    setSelectedPlatforms(c.plataformas || []);
    setForm({
      miembroId: c.miembro_id || '',
      titulo: `${c.titulo} (Duplicado)`,
      guionPlantilla: c.guion_plantilla || '',
      dialogo: c.dialogo || '',
      procedimientoEstandar: c.procedimiento_estandar || '',
      estado: 'Idea',
      notasMejora: c.notas_mejora || '',
      fechaPublicacion: c.fecha_publicacion ? c.fecha_publicacion.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        miembroId: form.miembroId,
        titulo: form.titulo,
        plataformas: selectedPlatforms,
        guionPlantilla: form.guionPlantilla,
        dialogo: form.dialogo,
        procedimientoEstandar: form.procedimientoEstandar,
        estado: form.estado,
        notasMejora: form.notasMejora,
        fechaPublicacion: form.fechaPublicacion ? new Date(form.fechaPublicacion).toISOString() : undefined
      };

      if (selectedContent) {
        await updateContent(selectedContent.id, {
          ...payload,
          resumenAnalitico: selectedContent.resumen_analitico
        });
        Swal.fire({ title: 'Contenido Actualizado', icon: 'success', background: '#09090b', color: '#fff', timer: 1500 });
      } else {
        await createContent(payload);
        Swal.fire({ title: 'Contenido Planificado', icon: 'success', background: '#09090b', color: '#fff', timer: 1500 });
      }

      setIsModalOpen(false);
      fetchContents();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleDrop = async (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    const contentId = e.dataTransfer.getData('text/plain');
    if (!contentId) return;
    const item = contents.find(c => c.id === contentId);
    if (!item) return;

    try {
      const payload = {
        miembroId: item.miembro_id || (item as any).miembroId,
        titulo: item.titulo,
        plataformas: item.plataformas,
        guionPlantilla: item.guion_plantilla || (item as any).guionPlantilla,
        dialogo: item.dialogo,
        procedimientoEstandar: item.procedimiento_estandar || (item as any).procedimientoEstandar,
        estado: item.estado,
        notasMejora: item.notas_mejora || (item as any).notasMejora,
        fechaPublicacion: new Date(dateString).toISOString()
      };

      await updateContent(item.id, {
        ...payload,
        resumenAnalitico: item.resumen_analitico || (item as any).resumenAnalitico
      });
      fetchContents();
    } catch (err: any) {
      console.error("Error updating date on drop:", err);
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar planificación?',
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
      await deleteContent(id);
      fetchContents();
    }
  };

  // Calendar Math
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date());
  };

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
  if (startOffset < 0) startOffset = 6;

  const totalDays = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from({ length: startOffset }, (_, i) => ({
    day: prevMonthLastDay - startOffset + i + 1,
    isCurrentMonth: false,
    dateString: new Date(year, month - 1, prevMonthLastDay - startOffset + i + 1).toISOString().split('T')[0]
  }));
  const currentMonthDays = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: true,
    dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
  }));
  const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: false,
    dateString: new Date(year, month + 1, i + 1).toISOString().split('T')[0]
  }));
  const allCells = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Planificación de Contenidos</h1>
            <p className="text-zinc-550 text-xs mt-1">Estructura guiones, graba y evalúa tus publicaciones de marketing en redes sociales.</p>
          </div>
          <button
            onClick={() => handleCreateNew()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/10"
          >
            <Plus size={14} />
            <span>Nuevo Contenido</span>
          </button>
        </div>

        {/* Platform metrics badges in header */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Métricas:</span>
          {['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'X'].map(p => (
            <span key={p} className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-400 text-[10px] font-bold">
              {p}: <strong className="text-emerald-400">{platformStats[p] || 0}</strong>
            </span>
          ))}
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${
              viewMode === 'grid' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Grid size={12} />
              <span>Vista Grid</span>
            </div>
            {viewMode === 'grid' && (
              <motion.div layoutId="contentSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${
              viewMode === 'calendar' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>Vista Calendario</span>
            </div>
            {viewMode === 'calendar' && (
              <motion.div layoutId="contentSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        /* Monthly planner view */
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center bg-zinc-900/35 border border-zinc-850 p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-extrabold text-white uppercase min-w-[120px] text-center">
                {monthNames[month]} {year}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <button onClick={handleToday} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold transition-colors">
              Hoy
            </button>
          </div>

          <div className="flex-1 flex flex-col bg-zinc-950/80 border border-zinc-850 rounded-2xl overflow-hidden min-h-[400px]">
            <div className="grid grid-cols-7 border-b border-zinc-850 bg-zinc-900/30 text-center py-2">
              {daysOfWeek.map((day) => (
                <span key={day} className="text-[10px] font-black uppercase tracking-wider text-zinc-650">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 flex-1">
              {allCells.map((cell, idx) => {
                const dayContents = contents.filter(c => {
                  const publishDate = c.fecha_publicacion || (c as any).fechaPublicacion;
                  return publishDate && publishDate.split('T')[0] === cell.dateString;
                });
                const isToday = cell.dateString === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={idx}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, cell.dateString)}
                    className={`min-h-[75px] border-b border-r border-zinc-850/60 p-2 flex flex-col gap-1 transition-all ${
                      cell.isCurrentMonth ? 'bg-transparent' : 'bg-zinc-900/10 opacity-30'
                    } hover:bg-zinc-900/20`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                          isToday 
                            ? 'bg-emerald-500 text-black' 
                            : 'text-zinc-550'
                        }`}
                      >
                        {cell.day}
                      </span>
                      
                      <button
                        onClick={() => handleCreateNew(cell.dateString)}
                        className="opacity-0 hover:opacity-100 p-0.5 bg-zinc-900 rounded text-zinc-500 hover:text-white transition-opacity text-[8px] font-black"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pt-1">
                      {dayContents.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleEditClick(c)}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                          className="w-full text-left px-1.5 py-0.5 rounded text-[8px] font-bold truncate bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-450 hover:brightness-125 transition-all cursor-grab active:cursor-grabbing"
                        >
                          {c.titulo}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Standard Grid List view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.length === 0 ? (
            <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center rounded-3xl text-zinc-600 text-sm">
              No hay guiones o ideas cargadas en el planificador.
            </div>
          ) : (
            contents.map(c => (
              <div key={c.id} className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl flex flex-col justify-between group space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {c.plataformas?.map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/60 rounded-md text-[9px] font-black uppercase text-zinc-400">
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(c)}
                        className="text-zinc-500 hover:text-white transition-colors"
                        title="Editar plan"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(c)}
                        className="text-zinc-500 hover:text-emerald-400 transition-colors"
                        title="Duplicar plan"
                      >
                        <Copy size={12} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                        title="Eliminar plan"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-sm text-white mb-2">{c.titulo}</h4>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block ${
                      c.estado === 'Publicado' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-450 border-zinc-750'
                    }`}>
                      {c.estado}
                    </span>

                    {c.fecha_publicacion && (
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{new Date(c.fecha_publicacion).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>

                  {c.guion_plantilla && (
                    <div className="text-xs text-zinc-400 bg-zinc-950/40 p-4 rounded-xl font-mono border border-zinc-900/60 max-h-[100px] overflow-y-auto neon-scrollbar whitespace-pre-wrap mt-3">
                      <p className="font-bold text-[9px] text-zinc-500 uppercase mb-1">Estructura / Gancho:</p>
                      {c.guion_plantilla}
                    </div>
                  )}

                  {c.dialogo && (
                    <div className="text-xs text-zinc-400 bg-zinc-950/40 p-4 rounded-xl mt-2 font-mono border border-zinc-900/60 max-h-[100px] overflow-y-auto neon-scrollbar whitespace-pre-wrap">
                      <p className="font-bold text-[9px] text-zinc-500 uppercase mb-1">Diálogo / Guión:</p>
                      {c.dialogo}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Carga/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white">
              {selectedContent ? 'Editar Planificación de Contenido' : 'Nueva Planificación de Contenido'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Miembro Responsable</label>
                <select required value={form.miembroId} onChange={e => setForm({ ...form, miembroId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none">
                  <option value="">Selecciona miembro...</option>
                  {agencyMembers.map(m => {
                    const userId = m.usuario_id;
                    const userName = m.usuario?.nombre_completo || m.usuario?.email || 'Miembro';
                    const userHandle = m.usuario?.nombre_usuario ? ` (@${m.usuario.nombre_usuario})` : '';
                    return (
                      <option key={userId} value={userId}>{userName}{userHandle}</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título del Video / Tema</label>
                <input required type="text" placeholder="Ej: 3 trucos para mejorar performance de C#" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none" />
              </div>

              {/* Tags / Checkbox Platform Selector */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Plataformas Destino</label>
                <div className="flex flex-wrap gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  {['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'X'].map(platform => {
                    const isSelected = selectedPlatforms.includes(platform);
                    return (
                      <label key={platform} className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-extrabold' 
                          : 'bg-zinc-900 text-zinc-450 border-zinc-800 hover:border-zinc-700'
                      }`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                            } else {
                              setSelectedPlatforms([...selectedPlatforms, platform]);
                            }
                          }}
                        />
                        <span>{platform}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Estado</label>
                  <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none">
                    <option value="Idea">Idea</option>
                    <option value="Guión Redactado">Guión Redactado</option>
                    <option value="Grabando">Grabando</option>
                    <option value="Editando">Editando</option>
                    <option value="Listo para publicar">Listo para publicar</option>
                    <option value="Publicado">Publicado</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Fecha de Publicación</label>
                  <input type="date" value={form.fechaPublicacion} onChange={e => setForm({ ...form, fechaPublicacion: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Estructura / Gancho Inicial</label>
                <textarea rows={2} value={form.guionPlantilla} onChange={e => setForm({ ...form, guionPlantilla: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Diálogo Completo</label>
                <textarea rows={3} value={form.dialogo} onChange={e => setForm({ ...form, dialogo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-mono outline-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-350 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">
                  {selectedContent ? 'Guardar Cambios' : 'Crear Planificación'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
