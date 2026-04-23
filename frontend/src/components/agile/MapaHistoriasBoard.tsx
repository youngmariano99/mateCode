import { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../../lib/apiClient';
import { BddEditorPanel } from './BddEditorPanel';
import type { Historia } from './types';
import Swal from 'sweetalert2';
import { Users, Layout, Layers, Box, Info, Sparkles, RefreshCcw, User } from 'lucide-react';

interface StoryMapData {
  proyecto: string;
  personas: any[];
  releases: any[];
  epics: any[];
}

export const MapaHistoriasBoard = ({ rawJson, initialData, projectId, onReset }: { 
  rawJson?: string, 
  initialData?: any, 
  projectId?: string, 
  onReset: () => void 
}) => {
  const [data, setData] = useState<StoryMapData | null>(null);
  const [selectedHistoria, setSelectedHistoria] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Refs para el scroll por arrastre
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }
    if (!rawJson) return;

    try {
      const parsed = JSON.parse(rawJson);
      setData(parsed);
    } catch (e) {
      console.error("Error parsing Story Map JSON", e);
    }
  }, [rawJson, initialData]);

  const allFeatures = useMemo(() => {
    if (!data) return [];
    return data.epics.flatMap(e => e.features.map((f: any) => ({ ...f, epicColor: e.color, epicName: e.nombre })));
  }, [data]);

  // Lógica de Panning (Arrastrar para hacer scroll)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!boardRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - boardRef.current.offsetLeft);
    setStartY(e.pageY - boardRef.current.offsetTop);
    setScrollLeft(boardRef.current.scrollLeft);
    setScrollTop(boardRef.current.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !boardRef.current) return;
    e.preventDefault();
    const x = e.pageX - boardRef.current.offsetLeft;
    const y = e.pageY - boardRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    boardRef.current.scrollLeft = scrollLeft - walkX;
    boardRef.current.scrollTop = scrollTop - walkY;
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleReset = async () => {
    const result = await Swal.fire({
      title: '⚠️ ¿Reiniciar Mapa?',
      text: "Se borrará el diseño actual para cargar uno nuevo. ¿Estás seguro?",
      icon: 'warning',
      showCancelButton: true,
      background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444', cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) onReset();
  };

  const handleSyncBacklog = async () => {
    if (!projectId) return;

    const result = await Swal.fire({
      title: '🚀 Sincronizar Backlog',
      text: '¿Cómo deseas sincronizar los tickets?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Incremental (Añadir nuevos)',
      denyButtonText: 'Total (Sobrescribir todo)',
      cancelButtonText: 'Cancelar',
      background: '#18181b', color: '#fff', 
      confirmButtonColor: '#10b981',
      denyButtonColor: '#ef4444',
      cancelButtonColor: '#3f3f46',
      width: '600px'
    });

    if (result.isDismissed) return;

    let cleanSync = false;
    if (result.isDenied) {
      const confirmClean = await Swal.fire({
        title: '⚠️ ¿Estás seguro?',
        text: "Esta opción ELIMINARÁ todos los tickets actuales del backlog para poner los del diagrama. Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444',
      });
      if (!confirmClean.isConfirmed) return;
      cleanSync = true;
    }

    setIsSyncing(true);
    try {
      const res = await api.post(`/Agile/projects/${projectId}/sincronizar-backlog?cleanSync=${cleanSync}`, {});
      Swal.fire({
        title: '✅ Backlog Sincronizado',
        text: `${res.message}`,
        icon: 'success',
        background: '#18181b', color: '#fff', confirmButtonColor: '#10b981'
      });
    } catch (err) {
      Swal.fire({ title: 'Error', text: 'No se pudo sincronizar.', icon: 'error', background: '#18181b', color: '#fff' });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-100px)] pb-10">
      {/* HEADER ESTRATÉGICO */}
      <div className="flex items-center justify-between glass-card p-6 rounded-3xl border-white/5 bg-zinc-900/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Layout className="text-emerald-500" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">{data.proyecto}</h2>
            <div className="flex gap-4 mt-2 overflow-x-auto max-w-[600px] no-scrollbar">
               {data.personas.map((p: any) => (
                 <div key={p.id} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800/50 rounded-full border border-white/5 whitespace-nowrap">
                    <User size={10} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-300">{p.nombre}</span>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest border-l border-zinc-700 pl-1.5 ml-0.5">{p.rol}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleReset}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 border border-white/5"
          >
            <RefreshCcw size={14} />
            Reiniciar
          </button>
          <button 
            onClick={handleSyncBacklog}
            disabled={isSyncing}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles size={14} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Backlog"}
          </button>
        </div>
      </div>

      {/* TABLERO BIDIMENSIONAL CON PANNING */}
      <div 
        ref={boardRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`
          grid gap-px bg-zinc-800/30 border border-zinc-800 rounded-3xl overflow-auto shadow-2xl flex-1
          ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}
        `}
        style={{ 
          gridTemplateColumns: `180px repeat(${allFeatures.length}, minmax(320px, 1fr))`,
          gridAutoRows: 'min-content'
        }}
      >
        {/* FILA 1: EPICS (Backbone) */}
        <div className="bg-zinc-900/90 p-4 flex items-center justify-center border-b border-zinc-800 sticky left-0 top-0 z-40 backdrop-blur-md">
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] vertical-text">Estrategia</span>
        </div>
        {data.epics.map((epic: any) => (
          <div 
            key={epic.id} 
            className="p-6 border-b border-zinc-800 flex flex-col justify-center gap-2 bg-zinc-900/60 sticky top-0 z-30 backdrop-blur-md"
            style={{ gridColumn: `span ${epic.features.length}` }}
          >
            <div className="flex items-center gap-2">
              <Box size={16} style={{ color: epic.color }} />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{epic.nombre}</h3>
            </div>
            <div className="h-1 rounded-full" style={{ backgroundColor: epic.color, opacity: 0.3 }} />
          </div>
        ))}

        {/* FILA 2: FEATURES (Flujo Narrativo) */}
        <div className="bg-zinc-900/90 p-4 flex items-center justify-center border-b border-zinc-800 sticky left-0 top-[100px] z-40 backdrop-blur-md">
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] vertical-text">Narrativa</span>
        </div>
        {allFeatures.map((feat: any, idx: number) => (
          <div key={idx} className="p-5 bg-zinc-900/40 border-b border-zinc-800 group transition-all hover:bg-zinc-800/40 sticky top-[100px] z-30 backdrop-blur-md">
            <div className="flex flex-col gap-3">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Paso {idx + 1}</span>
              <h4 className="text-xs font-bold text-zinc-300 leading-tight group-hover:text-emerald-400 transition-colors">
                {feat.nombre}
              </h4>
            </div>
          </div>
        ))}

        {/* FILAS DE RELEASES (Swimlanes) */}
        {data.releases.map((rel: any) => (
          <div key={rel.id} className="contents">
            {/* Cabecera de Release (Izquierda) */}
            <div className="bg-zinc-900/80 p-6 border-b border-zinc-800 sticky left-0 z-20 flex flex-col justify-center border-r border-zinc-800/50 backdrop-blur-md">
              <h5 className="text-xs font-black text-emerald-500 uppercase tracking-tighter italic">{rel.nombre}</h5>
              <p className="text-[9px] text-zinc-500 mt-1 leading-tight font-medium">{rel.descripcion}</p>
            </div>

            {/* Celdas de Historias */}
            {allFeatures.map((feat: any) => {
              const storiesInCell = feat.user_stories.filter((s: any) => s.release_id === rel.id);
              return (
                <div key={`${rel.id}-${feat.id}`} className="p-4 border-b border-zinc-800/30 bg-zinc-950/20 min-h-[220px] flex flex-col gap-3">
                  {storiesInCell.map((story: any) => (
                    <div 
                      key={story.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedHistoria(story); }}
                      className={`
                        p-4 bg-zinc-900 border-l-4 border-zinc-800 rounded-r-xl cursor-pointer transition-all hover:translate-x-1 hover:border-emerald-500 hover:bg-zinc-800
                        ${story.ticketStatus === 'Done' ? 'opacity-50 grayscale' : 'shadow-lg shadow-black/20'}
                      `}
                      style={{ borderLeftColor: story.priority === 'MVP' ? feat.epicColor : '#3f3f46' }}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                         <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{story.priority}</span>
                         {story.user && (
                           <div className="flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded border border-white/5">
                              <User size={8} className="text-emerald-500" />
                              <span className="text-[7px] font-bold text-zinc-400 uppercase truncate max-w-[60px]">{story.user}</span>
                           </div>
                         )}
                         <span className="text-xs shrink-0">{story.ticketStatus === 'Done' ? '✅' : '⏳'}</span>
                      </div>
                      <h6 className="text-xs font-bold text-zinc-100 leading-snug">{story.titulo}</h6>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* PANEL DE DETALLE (BDD / ACEPCIÓN) */}
      {selectedHistoria && (
        <div className="fixed inset-y-0 right-0 w-[550px] z-50 bg-zinc-950 border-l border-zinc-800 shadow-2xl animate-in slide-in-from-right duration-500">
           <div className="p-8 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">Detalle de Historia</h2>
                 <button onClick={() => setSelectedHistoria(null)} className="text-zinc-500 hover:text-white">Cerrar</button>
              </div>

              <div className="glass-card p-6 rounded-2xl mb-8 border-emerald-500/20 bg-emerald-500/5">
                 <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{selectedHistoria.user || "Cualquier Usuario"}</span>
                 </div>
                 <h3 className="text-lg font-bold text-zinc-100 leading-snug">{selectedHistoria.titulo}</h3>
              </div>

              <div className="space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-3">Escenarios BDD</h4>
                    <pre className="bg-black p-4 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed">
                       {selectedHistoria.bdd || "No hay escenarios definidos."}
                    </pre>
                 </div>

                 <div>
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-3">Criterios de Aceptación</h4>
                    <div className="space-y-2">
                       {selectedHistoria.criterios_aceptacion && Array.isArray(selectedHistoria.criterios_aceptacion) ? (
                          selectedHistoria.criterios_aceptacion.map((c: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                               <div className="w-2 h-2 rounded-full bg-blue-500" />
                               <span className="text-xs text-zinc-300 font-medium">{c}</span>
                            </div>
                          ))
                       ) : (
                          <p className="text-xs text-zinc-500 italic">No hay criterios definidos.</p>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
