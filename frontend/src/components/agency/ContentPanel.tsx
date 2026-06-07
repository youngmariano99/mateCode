import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ChevronLeft, ChevronRight, 
  Edit2, Users, Briefcase, Upload, FileText, Globe, Brain
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
import { ContentKanbanSubTab, type PostItem } from './content/ContentKanbanSubTab';
import { PostDetailsModal } from './content/PostDetailsModal';

const DEFAULT_BATCHING_STEPS = [
  { id: 'b1', text: '🎬 Set-up armado (trípode, luces, cámara limpia)', checked: false },
  { id: 'b2', text: '📹 Grabé el Post', checked: false },
  { id: 'b3', text: '👕 Cambié de remera o ángulo', checked: false },
  { id: 'b4', text: '✍️ Subtítulos grandes en el centro', checked: false },
  { id: 'b5', text: '✂️ Cortes rápidos cada 3-5 segundos', checked: false },
  { id: 'b6', text: '💾 Archivos finales exportados', checked: false }
];

const DEFAULT_SEO_STEPS = [
  { id: 's1', text: '📂 Nombre del archivo relevante (ej: video.mp4 ➡️ excel-tickets.mp4)', checked: false },
  { id: 's2', text: '✍️ Palabras clave de forma natural en el texto', checked: false },
  { id: 's3', text: '🏷️ 3 a 5 hashtags muy específicos (B2B)', checked: false },
  { id: 's4', text: '🚫 Video limpio sin marcas de agua de otras redes', checked: false }
];

interface ContentPanelProps {
  agencyMembers: Member[];
}

export const ContentPanel: React.FC<ContentPanelProps> = ({ agencyMembers }) => {
  const { contents, fetchContents, createContent, updateContent, deleteContent } = useOperationsStore();
  const { activeAgency } = useAgencyStore();

  // Tabs de navegación principal
  const [currentTab, setCurrentTab] = useState<'space' | 'ideas' | 'agency'>('space');
  // Subtabs de "Mi Espacio"
  const [spaceSubTab, setSpaceSubTab] = useState<'weeks' | 'calendar' | 'kanban'>('weeks');

  const getWeekRange = (date: Date = new Date()) => {
    const currentDay = date.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + distanceToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      monday: monday.toISOString().split('T')[0],
      sunday: sunday.toISOString().split('T')[0]
    };
  };

  const defaultRange = getWeekRange();
  const [startDate, setStartDate] = useState(defaultRange.monday);
  const [endDate, setEndDate] = useState(defaultRange.sunday);

  // States for Post Details Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailPost, setDetailPost] = useState<PostItem | null>(null);
  const [detailPlanId, setDetailPlanId] = useState<string>('');

  const handlePrevWeek = () => {
    const start = new Date(startDate);
    start.setDate(start.getDate() - 7);
    const end = new Date(endDate);
    end.setDate(end.getDate() - 7);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + 7);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 7);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleDragStartPost = (e: React.DragEvent, postId: string, planId: string) => {
    e.dataTransfer.setData('text/postId', postId);
    e.dataTransfer.setData('text/planId', planId);
  };

  const getDaysOfActiveWeek = () => {
    const days = [];
    const baseDate = new Date(startDate + 'T00:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dayStr = d.toISOString().split('T')[0];
      days.push({
        dateString: dayStr,
        dayName: d.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('es-ES', { month: 'short' })
      });
    }
    return days;
  };

  const handleDropOnCalendarDay = async (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/postId');
    const planId = e.dataTransfer.getData('text/planId');
    if (postId && planId) {
      await handleDropOnDay(postId, planId, dateStr);
    }
  };

  const handleDropOnUnschedule = async (e: React.DragEvent) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/postId') || e.dataTransfer.getData('text/plain');
    const planId = e.dataTransfer.getData('text/planId');
    if (postId) {
      let resolvedPlanId = planId;
      if (!resolvedPlanId && activePlanForRange) {
        resolvedPlanId = activePlanForRange.id;
      }
      if (resolvedPlanId) {
        await handleUnschedulePost(postId, resolvedPlanId);
      }
    }
  };

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



  const activePlanForRange = weeklyPlans.find(plan => {
    let detail = plan.resumen_analitico;
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail); } catch { return false; }
    }
    if (!detail?.fechaDesde || !detail?.fechaHasta) return false;
    return (detail.fechaDesde >= startDate && detail.fechaDesde <= endDate) || 
           (detail.fechaHasta >= startDate && detail.fechaHasta <= endDate) ||
           (detail.fechaDesde <= startDate && detail.fechaHasta >= endDate);
  });

  const getWeeklyPosts = () => {
    const list: { planId: string; post: PostItem }[] = [];
    
    // 1. Get posts from activePlanForRange
    if (activePlanForRange) {
      let detail = activePlanForRange.resumen_analitico;
      if (typeof detail === 'string') {
        try { detail = JSON.parse(detail); } catch { detail = {}; }
      }
      if (detail?.posts) {
        detail.posts.forEach((p: any) => {
          list.push({ planId: activePlanForRange.id, post: p });
        });
      }
    }
    
    // 2. Get posts from other plans that are scheduled in this week range
    weeklyPlans.forEach(plan => {
      if (plan.id === activePlanForRange?.id) return;
      let detail = plan.resumen_analitico;
      if (typeof detail === 'string') {
        try { detail = JSON.parse(detail); } catch { detail = {}; }
      }
      if (detail?.posts) {
        detail.posts.forEach((p: any) => {
          if (p.fechaPublicacion && p.fechaPublicacion >= startDate && p.fechaPublicacion <= endDate) {
            if (!list.some(item => item.post.id === p.id)) {
              list.push({ planId: plan.id, post: p });
            }
          }
        });
      }
    });
    
    return list;
  };

  const getUnscheduledPosts = () => {
    if (!activePlanForRange) return [];
    let detail = activePlanForRange.resumen_analitico;
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail); } catch { detail = {}; }
    }
    return (detail?.posts || []).filter((p: any) => !p.fechaPublicacion).map((p: any) => ({
      planId: activePlanForRange.id,
      post: p
    }));
  };

  const getPastNoPublicados = () => {
    const list: { planId: string; post: PostItem }[] = [];
    weeklyPlans.forEach(plan => {
      if (plan.id === activePlanForRange?.id) return;
      let detail = plan.resumen_analitico;
      if (typeof detail === 'string') {
        try { detail = JSON.parse(detail); } catch { detail = {}; }
      }
      if (detail?.posts) {
        detail.posts.forEach((p: any) => {
          if (p.estado === 'No Publicado' && (!p.fechaPublicacion || p.fechaPublicacion < startDate)) {
            list.push({ planId: plan.id, post: p });
          }
        });
      }
    });
    return list;
  };

  const handleSavePostDetails = async (updatedPost: PostItem) => {
    if (!detailPlanId) return;
    const plan = contents.find(c => c.id === detailPlanId);
    if (!plan) return;
    let detail = plan.resumen_analitico;
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail); } catch { return; }
    }
    const updatedPosts = (detail.posts || []).map((p: any) => 
      p.id === updatedPost.id ? updatedPost : p
    );
    
    await updateContent(plan.id, {
      miembroId: plan.miembro_id,
      titulo: plan.titulo,
      plataformas: plan.plataformas || [],
      guionPlantilla: plan.guion_plantilla || '',
      dialogo: plan.dialogo || '',
      procedimientoEstandar: plan.procedimiento_estandar || '',
      estado: 'Plan Semanal',
      notasMejora: plan.notas_mejora || '',
      resumenAnalitico: {
        ...detail,
        posts: updatedPosts
      }
    });
    
    setIsDetailModalOpen(false);
    setDetailPost(null);
    fetchContents();
    Swal.fire({
      title: 'Guardado',
      text: 'Los cambios y checklist del post se guardaron correctamente.',
      icon: 'success',
      timer: 1500,
      background: '#09090b',
      color: '#fff'
    });
  };

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



  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanForRange) {
      Swal.fire({
        title: 'Plan Semanal Requerido',
        text: 'Por favor, crea primero un Plan Semanal en la pestaña "Planes Semanales" para poder programar contenidos.',
        icon: 'warning',
        background: '#09090b',
        color: '#fff'
      });
      return;
    }

    try {
      const newPost: PostItem = {
        id: selectedPost ? selectedPost.id : `post_${Date.now()}`,
        titulo: postForm.titulo,
        formato: selectedPost?.formato || 'Reel/TikTok',
        plataforma: selectedPlatforms[0] || 'TikTok',
        gancho: postForm.guionPlantilla || '',
        tipVisual: selectedPost?.tipVisual || '',
        desarrollo: postForm.dialogo || '',
        cta: selectedPost?.cta || '',
        estado: postForm.estado || 'Idea',
        fechaPublicacion: postForm.fechaPublicacion ? postForm.fechaPublicacion.split('T')[0] : '',
        checklistBatching: selectedPost?.checklistBatching || DEFAULT_BATCHING_STEPS,
        checklistSeo: selectedPost?.checklistSeo || DEFAULT_SEO_STEPS,
        progreso: selectedPost?.progreso || { guionado: false, grabado: false, editado: false, programado: false }
      };

      let detail = activePlanForRange.resumen_analitico;
      if (typeof detail === 'string') {
        try { detail = JSON.parse(detail); } catch { detail = {}; }
      }
      
      let updatedPosts;
      if (selectedPost) {
        updatedPosts = (detail.posts || []).map((p: any) => p.id === selectedPost.id ? newPost : p);
      } else {
        updatedPosts = [...(detail.posts || []), newPost];
      }

      await updateContent(activePlanForRange.id, {
        miembroId: activePlanForRange.miembro_id,
        titulo: activePlanForRange.titulo,
        plataformas: activePlanForRange.plataformas || [],
        guionPlantilla: activePlanForRange.guion_plantilla || '',
        dialogo: activePlanForRange.dialogo || '',
        procedimientoEstandar: activePlanForRange.procedimiento_estandar || '',
        estado: 'Plan Semanal',
        notasMejora: activePlanForRange.notas_mejora || '',
        resumenAnalitico: {
          ...detail,
          posts: updatedPosts
        }
      });

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

      setIsPostModalOpen(false);
      fetchContents();
      Swal.fire({ title: 'Contenido Guardado', icon: 'success', background: '#09090b', color: '#fff', timer: 1500 });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handlePlanifyIdea = (idea: any) => {
    if (!activePlanForRange) {
      Swal.fire({
        title: 'Plan Semanal Requerido',
        text: 'Crea primero un Plan Semanal en la pestaña "Planes Semanales" para poder planificar ideas.',
        icon: 'warning',
        background: '#09090b',
        color: '#fff'
      });
      return;
    }
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

  const handleDropOnDay = async (postId: string, planId: string, dateStr: string) => {
    const plan = contents.find(c => c.id === planId);
    if (!plan) return;
    let detail = plan.resumen_analitico;
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail); } catch { return; }
    }
    const updatedPosts = (detail.posts || []).map((p: any) => {
      if (p.id === postId) {
        return { ...p, fechaPublicacion: dateStr };
      }
      return p;
    });

    await updateContent(plan.id, {
      miembroId: plan.miembro_id,
      titulo: plan.titulo,
      plataformas: plan.plataformas || [],
      guionPlantilla: plan.guion_plantilla || '',
      dialogo: plan.dialogo || '',
      procedimientoEstandar: plan.procedimiento_estandar || '',
      estado: 'Plan Semanal',
      notasMejora: plan.notas_mejora || '',
      resumenAnalitico: {
        ...detail,
        posts: updatedPosts
      }
    });

    fetchContents();
  };

  const handleUnschedulePost = async (postId: string, planId: string) => {
    const plan = contents.find(c => c.id === planId);
    if (!plan) return;
    let detail = plan.resumen_analitico;
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail); } catch { return; }
    }
    const updatedPosts = (detail.posts || []).map((p: any) => {
      if (p.id === postId) {
        return { ...p, fechaPublicacion: '' };
      }
      return p;
    });

    await updateContent(plan.id, {
      miembroId: plan.miembro_id,
      titulo: plan.titulo,
      plataformas: plan.plataformas || [],
      guionPlantilla: plan.guion_plantilla || '',
      dialogo: plan.dialogo || '',
      procedimientoEstandar: plan.procedimiento_estandar || '',
      estado: 'Plan Semanal',
      notasMejora: plan.notas_mejora || '',
      resumenAnalitico: {
        ...detail,
        posts: updatedPosts
      }
    });

    fetchContents();
  };

  const handleUpdatePostStatus = async (postId: string, planId: string, newStatus: string) => {
    const plan = contents.find(c => c.id === planId);
    if (!plan) return;
    let detail = plan.resumen_analitico;
    if (typeof detail === 'string') {
      try { detail = JSON.parse(detail); } catch { return; }
    }
    const updatedPosts = (detail.posts || []).map((p: any) => {
      if (p.id === postId) {
        return { ...p, estado: newStatus };
      }
      return p;
    });

    await updateContent(plan.id, {
      miembroId: plan.miembro_id,
      titulo: plan.titulo,
      plataformas: plan.plataformas || [],
      guionPlantilla: plan.guion_plantilla || '',
      dialogo: plan.dialogo || '',
      procedimientoEstandar: plan.procedimiento_estandar || '',
      estado: 'Plan Semanal',
      notasMejora: plan.notas_mejora || '',
      resumenAnalitico: {
        ...detail,
        posts: updatedPosts
      }
    });

    fetchContents();
  };



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
                  onClick={() => setSpaceSubTab('kanban')}
                  className={`pb-1 px-3 text-xs font-bold transition-all relative ${spaceSubTab === 'kanban' ? 'text-emerald-450 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  <span>Tablero Kanban</span>
                  {spaceSubTab === 'kanban' && (
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
            <div className="flex flex-col lg:flex-row gap-6 flex-1 items-stretch">
              {/* Sidebar Izquierda - Posts sin Programar & Históricos */}
              <div className="lg:w-80 shrink-0 flex flex-col gap-4 bg-zinc-900/10 border border-zinc-850/60 p-4 rounded-3xl">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">
                    Posts de la Semana
                  </h4>
                  <p className="text-[10px] text-zinc-550">
                    Arrastra al calendario para programar
                  </p>
                </div>

                {/* Zona de desprogramación */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropOnUnschedule}
                  className="border-2 border-dashed border-zinc-800/80 hover:border-red-500/50 hover:bg-red-500/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-zinc-550 hover:text-red-400 group cursor-default"
                >
                  <Trash2 size={16} className="text-zinc-500 group-hover:text-red-400" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Desprogramar Post</span>
                  <span className="text-[8px] text-zinc-650">Arrastra aquí para quitar la fecha</span>
                </div>

                {/* Posts sin fecha de la semana activa */}
                <div className="flex-1 flex flex-col gap-3 min-h-[150px] overflow-y-auto custom-scrollbar">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">
                    Sin Fecha ({getUnscheduledPosts().length})
                  </span>
                  <div className="flex flex-col gap-2">
                    {getUnscheduledPosts().length === 0 ? (
                      <p className="text-[10px] text-zinc-600 italic">No hay posts sin fecha en esta semana.</p>
                    ) : (
                      getUnscheduledPosts().map(p => (
                        <div
                          key={p.post.id}
                          draggable
                          onDragStart={(e) => handleDragStartPost(e, p.post.id, p.planId)}
                          onClick={() => {
                            setDetailPost(p.post);
                            setDetailPlanId(p.planId);
                            setIsDetailModalOpen(true);
                          }}
                          className="bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 p-3 rounded-2xl cursor-grab hover:bg-zinc-900 transition-all space-y-1.5 group"
                        >
                          <div className="flex justify-between items-center text-[8px] font-black uppercase text-zinc-555">
                            <span>{p.post.plataforma}</span>
                            <span className="px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400">
                              {p.post.formato}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white group-hover:text-emerald-450 transition-colors line-clamp-2 leading-snug">
                            {p.post.titulo}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Borradores No Publicados (Histórico) */}
                  <div className="border-t border-zinc-850/60 pt-3 flex flex-col gap-3">
                    <span className="text-[9px] font-black uppercase text-red-400 tracking-wider flex items-center gap-1">
                      <span>Borradores No Publicados ({getPastNoPublicados().length})</span>
                    </span>
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {getPastNoPublicados().length === 0 ? (
                        <p className="text-[10px] text-zinc-600 italic">Sin borradores no publicados de semanas anteriores.</p>
                      ) : (
                        getPastNoPublicados().map(p => (
                          <div
                            key={p.post.id}
                            draggable
                            onDragStart={(e) => handleDragStartPost(e, p.post.id, p.planId)}
                            onClick={() => {
                              setDetailPost(p.post);
                              setDetailPlanId(p.planId);
                              setIsDetailModalOpen(true);
                            }}
                            className="bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800 p-2.5 rounded-xl cursor-grab hover:bg-zinc-900/50 transition-all space-y-1 group"
                          >
                            <div className="flex justify-between items-center text-[7px] font-black uppercase text-zinc-650">
                              <span>{p.post.plataforma}</span>
                              <span className="text-red-400">Borrador</span>
                            </div>
                            <p className="text-[11px] font-bold text-zinc-450 group-hover:text-zinc-250 line-clamp-1">
                              {p.post.titulo}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendario Semanal */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center bg-zinc-900/35 border border-zinc-850 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrevWeek} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-extrabold text-white uppercase min-w-[200px] text-center">
                      Semana: {startDate.split('-').reverse().slice(0, 2).reverse().join('/')} al {endDate.split('-').reverse().slice(0, 2).reverse().join('/')}
                    </span>
                    <button onClick={handleNextWeek} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      const currentRange = getWeekRange();
                      setStartDate(currentRange.monday);
                      setEndDate(currentRange.sunday);
                    }} 
                    className="px-3 py-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold transition-colors border border-zinc-750"
                  >
                    Esta Semana
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-7 gap-3 bg-zinc-950/80 border border-zinc-850 p-4 rounded-3xl min-h-[450px]">
                  {getDaysOfActiveWeek().map((day, idx) => {
                    const dayPosts = getWeeklyPosts().filter(item => item.post.fechaPublicacion === day.dateString);
                    const isToday = day.dateString === new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={idx}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropOnCalendarDay(e, day.dateString)}
                        className={`min-h-[150px] border p-3 rounded-2xl flex flex-col gap-2 transition-all ${
                          isToday ? 'bg-emerald-500/5 border-emerald-500/30 font-extrabold' : 'bg-zinc-900/10 border-zinc-900/40 hover:border-zinc-800'
                        } hover:bg-zinc-900/20`}
                      >
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-[10px] font-black uppercase ${isToday ? 'text-emerald-450' : 'text-zinc-550'}`}>
                              {day.dayName}
                            </span>
                            <span className={`text-[13px] font-extrabold ${isToday ? 'text-emerald-450' : 'text-white'}`}>
                              {day.dayNumber}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCreateNewPost(day.dateString)}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-all text-[10px] font-bold"
                            title="Nueva idea para este día"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                          {dayPosts.map(({ planId, post }) => (
                            <div
                              key={post.id}
                              draggable
                              onDragStart={(e) => handleDragStartPost(e, post.id, planId)}
                              onClick={() => {
                                setDetailPost(post);
                                setDetailPlanId(planId);
                                setIsDetailModalOpen(true);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-xl text-[10px] font-bold truncate bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 hover:brightness-125 transition-all cursor-grab active:cursor-grabbing space-y-1"
                            >
                              <div className="flex justify-between items-center text-[7px] text-zinc-500 uppercase font-black">
                                <span>{post.plataforma}</span>
                                <span className={`px-1 rounded-full ${
                                  post.estado === 'Programado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-450'
                                }`}>
                                  {post.estado}
                                </span>
                              </div>
                              <p className="truncate text-white">{post.titulo}</p>
                            </div>
                          ))}
                          {dayPosts.length === 0 && (
                            <div className="flex-1 flex items-center justify-center opacity-10">
                              <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-500">Sin post</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {spaceSubTab === 'kanban' && (
            <ContentKanbanSubTab
              posts={getWeeklyPosts()}
              onUpdatePostStatus={handleUpdatePostStatus}
              onOpenPostDetails={(post, planId) => {
                setDetailPost(post);
                setDetailPlanId(planId);
                setIsDetailModalOpen(true);
              }}
              startDate={startDate}
              endDate={endDate}
            />
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

      <PostDetailsModal
        isOpen={isDetailModalOpen}
        post={detailPost}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailPost(null);
        }}
        onSave={handleSavePostDetails}
      />
    </div>
  );
};
