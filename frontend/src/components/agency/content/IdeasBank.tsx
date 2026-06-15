import React, { useState } from 'react';
import { 
  Plus, Search, Globe, Lock, Share2, Tag, Calendar, 
  Trash2, Edit, Check, AlertCircle, RefreshCw, Layers, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import type { Member } from '../../../store/useAgencyStore';

interface IdeasBankProps {
  contents: any[];
  agencyMembers: Member[];
  currentUserId: string | null;
  isAdminOrOwner: boolean;
  createContent: (payload: any) => Promise<void>;
  updateContent: (id: string, payload: any) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  onPlanifyIdea: (idea: any) => void;
}

const PREDEFINED_TAGS = ['Tutorial', 'Dolor', 'Venta', 'Detrás de Escena', 'Caso de Éxito', 'Educativo'];
const DEFAULT_PLATFORMS = ['TikTok', 'Instagram', 'LinkedIn', 'Facebook'];

export const IdeasBank: React.FC<IdeasBankProps> = ({
  contents,
  agencyMembers,
  currentUserId,
  isAdminOrOwner,
  createContent,
  updateContent,
  deleteContent,
  onPlanifyIdea
}) => {
  // Filtrar solo las ideas
  const ideas = contents.filter(c => c.estado === 'Idea' && !(c.resumen_analitico || c.resumenAnalitico)?.esPlanSemanal);

  // Estados del Creador Inline
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlinePlatforms, setInlinePlatforms] = useState<string[]>(['TikTok']);
  const [inlineIsGrupal, setInlineIsGrupal] = useState(true);
  const [inlineDescription, setInlineDescription] = useState('');
  const [inlineTags, setInlineTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Estados de Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'shared' | 'private'>('all');
  const [filterUsage, setFilterUsage] = useState<'all' | 'unused' | 'used'>('all');

  // Estados de Edición Rápida
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState({
    titulo: '',
    plataformas: [] as string[],
    esGrupal: true,
    notas: '',
    tags: [] as string[]
  });

  // ====================================================================================
  // CREACIÓN DE IDEA RÁPIDA
  // ====================================================================================
  const handleToggleInlinePlatform = (platform: string) => {
    if (inlinePlatforms.includes(platform)) {
      setInlinePlatforms(inlinePlatforms.filter(p => p !== platform));
    } else {
      setInlinePlatforms([...inlinePlatforms, platform]);
    }
  };

  const handleAddInlineTag = (tag: string) => {
    if (inlineTags.includes(tag)) {
      setInlineTags(inlineTags.filter(t => t !== tag));
    } else {
      setInlineTags([...inlineTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const cleanTag = customTagInput.trim();
    if (!inlineTags.includes(cleanTag)) {
      setInlineTags([...inlineTags, cleanTag]);
    }
    setCustomTagInput('');
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    try {
      const activeMember = agencyMembers.find(m => m.usuario_id === currentUserId);
      const payload = {
        miembroId: currentUserId || '',
        titulo: inlineTitle,
        plataformas: inlinePlatforms,
        guionPlantilla: inlineDescription,
        dialogo: '',
        procedimientoEstandar: '',
        estado: 'Idea',
        notasMejora: '',
        resumenAnalitico: {
          esGrupal: inlineIsGrupal,
          notas: inlineDescription,
          creadorNombre: activeMember?.usuario?.nombre_completo || 'Colaborador',
          tags: inlineTags,
          vecesUsada: 0,
          postsVinculados: []
        }
      };

      await createContent(payload);
      
      // Limpiar Formulario
      setInlineTitle('');
      setInlineDescription('');
      setInlineTags([]);
      setInlinePlatforms(['TikTok']);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Idea agregada al banco',
        showConfirmButton: false,
        timer: 1500,
        background: '#18181b',
        color: '#fff'
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  // ====================================================================================
  // MODIFICACIONES DE IDEA (VISIBILIDAD, BORRADO, EDICIÓN)
  // ====================================================================================
  const handleToggleVisibility = async (idea: any) => {
    try {
      const ra = idea.resumen_analitico || idea.resumenAnalitico || {};
      const newEsGrupal = !ra.esGrupal;
      const updatedRA = {
        ...ra,
        esGrupal: newEsGrupal
      };

      await updateContent(idea.id, {
        titulo: idea.titulo,
        plataformas: idea.plataformas,
        guionPlantilla: idea.guion_plantilla || idea.guionPlantilla || '',
        dialogo: idea.dialogo || '',
        procedimientoEstandar: idea.procedimiento_estandar || idea.procedimientoEstandar || '',
        estado: 'Idea',
        notasMejora: idea.notas_mejora || idea.notasMejora || '',
        resumenAnalitico: updatedRA
      });

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: newEsGrupal ? 'Idea compartida con el grupo' : 'Idea configurada como privada',
        showConfirmButton: false,
        timer: 1500,
        background: '#18181b',
        color: '#fff'
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleStartEdit = (idea: any) => {
    const ra = idea.resumen_analitico || idea.resumenAnalitico || {};
    setEditingIdeaId(idea.id);
    setEditingForm({
      titulo: idea.titulo,
      plataformas: idea.plataformas || [],
      esGrupal: ra.esGrupal ?? true,
      notas: idea.guion_plantilla || idea.guionPlantilla || '',
      tags: ra.tags || []
    });
  };

  const handleSaveEdit = async (ideaId: string) => {
    const original = ideas.find(i => i.id === ideaId);
    if (!original) return;

    try {
      const ra = original.resumen_analitico || original.resumenAnalitico || {};
      const updatedRA = {
        ...ra,
        esGrupal: editingForm.esGrupal,
        notas: editingForm.notas,
        tags: editingForm.tags
      };

      await updateContent(ideaId, {
        titulo: editingForm.titulo,
        plataformas: editingForm.plataformas,
        guionPlantilla: editingForm.notas,
        dialogo: original.dialogo || '',
        procedimientoEstandar: original.procedimiento_estandar || original.procedimientoEstandar || '',
        estado: 'Idea',
        notasMejora: original.notas_mejora || original.notasMejora || '',
        resumenAnalitico: updatedRA
      });

      setEditingIdeaId(null);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Idea actualizada',
        showConfirmButton: false,
        timer: 1500,
        background: '#18181b',
        color: '#fff'
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleDeleteIdea = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar idea?',
      text: 'Se borrará permanentemente del banco.',
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
    }
  };

  // ====================================================================================
  // FILTRADO DE IDEAS
  // ====================================================================================
  const filteredIdeas = ideas.filter(idea => {
    const ra = idea.resumen_analitico || idea.resumenAnalitico || {};
    const createdByMe = (idea.miembro_id || idea.miembroId) === currentUserId;

    // 1. Aislamiento / Seguridad: Si es privada (esGrupal === false) y no soy el creador (y no soy admin), NO se muestra
    const isPrivateAndNotMine = ra.esGrupal === false && !createdByMe;
    if (isPrivateAndNotMine && !isAdminOrOwner) {
      return false;
    }

    // 2. Filtro de Búsqueda Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = idea.titulo?.toLowerCase().includes(q);
      const matchDesc = (idea.guion_plantilla || idea.guionPlantilla)?.toLowerCase().includes(q);
      const matchTags = ra.tags?.some((t: string) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    // 3. Filtro de Plataforma
    if (filterPlatform && !idea.plataformas?.includes(filterPlatform)) {
      return false;
    }

    // 4. Filtro de Miembro Creador
    if (filterMember) {
      const mId = idea.miembro_id || idea.miembroId;
      if (mId !== filterMember) return false;
    }

    // 5. Filtro de Visibilidad
    if (filterVisibility === 'shared' && ra.esGrupal !== true) return false;
    if (filterVisibility === 'private' && ra.esGrupal !== false) return false;

    // 6. Filtro de Uso
    const vecesUsada = ra.vecesUsada || 0;
    if (filterUsage === 'unused' && vecesUsada > 0) return false;
    if (filterUsage === 'used' && vecesUsada === 0) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 🚀 CREADOR INLINE RÁPIDO */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-md">
        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2 mb-4">
          <Brain className="text-emerald-450" size={16} />
          <span>Volcar Idea Rápida al Banco</span>
        </h3>

        <form onSubmit={handleInlineSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Título e Idea Principal */}
            <div className="md:col-span-8 space-y-2">
              <input
                type="text"
                required
                placeholder="Escribe el título o dolor que inspiró la idea..."
                value={inlineTitle}
                onChange={e => setInlineTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50"
              />
              <textarea
                rows={2}
                placeholder="Escribe algunas notas o desarrollo rápido..."
                value={inlineDescription}
                onChange={e => setInlineDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none resize-none focus:border-emerald-500/50"
              />
            </div>

            {/* Plataformas y Visibilidad */}
            <div className="md:col-span-4 space-y-3">
              {/* Selector Plataformas */}
              <div>
                <label className="text-[8px] font-black uppercase text-zinc-500 tracking-wider block mb-1">Destinar a:</label>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_PLATFORMS.map(p => {
                    const isSel = inlinePlatforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleToggleInlinePlatform(p)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          isSel 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Visibilidad */}
              <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-xl border border-zinc-850">
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5">
                  {inlineIsGrupal ? <Globe size={12} className="text-emerald-400" /> : <Lock size={12} className="text-zinc-500" />}
                  <span>{inlineIsGrupal ? 'Idea Grupal (Compartida)' : 'Idea Privada (Solo Mía)'}</span>
                </span>
                <input
                  type="checkbox"
                  checked={inlineIsGrupal}
                  onChange={e => setInlineIsGrupal(e.target.checked)}
                  className="rounded border-zinc-800 text-emerald-500 bg-zinc-900 focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Tags / Etiquetas */}
          <div className="space-y-2 pt-2 border-t border-zinc-850/60">
            <div className="flex items-center gap-1">
              <Tag size={12} className="text-zinc-550" />
              <label className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Etiquetas:</label>
            </div>
            
            <div className="flex flex-wrap gap-1.5 items-center">
              {/* Predefinidos */}
              {PREDEFINED_TAGS.map(t => {
                const isSel = inlineTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddInlineTag(t)}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-colors ${
                      isSel
                        ? 'bg-zinc-850 border-zinc-750 text-white font-extrabold'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}

              {/* Custom Tags cargados */}
              {inlineTags.filter(t => !PREDEFINED_TAGS.includes(t)).map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-zinc-850 border border-zinc-750 text-white flex items-center gap-1">
                  <span>#{t}</span>
                  <button type="button" onClick={() => handleAddInlineTag(t)} className="text-zinc-550 hover:text-red-400">×</button>
                </span>
              ))}

              {/* Crear custom tag input */}
              <div className="flex items-center gap-1.5 bg-zinc-950/80 px-2 py-0.5 rounded-md border border-zinc-900">
                <input
                  type="text"
                  placeholder="Nuevo tag..."
                  value={customTagInput}
                  onChange={e => setCustomTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  className="bg-transparent text-[9px] text-white outline-none w-[70px] placeholder-zinc-700"
                />
                <button type="button" onClick={handleAddCustomTag} className="text-zinc-500 hover:text-white text-[9px] font-black">+</button>
              </div>
            </div>
          </div>

          {/* Botón enviar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!inlineTitle.trim()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              <span>Guardar en Banco</span>
            </button>
          </div>
        </form>
      </div>

      {/* 📊 BARRA DE FILTROS EN CALIENTE */}
      <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Buscador keywords */}
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-850">
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por tag o palabra..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white outline-none placeholder-zinc-650 w-full"
          />
        </div>

        {/* Filtro Plataforma */}
        <select
          value={filterPlatform}
          onChange={e => setFilterPlatform(e.target.value)}
          className="bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-zinc-400 outline-none w-full"
        >
          <option value="">Todas las Redes</option>
          {DEFAULT_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Filtro Visibilidad */}
        <select
          value={filterVisibility}
          onChange={e => setFilterVisibility(e.target.value as any)}
          className="bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-zinc-400 outline-none w-full"
        >
          <option value="all">Cualquier Ámbito</option>
          <option value="shared">Compartidas (Grupales)</option>
          <option value="private">Privadas (Personales)</option>
        </select>

        {/* Filtro de uso */}
        <select
          value={filterUsage}
          onChange={e => setFilterUsage(e.target.value as any)}
          className="bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-zinc-400 outline-none w-full"
        >
          <option value="all">Todos los estados de uso</option>
          <option value="unused">Sin usar (Disponibles)</option>
          <option value="used">Ya planificadas/usadas</option>
        </select>
      </div>

      {/* 📦 MURO DE TARJETAS DE IDEAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredIdeas.length === 0 ? (
            <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center rounded-3xl text-zinc-600 text-xs">
              No se encontraron ideas que coincidan con los filtros aplicados.
            </div>
          ) : (
            filteredIdeas.map(idea => {
              const ra = idea.resumen_analitico || idea.resumenAnalitico || {};
              const isEditing = editingIdeaId === idea.id;
              const creador = ra.creadorNombre || 'Miembro';
              const vecesUsada = ra.vecesUsada || 0;
              const tags = ra.tags || [];

              return (
                <motion.div
                  key={idea.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-3xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors group relative"
                >
                  {/* Visibilidad & Acciones superiores */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(idea)}
                        className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                          ra.esGrupal 
                            ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                            : 'bg-zinc-800 text-zinc-500 border-zinc-750'
                        }`}
                        title="Haga clic para cambiar visibilidad"
                      >
                        {ra.esGrupal ? <Globe size={8} /> : <Lock size={8} />}
                        <span>{ra.esGrupal ? 'Grupal' : 'Privada'}</span>
                      </button>

                      {/* Badge Veces Usada */}
                      {vecesUsada > 0 && (
                        <span className="text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check size={8} />
                          <span>Usada {vecesUsada} {vecesUsada === 1 ? 'vez' : 'veces'}</span>
                        </span>
                      )}
                    </div>

                    {/* Botones de gestión rápida */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idea)}
                          className="p-1 hover:bg-zinc-850 rounded text-zinc-450 hover:text-white transition-colors"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteIdea(idea.id)}
                          className="p-1 hover:bg-zinc-850 rounded text-zinc-450 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CUERPO DE LA TARJETA */}
                  {isEditing ? (
                    /* MODO EDICIÓN */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingForm.titulo}
                        onChange={e => setEditingForm({ ...editingForm, titulo: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-white outline-none"
                      />
                      <textarea
                        rows={3}
                        value={editingForm.notas}
                        onChange={e => setEditingForm({ ...editingForm, notas: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-white outline-none resize-none font-mono"
                      />
                      
                      {/* Plataformas selectores en edición */}
                      <div className="flex flex-wrap gap-1">
                        {DEFAULT_PLATFORMS.map(p => {
                          const isSel = editingForm.plataformas.includes(p);
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                const newPlatforms = isSel
                                  ? editingForm.plataformas.filter(plat => plat !== p)
                                  : [...editingForm.plataformas, p];
                                setEditingForm({ ...editingForm, plataformas: newPlatforms });
                              }}
                              className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-colors ${
                                isSel ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-950 border-zinc-900 text-zinc-650'
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>

                      {/* Botones de guardar/cancelar edición */}
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingIdeaId(null)}
                          className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(idea.id)}
                          className="px-2.5 py-1 bg-emerald-500 text-black rounded-lg text-[10px] font-bold"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* MODO VISUAL */
                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-sm text-white line-clamp-2">{idea.titulo}</h4>
                        
                        {(idea.guion_plantilla || idea.guionPlantilla) && (
                          <p className="text-[11px] text-zinc-400 line-clamp-3 whitespace-pre-wrap font-mono bg-zinc-950/20 p-2.5 rounded-xl border border-zinc-850/40">
                            {idea.guion_plantilla || idea.guionPlantilla}
                          </p>
                        )}
                      </div>

                      {/* Etiquetas / Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {tags.map((t: string) => (
                            <span key={t} className="text-[8px] font-bold bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded text-zinc-500 uppercase">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PIE DE TARJETA: Información de creador y acción de Planificar */}
                  {!isEditing && (
                    <div className="border-t border-zinc-850/65 pt-3 flex items-center justify-between gap-4">
                      {/* Creador Info */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300 uppercase font-mono">
                          {creador.charAt(0)}
                        </div>
                        <span className="text-[10px] text-zinc-550 truncate max-w-[100px]">{creador}</span>
                      </div>

                      {/* Acción Planificar */}
                      <button
                        type="button"
                        onClick={() => onPlanifyIdea(idea)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold rounded-xl flex items-center gap-1 transition-colors"
                        title="Crear una copia programada en la grilla/calendario"
                      >
                        <Calendar size={11} />
                        <span>Planificar</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
