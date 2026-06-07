import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Copy, Calendar, Grid, ChevronLeft, ChevronRight, 
  Edit2, Users, Briefcase, BarChart3, Upload, CopyCheck, FileText, Globe, Brain 
} from 'lucide-react';
import { useOperationsStore } from '../../store/useOperationsStore';
import { useAgencyStore } from '../../store/useAgencyStore';
import type { Member } from '../../store/useAgencyStore';
import { api } from '../../lib/apiClient';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

// Subcomponentes
import { WeeklyPlannerSheet } from './content/WeeklyPlannerSheet';
import { AgencyContentDashboard } from './content/AgencyContentDashboard';
import { ImportPlanModal } from './content/ImportPlanModal';
import { IdeasBank } from './content/IdeasBank';

interface ContentPanelProps {
  agencyMembers: Member[];
}

export const ContentPanel: React.FC<ContentPanelProps> = ({ agencyMembers }) => {
  const { contents, fetchContents, createContent, updateContent, deleteContent } = useOperationsStore();
  const { activeAgency } = useAgencyStore();

  // Tabs de navegación principal
  const [currentTab, setCurrentTab] = useState<'space' | 'ideas' | 'agency'>('space');
  // Subtabs de "Mi Espacio"
  const [spaceSubTab, setSpaceSubTab] = useState<'weeks' | 'calendar' | 'grid'>('weeks');

  // Estados de Filtros
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('Colaborador');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Estados de Modales y Edición
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeWeeklyPlan, setActiveWeeklyPlan] = useState<any | null>(null);

  // Enlace del Banco de Ideas
  const [originatingIdeaId, setOriginatingIdeaId] = useState<string | null>(null);

  // Estados del Modal de Post Individual (Original)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['TikTok']);
  const [postForm, setPostForm] = useState({
    miembroId: '',
    titulo: '',
    guionPlantilla: '',
    dialogo: '',
    procedimientoEstandar: '',
    estado: 'Idea',
    notasMejora: '',
    fechaPublicacion: ''
  });

  // Calendario
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchContents();
    loadUserProfile();
  }, [activeAgency?.id]);

  const loadUserProfile = async () => {
    try {
      const profile = await api.get('/Workspace/profile');
      if (profile?.id) {
        setCurrentUserId(profile.id);
        setSelectedMemberId(profile.id);

        // Encontrar rol del usuario en la agencia
        const userMember = agencyMembers.find(m => m.usuario_id === profile.id);
        if (userMember) {
          setCurrentUserRole(userMember.rol);
        }
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  };

  // Calcular si el usuario es Admin o Propietario
  const isAdminOrOwner = currentUserRole === 'Propietario' || currentUserRole === 'Administrador';

  // Filtrado de contenido por el miembro seleccionado (excluyendo ideas del banco en el workspace)
  const filteredContents = contents.filter(c => {
    const mId = c.miembro_id || (c as any).miembroId;
    return mId === selectedMemberId;
  });

  // Separar Planes Semanales, Posts Individuales e Ideas del Banco
  const weeklyPlans = filteredContents.filter(c => c.estado === 'Plan Semanal');
  const individualPosts = filteredContents.filter(c => 
    c.estado !== 'Plan Semanal' && 
    c.resumen_analitico?.esIdeaBanco !== true
  );

  // Calcular métricas de plataformas del miembro seleccionado
  const memberPlatformStats = individualPosts.reduce((acc, c) => {
    c.plataformas?.forEach((p: string) => {
      acc[p] = (acc[p] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // ====================================================================================
  // ACCIONES PLAN SEMANAL
  // ====================================================================================
  const handleCreateNewWeekPlan = () => {
    const monday = new Date();
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(monday.setDate(diff));
    const endOfWeek = new Date(monday.setDate(diff + 6));

    const dateRangeStr = `Semana del ${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} al ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;

    setActiveWeeklyPlan({
      titulo: dateRangeStr,
      resumen_analitico: null
    });
  };

  const handleEditWeekPlanClick = (plan: any) => {
    let parsedData = plan.resumen_analitico;
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch {
        parsedData = null;
      }
    }
    setActiveWeeklyPlan({
      id: plan.id,
      titulo: plan.titulo,
      resumen_analitico: parsedData
    });
  };

  const handleSaveWeekPlan = async (title: string, data: any) => {
    try {
      const payload = {
        miembroId: selectedMemberId || currentUserId || '',
        titulo: title,
        plataformas: [],
        guionPlantilla: '',
        dialogo: '',
        procedimientoEstandar: '',
        estado: 'Plan Semanal',
        notasMejora: '',
        resumenAnalitico: {
          ...data,
          esPlanSemanal: true
        },
        fechaPublicacion: undefined
      };

      if (activeWeeklyPlan?.id) {
        await updateContent(activeWeeklyPlan.id, payload);
        Swal.fire({ title: 'Planificación Guardada', icon: 'success', background: '#09090b', color: '#fff', timer: 1500 });
      } else {
        await createContent(payload);
        Swal.fire({ title: 'Planificación Creada', icon: 'success', background: '#09090b', color: '#fff', timer: 1500 });
      }

      setActiveWeeklyPlan(null);
      fetchContents();
    } catch (err: any) {
      Swal.fire({ title: 'Error al guardar', text: err.message, icon: 'error' });
    }
  };

  const handleImportWeekPlan = (importedData: any) => {
    handleSaveWeekPlan(importedData.tituloSemana, importedData);
  };

  // ====================================================================================
  // ACCIONES POST INDIVIDUAL (ORIGINAL)
  // ====================================================================================
  const handleCreateNewPost = (initialDateStr: string = '') => {
    setSelectedPost(null);
    setSelectedPlatforms(['TikTok']);
    setPostForm({
      miembroId: selectedMemberId || currentUserId || '',
      titulo: '',
      guionPlantilla: '',
      dialogo: '',
      procedimientoEstandar: '',
      estado: 'Idea',
      notasMejora: '',
      fechaPublicacion: initialDateStr
    });
    setOriginatingIdeaId(null);
    setIsPostModalOpen(true);
  };

  const handleEditPostClick = (c: any) => {
    setSelectedPost(c);
    setSelectedPlatforms(c.plataformas || []);
    setPostForm({
      miembroId: c.miembro_id || '',
      titulo: c.titulo || '',
      guionPlantilla: c.guion_plantilla || '',
      dialogo: c.dialogo || '',
      procedimientoEstandar: c.procedimiento_estandar || '',
      estado: c.estado || 'Idea',
      notasMejora: c.notas_mejora || '',
      fechaPublicacion: c.fecha_publicacion ? c.fecha_publicacion.split('T')[0] : ''
    });
    setOriginatingIdeaId(null);
    setIsPostModalOpen(true);
  };

  const handleDuplicatePost = (c: any) => {
    setSelectedPost(null);
    setSelectedPlatforms(c.plataformas || []);
    setPostForm({
      miembroId: c.miembro_id || '',
      titulo: `${c.titulo} (Duplicado)`,
      guionPlantilla: c.guion_plantilla || '',
      dialogo: c.dialogo || '',
      procedimientoEstandar: c.procedimiento_estandar || '',
      estado: 'Idea',
      notasMejora: c.notas_mejora || '',
      fechaPublicacion: c.fecha_publicacion ? c.fecha_publicacion.split('T')[0] : ''
    });
    setOriginatingIdeaId(null);
    setIsPostModalOpen(true);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        miembroId: postForm.miembroId,
        titulo: postForm.titulo,
        plataformas: selectedPlatforms,
        guionPlantilla: postForm.guionPlantilla,
        dialogo: postForm.dialogo,
        procedimientoEstandar: postForm.procedimientoEstandar,
        estado: postForm.estado,
        notasMejora: postForm.notasMejora,
        fechaPublicacion: postForm.fechaPublicacion ? new Date(postForm.fechaPublicacion).toISOString() : undefined
      };

      if (selectedPost) {
        await updateContent(selectedPost.id, {
          ...payload,
          resumenAnalitico: selectedPost.resumen_analitico
        });
        Swal.fire({ title: 'Contenido Actualizado', icon: 'success', background: '#09090b', color: '#fff', timer: 1500 });
      } else {
        await createContent(payload);
        
        // Si este post proviene de planificar una idea del Banco de Ideas
        if (originatingIdeaId) {
          const originalIdea = contents.find(c => c.id === originatingIdeaId);
          if (originalIdea) {
            const ra = originalIdea.resumen_analitico || {};
            const updatedRA = {
              ...ra,
              vecesUsada: (ra.vecesUsada || 0) + 1
            };

            await updateContent(originalIdea.id, {
              titulo: originalIdea.titulo,
              plataformas: originalIdea.plataformas,
              guionPlantilla: originalIdea.guion_plantilla || '',
              dialogo: originalIdea.dialogo || '',
              procedimientoEstandar: originalIdea.procedimiento_estandar || '',
              estado: 'Idea',
              notasMejora: originalIdea.notas_mejora || '',
              resumenAnalitico: updatedRA
            });
          }
          setOriginatingIdeaId(null);
        }

        Swal.fire({ title: 'Contenido Planificado', icon: 'success', background: '#09090b', color: '#fff', timer: 1500 });
      }

      setIsPostModalOpen(false);
      fetchContents();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handlePlanifyIdea = (idea: any) => {
    setOriginatingIdeaId(idea.id);
    setSelectedPost(null);
    setSelectedPlatforms(idea.plataformas || ['TikTok']);
    setPostForm({
      miembroId: currentUserId || '',
      titulo: idea.titulo || '',
      guionPlantilla: idea.guion_plantilla || '',
      dialogo: idea.dialogo || '',
      procedimientoEstandar: idea.procedimiento_estandar || '',
      estado: 'Idea',
      notasMejora: '',
      fechaPublicacion: ''
    });
    setIsPostModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar planificación?',
      text: 'Esta acción no se puede deshacer.',
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

  // Drag and Drop en Calendario
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

  // Calendario Math
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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

  // Si estamos editando una planificación semanal en pantalla completa
  if (activeWeeklyPlan) {
    return (
      <WeeklyPlannerSheet
        initialTitle={activeWeeklyPlan.titulo}
        initialData={activeWeeklyPlan.resumen_analitico}
        isSaving={false}
        onCancel={() => setActiveWeeklyPlan(null)}
        onSave={handleSaveWeekPlan}
      />
    );
  }

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full">
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Globe className="text-emerald-450" />
            <span>Planificación de Contenidos</span>
          </h1>
          <p className="text-zinc-550 text-xs mt-1">
            Gestiona tu embudo de contenido semanal, guiones, métricas y checklists B2B.
          </p>
        </div>

        {/* Tabs de navegación principal */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-zinc-950/80 border border-zinc-850 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setCurrentTab('space')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentTab === 'space'
                  ? 'bg-zinc-850 text-white shadow-sm border border-zinc-750'
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <Briefcase size={12} />
              <span>Espacio de Trabajo</span>
            </button>
            <button
              onClick={() => setCurrentTab('ideas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentTab === 'ideas'
                  ? 'bg-zinc-850 text-white shadow-sm border border-zinc-750'
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <Brain size={12} />
              <span>Banco de Ideas</span>
            </button>
            <button
              onClick={() => setCurrentTab('agency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentTab === 'agency'
                  ? 'bg-zinc-850 text-white shadow-sm border border-zinc-750'
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <Users size={12} />
              <span>Consolidado Agencia</span>
            </button>
          </div>
        </div>
      </div>

      {currentTab === 'agency' ? (
        /* VISTA CONSOLIDADA */
        <AgencyContentDashboard 
          contents={contents} 
          agencyMembers={agencyMembers} 
        />
      ) : currentTab === 'ideas' ? (
        /* BANCO DE IDEAS */
        <IdeasBank
          contents={contents}
          agencyMembers={agencyMembers}
          currentUserId={currentUserId}
          isAdminOrOwner={isAdminOrOwner}
          createContent={createContent}
          updateContent={updateContent}
          deleteContent={deleteContent}
          onPlanifyIdea={handlePlanifyIdea}
        />
      ) : (
        /* VISTA ESPACIO INDIVIDUAL (CON SU DROPDOWN E AISLAMIENTO) */
        <div className="space-y-6 flex-1 flex flex-col">
          
          {/* Barra de Controles: Miembro Seleccionado & Acciones */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/30 border border-zinc-850 p-4 rounded-3xl">
            {/* Selector de Miembro */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Miembro:</span>
              <select
                disabled={!isAdminOrOwner}
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-xs text-white outline-none disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {agencyMembers.map(m => (
                  <option key={m.usuario_id} value={m.usuario_id}>
                    {m.usuario?.nombre_completo || m.usuario?.email} {m.usuario_id === currentUserId ? '(Tú)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-navegación local de Mi Espacio */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setSpaceSubTab('weeks')}
                  className={`pb-1 px-3 text-xs font-bold transition-all relative ${spaceSubTab === 'weeks' ? 'text-emerald-450 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  <span>Planes Semanales</span>
                  {spaceSubTab === 'weeks' && (
                    <motion.div layoutId="subSpaceTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
                <button
                  onClick={() => setSpaceSubTab('calendar')}
                  className={`pb-1 px-3 text-xs font-bold transition-all relative ${spaceSubTab === 'calendar' ? 'text-emerald-450 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  <span>Calendario</span>
                  {spaceSubTab === 'calendar' && (
                    <motion.div layoutId="subSpaceTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
                <button
                  onClick={() => setSpaceSubTab('grid')}
                  className={`pb-1 px-3 text-xs font-bold transition-all relative ${spaceSubTab === 'grid' ? 'text-emerald-450 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  <span>Muro de Ideas</span>
                  {spaceSubTab === 'grid' && (
                    <motion.div layoutId="subSpaceTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
              </div>

              {/* Botón Acción Segun Subtab */}
              {spaceSubTab === 'weeks' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3.5 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Upload size={12} />
                    <span>Importar Plan</span>
                  </button>
                  <button
                    onClick={handleCreateNewWeekPlan}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Nuevo Plan Semanal</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleCreateNewPost()}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  <span>Nueva Idea</span>
                </button>
              )}
            </div>
          </div>

          {/* RENDERIZADO DE LAS SUBTABS */}
          {spaceSubTab === 'weeks' && (
            /* LISTADO DE HOJAS DE PLANIFICACIÓN SEMANALES */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weeklyPlans.length === 0 ? (
                <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center rounded-3xl text-zinc-650 text-xs">
                  No hay hojas de planificación semanal registradas para este miembro. Crea una nueva o impórtala con IA.
                </div>
              ) : (
                weeklyPlans.map(plan => {
                  let detail = plan.resumen_analitico;
                  if (typeof detail === 'string') {
                    try {
                      detail = JSON.parse(detail);
                    } catch {
                      detail = {};
                    }
                  }
                  const postsCount = detail?.posts?.length || 0;
                  const completedPosts = detail?.posts?.filter((p: any) => p.progreso?.programado).length || 0;
                  const pct = postsCount > 0 ? Math.round((completedPosts / postsCount) * 100) : 0;

                  return (
                    <div key={plan.id} className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl flex flex-col justify-between hover:border-zinc-700 transition-colors space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Semana Activa
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditWeekPlanClick(plan)}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(plan.id)}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-400 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-extrabold text-sm text-white">{plan.titulo}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-550">
                          <FileText size={12} />
                          <span>{postsCount} publicaciones planificadas</span>
                        </div>
                      </div>

                      {/* Progreso de la semana */}
                      <div className="space-y-1.5 pt-2 border-t border-zinc-850/60">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-zinc-500 font-bold">Progreso:</span>
                          <span className="text-zinc-400">{completedPosts}/{postsCount} listos ({pct}%)</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {spaceSubTab === 'calendar' && (
            /* CALENDARIO MENSUAL DE IDEAS */
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
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold transition-colors">
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
                    const dayContents = individualPosts.filter(c => {
                      const publishDate = c.fecha_publicacion || (c as any).fechaPublicacion;
                      return publishDate && publishDate.split('T')[0] === cell.dateString;
                    });
                    const isToday = cell.dateString === new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={idx}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, cell.dateString)}
                        className={`min-h-[75px] border-b border-r border-zinc-850/60 p-2 flex flex-col gap-1 transition-all ${cell.isCurrentMonth ? 'bg-transparent' : 'bg-zinc-900/10 opacity-30'
                          } hover:bg-zinc-900/20`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${isToday
                                ? 'bg-emerald-500 text-black'
                                : 'text-zinc-550'
                              }`}
                          >
                            {cell.day}
                          </span>

                          <button
                            onClick={() => handleCreateNewPost(cell.dateString)}
                            className="opacity-0 hover:opacity-100 p-0.5 bg-zinc-900 rounded text-zinc-500 hover:text-white transition-opacity text-[8px] font-black"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pt-1">
                          {dayContents.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => handleEditPostClick(c)}
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
          )}

          {spaceSubTab === 'grid' && (
            /* GRIDO DE IDEAS INDIVIDUALES */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {individualPosts.length === 0 ? (
                <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center rounded-3xl text-zinc-650 text-xs">
                  No hay ideas de posts individuales cargadas para este miembro.
                </div>
              ) : (
                individualPosts.map(c => (
                  <div key={c.id} className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl flex flex-col justify-between group space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {c.plataformas?.map((p: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/60 rounded-md text-[9px] font-black uppercase text-zinc-400">
                              {p}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditPostClick(c)}
                            className="text-zinc-500 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDuplicatePost(c)}
                            className="text-zinc-500 hover:text-emerald-400 transition-colors"
                            title="Duplicar"
                          >
                            <Copy size={12} />
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)}
                            className="text-zinc-550 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-sm text-white mb-2">{c.titulo}</h4>
                      
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block ${c.estado === 'Publicado'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-850 text-zinc-450 border-zinc-750'
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
                        <div className="text-xs text-zinc-400 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/60 max-h-[80px] overflow-y-auto whitespace-pre-wrap font-mono">
                          <p className="font-bold text-[8px] text-zinc-500 uppercase mb-0.5">Fórmula / Gancho:</p>
                          {c.guion_plantilla}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

      {/* Modal Importar Planificación */}
      <ImportPlanModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportWeekPlan}
      />

      {/* Modal Carga/Edición Post Individual (Original) */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white">
              {selectedPost ? 'Editar Idea de Post' : 'Nueva Idea de Post'}
            </h3>
            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Miembro Responsable</label>
                <select
                  required
                  value={postForm.miembroId}
                  onChange={e => setPostForm({ ...postForm, miembroId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none"
                >
                  <option value="">Selecciona miembro...</option>
                  {agencyMembers.map(m => (
                    <option key={m.usuario_id} value={m.usuario_id}>
                      {m.usuario?.nombre_completo || m.usuario?.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título / Tema</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: 3 trucos de C#"
                  value={postForm.titulo}
                  onChange={e => setPostForm({ ...postForm, titulo: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Plataformas Destino</label>
                <div className="flex flex-wrap gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  {['TikTok', 'Instagram', 'LinkedIn', 'Facebook'].map(platform => {
                    const isSelected = selectedPlatforms.includes(platform);
                    return (
                      <label key={platform} className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${isSelected
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
                  <select value={postForm.estado} onChange={e => setPostForm({ ...postForm, estado: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none">
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
                  <input type="date" value={postForm.fechaPublicacion} onChange={e => setPostForm({ ...postForm, fechaPublicacion: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Fórmula / Gancho Inicial</label>
                <textarea rows={2} value={postForm.guionPlantilla} onChange={e => setPostForm({ ...postForm, guionPlantilla: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Diálogo Completo</label>
                <textarea rows={3} value={postForm.dialogo} onChange={e => setPostForm({ ...postForm, dialogo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-mono outline-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-350 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">
                  {selectedPost ? 'Guardar Cambios' : 'Crear Post'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
