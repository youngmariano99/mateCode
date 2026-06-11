import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Brain, Plus, Trash2, CheckCircle2, Circle, 
  HelpCircle, Eye, EyeOff, Save, Copy, Download, Upload 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface PostItem {
  id: string;
  titulo: string;
  formato: string;
  plataforma: string;
  gancho: string;
  tipVisual: string;
  desarrollo: string;
  cta: string;
  estado: string; // 'Idea' | 'Guionado' | 'Grabado' | 'Editado' | 'Programado' | 'No Publicado'
  fechaPublicacion?: string; // YYYY-MM-DD
  checklistBatching: ChecklistItem[];
  checklistSeo: ChecklistItem[];
  progreso: {
    guionado: boolean;
    grabado: boolean;
    editado: boolean;
    programado: boolean;
  };
}

interface CustomKpi {
  key: string;
  label: string;
  value?: number;
}

interface WeeklyPlanData {
  tituloSemana: string;
  fechaDesde?: string;
  fechaHasta?: string;
  objetivoSemana: string;
  kpisSeleccionados: string[];
  customKpis: CustomKpi[];
  menuIdeas: string[];
  posts: PostItem[];
  checklistBatching: Record<string, boolean>;
  checklistSeo: Record<string, boolean>;
  analisisCierre: {
    totalDms: number;
    mejorPost: string;
    masCompartido: string;
    queFunciono: string;
    queFallo: string;
    decisionProximaSemana: string;
  };
}

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

interface WeeklyPlannerSheetProps {
  initialTitle: string;
  initialData: any; // resumen_analitico
  isSaving: boolean;
  onCancel: () => void;
  onSave: (title: string, data: WeeklyPlanData) => Promise<void>;
}

const DEFAULT_PLATFORMS = ['TikTok', 'Instagram', 'LinkedIn', 'Facebook'];
const DEFAULT_FORMATS = ['Reel/TikTok', 'Carrusel', 'Historia', 'Post'];

const DEFAULT_KPIS = [
  { key: 'dms', label: '✉️ Mensajes Directos (DMs automatizados)' },
  { key: 'guardados', label: '💾 Guardados (Saves - Muestra utilidad)' },
  { key: 'compartidos', label: '📣 Compartidos (Shares - Viralidad)' },
  { key: 'retencion', label: '⏱️ Retención (Visto > 3 segundos)' }
];

export const WeeklyPlannerSheet: React.FC<WeeklyPlannerSheetProps> = ({
  initialTitle,
  initialData,
  isSaving,
  onCancel,
  onSave
}) => {
  const [title, setTitle] = useState(initialTitle || 'Semana del ... al ...');
  const defaultRange = getWeekRange();
  const [fechaDesde, setFechaDesde] = useState(initialData?.fechaDesde || defaultRange.monday);
  const [fechaHasta, setFechaHasta] = useState(initialData?.fechaHasta || defaultRange.sunday);
  
  // Model States
  const [objetivo, setObjetivo] = useState('Atracción');
  const [kpisSeleccionados, setKpisSeleccionados] = useState<string[]>([]);
  const [customKpis, setCustomKpis] = useState<CustomKpi[]>([]);
  const [newCustomKpiLabel, setNewCustomKpiLabel] = useState('');
  
  const [menuIdeas, setMenuIdeas] = useState<string[]>([]);
  const [newIdeaText, setNewIdeaText] = useState('');
  
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Checklists (Keys can be dynamic)
  const [checklistBatching, setChecklistBatching] = useState<Record<string, boolean>>({
    setupGrabacion: false,
    grabadoPost1: false,
    reseteoVisual: false,
    subtitulosCentro: false,
    cortesRapidos: false,
    archivoExportado: false
  });
  
  const [checklistSeo, setChecklistSeo] = useState<Record<string, boolean>>({
    nombreArchivoRenombrado: false,
    keywordsTexto: false,
    hashtagsEspecificos: false,
    sinMarcasAgua: false
  });

  // Análisis
  const [totalDms, setTotalDms] = useState(0);
  const [mejorPost, setMejorPost] = useState('');
  const [masCompartido, setMasCompartido] = useState('');
  const [queFunciono, setQueFunciono] = useState('');
  const [queFallo, setQueFallo] = useState('');
  const [decisionProximaSemana, setDecisionProximaSemana] = useState('');

  // Carga inicial
  useEffect(() => {
    const defaultR = getWeekRange();
    if (initialData) {
      setObjetivo(initialData.objetivoSemana || 'Atracción');
      setKpisSeleccionados(initialData.kpisSeleccionados || []);
      setCustomKpis(initialData.customKpis || []);
      setMenuIdeas(initialData.menuIdeas || []);
      setFechaDesde(initialData.fechaDesde || defaultR.monday);
      setFechaHasta(initialData.fechaHasta || defaultR.sunday);
      const loadedPosts = (initialData.posts || []).map((p: any) => ({
        ...p,
        estado: p.estado || 'Idea',
        fechaPublicacion: p.fechaPublicacion || '',
        checklistBatching: p.checklistBatching || DEFAULT_BATCHING_STEPS,
        checklistSeo: p.checklistSeo || DEFAULT_SEO_STEPS
      }));
      setPosts(loadedPosts);
      if (loadedPosts.length > 0 && !expandedPostId) {
        setExpandedPostId(loadedPosts[0].id);
      }
      setChecklistBatching(initialData.checklistBatching || {
        setupGrabacion: false,
        grabadoPost1: false,
        reseteoVisual: false,
        subtitulosCentro: false,
        cortesRapidos: false,
        archivoExportado: false
      });
      setChecklistSeo(initialData.checklistSeo || {
        nombreArchivoRenombrado: false,
        keywordsTexto: false,
        hashtagsEspecificos: false,
        sinMarcasAgua: false
      });
      const c = initialData.analisisCierre || {};
      setTotalDms(c.totalDms || 0);
      setMejorPost(c.mejorPost || '');
      setMasCompartido(c.masCompartido || '');
      setQueFunciono(c.queFunciono || '');
      setQueFallo(c.queFallo || '');
      setDecisionProximaSemana(c.decisionProximaSemana || '');
    } else {
      // Valores por defecto
      setObjetivo('Atracción');
      setKpisSeleccionados(['dms', 'guardados']);
      setMenuIdeas(['', '']);
      setFechaDesde(defaultR.monday);
      setFechaHasta(defaultR.sunday);
      setPosts([
        {
          id: `post_${Date.now()}_1`,
          titulo: 'Post 1: Ganar 3 horas sumando tickets',
          formato: 'Reel/TikTok',
          plataforma: 'TikTok',
          gancho: '¿Perdés 3 horas los domingos sumando tickets?',
          tipVisual: 'Yo agarrándome la cabeza frente a un Excel',
          desarrollo: '',
          cta: 'Comenta STOCK y te paso demo',
          estado: 'Idea',
          fechaPublicacion: '',
          checklistBatching: DEFAULT_BATCHING_STEPS,
          checklistSeo: DEFAULT_SEO_STEPS,
          progreso: { guionado: false, grabado: false, editado: false, programado: false }
        }
      ]);
      setExpandedPostId(`post_${Date.now()}_1`);
    }
  }, [initialData]);

  // Manejo de KPIs Personalizados
  const handleAddCustomKpi = () => {
    if (!newCustomKpiLabel.trim()) return;
    const key = `custom_${Date.now()}`;
    const newKpi: CustomKpi = { key, label: newCustomKpiLabel };
    setCustomKpis([...customKpis, newKpi]);
    setKpisSeleccionados([...kpisSeleccionados, key]);
    setNewCustomKpiLabel('');
  };

  const handleRemoveCustomKpi = (key: string) => {
    setCustomKpis(customKpis.filter(k => k.key !== key));
    setKpisSeleccionados(kpisSeleccionados.filter(k => k !== key));
  };

  // Manejo del Menú de Ideas
  const handleAddIdea = () => {
    setMenuIdeas([...menuIdeas, '']);
  };

  const handleUpdateIdea = (idx: number, text: string) => {
    const updated = [...menuIdeas];
    updated[idx] = text;
    setMenuIdeas(updated);
  };

  const handleRemoveIdea = (idx: number) => {
    setMenuIdeas(menuIdeas.filter((_, i) => i !== idx));
  };

  // Manejo de Posts
  const handleAddPost = () => {
    const newId = `post_${Date.now()}_${posts.length + 1}`;
    const newPost: PostItem = {
      id: newId,
      titulo: `Post ${posts.length + 1}`,
      formato: 'Reel/TikTok',
      plataforma: 'TikTok',
      gancho: '',
      tipVisual: '',
      desarrollo: '',
      cta: '',
      estado: 'Idea',
      fechaPublicacion: '',
      checklistBatching: DEFAULT_BATCHING_STEPS,
      checklistSeo: DEFAULT_SEO_STEPS,
      progreso: { guionado: false, grabado: false, editado: false, programado: false }
    };
    setPosts([...posts, newPost]);
    setExpandedPostId(newId);
  };

  const handleUpdatePostField = (id: string, field: keyof PostItem, value: any) => {
    setPosts(posts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleUpdatePostProgress = (id: string, step: keyof PostItem['progreso']) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          progreso: {
            ...p.progreso,
            [step]: !p.progreso[step]
          }
        };
      }
      return p;
    }));
  };

  const handleRemovePost = (id: string) => {
    if (posts.length <= 1) {
      Swal.fire({
        text: 'Debes mantener al menos una publicación en la semana.',
        icon: 'warning',
        background: '#09090b',
        color: '#f4f4f5'
      });
      return;
    }
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleSaveClick = () => {
    if (!title.trim() || title === 'Semana del ... al ...') {
      Swal.fire({
        text: 'Por favor, define un título válido para identificar la semana de planificación.',
        icon: 'warning',
        background: '#09090b',
        color: '#f4f4f5'
      });
      return;
    }

    const payload: WeeklyPlanData = {
      tituloSemana: title,
      fechaDesde,
      fechaHasta,
      objetivoSemana: objetivo,
      kpisSeleccionados,
      customKpis,
      menuIdeas: menuIdeas.filter(i => i.trim() !== ''),
      posts,
      checklistBatching,
      checklistSeo,
      analisisCierre: {
        totalDms,
        mejorPost,
        masCompartido,
        queFunciono,
        queFallo,
        decisionProximaSemana
      }
    };

    onSave(title, payload);
  };

  const handleExportJson = () => {
    const payload: WeeklyPlanData = {
      tituloSemana: title,
      fechaDesde,
      fechaHasta,
      objetivoSemana: objetivo,
      kpisSeleccionados,
      customKpis,
      menuIdeas: menuIdeas.filter(i => i.trim() !== ''),
      posts,
      checklistBatching,
      checklistSeo,
      analisisCierre: {
        totalDms,
        mejorPost,
        masCompartido,
        queFunciono,
        queFallo,
        decisionProximaSemana
      }
    };

    const jsonString = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(jsonString);
    Swal.fire({
      title: 'Copiado al Portapapeles',
      text: 'El JSON de planificación ha sido copiado. Puedes pegarlo a una IA para pedirle cambios o guardarlo como respaldo.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      background: '#09090b',
      color: '#f4f4f5'
    });
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Header Fijo */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none text-xl font-bold text-white w-full max-w-[400px] transition-colors"
            />
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Período:</span>
              <div className="flex items-center gap-1 bg-zinc-950/60 border border-zinc-850 px-2.5 py-1 rounded-xl">
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={e => setFechaDesde(e.target.value)}
                  className="bg-transparent border-none text-[10px] text-white outline-none focus:ring-0"
                />
                <span className="text-[10px] text-zinc-650 font-bold uppercase mx-1">al</span>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={e => setFechaHasta(e.target.value)}
                  className="bg-transparent border-none text-[10px] text-white outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-zinc-750"
            title="Copiar JSON del plan"
          >
            <Download size={13} />
            <span>Copiar JSON</span>
          </button>
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? 'Guardando...' : 'Guardar Plan'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
          
          {/* BLOQUE 1: Objetivo y KPIs */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-black">1</span>
              <span>Objetivo y KPIs de la Semana</span>
            </h3>

            {/* Enfoque / Objetivo principal */}
            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Enfoque Principal</label>
              <div className="grid grid-cols-3 gap-3">
                {['Atracción', 'Nutrición', 'Conversión'].map(obj => {
                  const isSelected = objetivo === obj;
                  return (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => setObjetivo(obj)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                          : 'bg-zinc-950/40 border-zinc-850 text-zinc-450 hover:border-zinc-750'
                      }`}
                    >
                      <span className="text-xs block">{obj}</span>
                      <span className="text-[9px] font-normal text-zinc-500 block mt-0.5">
                        {obj === 'Atracción' && 'Foco en Reels/TikToks'}
                        {obj === 'Nutrición' && 'Foco en Carruseles/LinkedIn'}
                        {obj === 'Conversión' && 'Foco en Historias/CTA'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* KPIs a medir */}
            <div>
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Métricas a medir el Domingo</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DEFAULT_KPIS.map(kpi => {
                  const isChecked = kpisSeleccionados.includes(kpi.key);
                  return (
                    <button
                      key={kpi.key}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setKpisSeleccionados(kpisSeleccionados.filter(k => k !== kpi.key));
                        } else {
                          setKpisSeleccionados([...kpisSeleccionados, kpi.key]);
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors ${
                        isChecked 
                          ? 'bg-zinc-900 border-emerald-500/40 text-white' 
                          : 'bg-zinc-950/20 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span>{kpi.label}</span>
                      {isChecked ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <Circle size={14} className="text-zinc-650 shrink-0" />}
                    </button>
                  );
                })}

                {/* KPIs personalizados cargados */}
                {customKpis.map(kpi => {
                  const isChecked = kpisSeleccionados.includes(kpi.key);
                  return (
                    <div
                      key={kpi.key}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs ${
                        isChecked 
                          ? 'bg-zinc-900 border-emerald-500/40 text-white' 
                          : 'bg-zinc-950/20 border-zinc-850 text-zinc-400'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setKpisSeleccionados(kpisSeleccionados.filter(k => k !== kpi.key));
                          } else {
                            setKpisSeleccionados([...kpisSeleccionados, kpi.key]);
                          }
                        }}
                        className="flex-1 flex items-center justify-between mr-2"
                      >
                        <span>📈 {kpi.label}</span>
                        {isChecked ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Circle size={14} className="text-zinc-650" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomKpi(kpi.key)}
                        className="text-zinc-550 hover:text-red-400 transition-colors p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Input agregar KPI personalizado */}
              <div className="flex items-center gap-2 mt-3 bg-zinc-950/50 p-1.5 rounded-xl border border-zinc-850">
                <input
                  type="text"
                  placeholder="Agregar KPI personalizado (ej: Vistas de video, etc.)"
                  value={newCustomKpiLabel}
                  onChange={e => setNewCustomKpiLabel(e.target.value)}
                  className="flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder-zinc-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomKpi}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold uppercase transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: El menú de ideas */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-black">2</span>
              <span>El Menú de Ideas Rápidas</span>
            </h3>
            <p className="text-[10px] text-zinc-550">Anota ideas de la semana anterior (preguntas de clientes, dolores, etc.).</p>

            <div className="space-y-2">
              {menuIdeas.map((idea, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-zinc-950/30 border border-zinc-850 p-2 rounded-xl group">
                  <span className="text-[10px] font-bold text-zinc-600 font-mono w-4">#{idx+1}</span>
                  <input
                    type="text"
                    value={idea}
                    placeholder="Escribe una idea rápida para guionar..."
                    onChange={e => handleUpdateIdea(idx, e.target.value)}
                    className="flex-1 bg-transparent text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIdea(idx)}
                    className="text-zinc-650 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddIdea}
              className="py-2 bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-850 rounded-xl text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase w-full flex items-center justify-center gap-1.5"
            >
              <Plus size={12} />
              <span>Añadir Idea</span>
            </button>
          </div>

          {/* BLOQUE 3: Guiones y Estructura */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-black">3</span>
                <span>Guiones y Estructuras de Videos</span>
              </h3>
              <button
                type="button"
                onClick={handleAddPost}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold rounded-lg uppercase flex items-center gap-1 transition-colors"
              >
                <Plus size={12} />
                <span>Agregar Post</span>
              </button>
            </div>

            {/* Listado de Posts */}
            <div className="space-y-3">
              {posts.map((post, idx) => {
                const isExpanded = expandedPostId === post.id;
                
                // Calcular progreso
                const progressSteps = [
                  { key: 'guionado', label: 'Guionado' },
                  { key: 'grabado', label: 'Grabado' },
                  { key: 'editado', label: 'Editado' },
                  { key: 'programado', label: 'Programado' }
                ] as const;

                const completedCount = Object.values(post.progreso).filter(Boolean).length;
                const percent = (completedCount / 4) * 100;

                return (
                  <div 
                    key={post.id} 
                    className={`border rounded-2xl transition-all ${
                      isExpanded 
                        ? 'bg-zinc-950/60 border-zinc-850 p-4 space-y-4' 
                        : 'bg-zinc-950/20 border-zinc-850/60 p-3 flex flex-col md:flex-row md:items-center justify-between gap-4'
                    }`}
                  >
                    {/* Vista Colapsada */}
                    {!isExpanded ? (
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-zinc-600">POST {idx+1}</span>
                            <span className="text-[8px] font-black uppercase bg-zinc-900 border border-zinc-800 text-zinc-450 px-1.5 py-0.5 rounded">
                              {post.plataforma}
                            </span>
                            <span className="text-[8px] font-black uppercase bg-zinc-900 border border-zinc-800 text-zinc-450 px-1.5 py-0.5 rounded">
                              {post.formato}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white">{post.titulo || 'Sin título'}</h4>
                        </div>

                        {/* Barra de progreso rápida */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setExpandedPostId(post.id)}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-[9px] font-bold rounded-lg transition-colors"
                            >
                              Expandir
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePost(post.id)}
                              className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-550 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Vista Expandida */
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono">POST {idx+1}</span>
                            <input
                              type="text"
                              value={post.titulo}
                              onChange={e => handleUpdatePostField(post.id, 'titulo', e.target.value)}
                              placeholder="Título o Tema interno"
                              className="bg-transparent text-xs font-bold text-white outline-none border-b border-transparent hover:border-zinc-800 focus:border-zinc-700 px-1 py-0.5"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedPostId(null)}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg text-[9px] font-bold transition-colors"
                            >
                              Colapsar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePost(post.id)}
                              className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-550 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Selectores Plataforma y Formato */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Red Social / Destino</label>
                            <select
                              value={post.plataforma}
                              onChange={e => handleUpdatePostField(post.id, 'plataforma', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-zinc-300 outline-none"
                            >
                              {DEFAULT_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                              <option value="X">X (Twitter)</option>
                              <option value="YouTube">YouTube</option>
                              <option value="Otro">Otro / Personalizado</option>
                            </select>
                            {post.plataforma === 'Otro' && (
                              <input
                                type="text"
                                placeholder="Escribe red social..."
                                onChange={e => handleUpdatePostField(post.id, 'plataforma', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-white outline-none mt-1.5"
                              />
                            )}
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Formato de Publicación</label>
                            <select
                              value={post.formato}
                              onChange={e => handleUpdatePostField(post.id, 'formato', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-zinc-300 outline-none"
                            >
                              {DEFAULT_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                              <option value="Hilo">Hilo</option>
                              <option value="Short">Short</option>
                              <option value="Video Largo">Video Largo</option>
                              <option value="Otro">Otro / Personalizado</option>
                            </select>
                            {post.formato === 'Otro' && (
                              <input
                                type="text"
                                placeholder="Escribe formato..."
                                onChange={e => handleUpdatePostField(post.id, 'formato', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs text-white outline-none mt-1.5"
                              />
                            )}
                          </div>
                        </div>

                        {/* Campos de Redacción de Guión */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Gancho Inicial (0-3s)</label>
                            <input
                              type="text"
                              value={post.gancho}
                              onChange={e => handleUpdatePostField(post.id, 'gancho', e.target.value)}
                              placeholder="Ej: ¿Perdés 3 horas los domingos sumando tickets?"
                              className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Tip Visual / Fondo</label>
                              <input
                                type="text"
                                value={post.tipVisual}
                                onChange={e => handleUpdatePostField(post.id, 'tipVisual', e.target.value)}
                                placeholder="Ej: Yo agarrándome la cabeza frente a un Excel"
                                className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Llamado a la Acción (CTA)</label>
                              <input
                                type="text"
                                value={post.cta}
                                onChange={e => handleUpdatePostField(post.id, 'cta', e.target.value)}
                                placeholder="Ej: Comentá la palabra STOCK y te mando un video demo"
                                className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Desarrollo (Agitación + Solución)</label>
                            <textarea
                              rows={3}
                              value={post.desarrollo}
                              onChange={e => handleUpdatePostField(post.id, 'desarrollo', e.target.value)}
                              placeholder="Escribe los puntos clave. Sin relleno. Aporta valor rápido."
                              className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none resize-none font-mono"
                            />
                          </div>
                        </div>

                        {/* Barra de progreso interactiva (Pasos) */}
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Fase de Producción</label>
                          <div className="flex flex-wrap gap-2">
                            {progressSteps.map(step => {
                              const isCompleted = post.progreso[step.key];
                              return (
                                <button
                                  key={step.key}
                                  type="button"
                                  onClick={() => handleUpdatePostProgress(post.id, step.key)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1.5 ${
                                    isCompleted
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450'
                                      : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 size={11} /> : <Circle size={11} />}
                                  <span>{step.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

    </div>
  );
};
