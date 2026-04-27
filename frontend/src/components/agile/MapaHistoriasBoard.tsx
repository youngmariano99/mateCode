import { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { Layout, Box, Sparkles, RefreshCcw, User, X } from 'lucide-react';
import { CodeEditorPane } from '../design/CodeEditorPane';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { ProjectSelectorRequired } from '../shared/ProjectSelectorRequired';

interface StoryMapData {
  proyecto: string;
  personas: any[];
  releases: any[];
  epics: any[];
}

export const MapaHistoriasBoard = ({ rawJson, initialData, projectId: propProjectId, onReset }: { 
  rawJson?: string, 
  initialData?: any, 
  projectId?: string, 
  onReset: () => void 
}) => {
  const activeProjectId = useWorkspaceStore(state => state.activeProjectId);
  const projectId = propProjectId || activeProjectId;

  const [data, setData] = useState<StoryMapData | null>(initialData || null);
  const [localJson, setLocalJson] = useState(rawJson || "");
  const [selectedHistoria, setSelectedHistoria] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLocalJson(JSON.stringify(initialData, null, 2));
      return;
    }
    
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        setData(parsed);
        setLocalJson(rawJson);
      } catch (e) {
        console.error("Error parsing Story Map JSON", e);
      }
      return;
    }

    if (projectId) {
      setIsLoading(true);
      api.get(`/Agile/projects/${projectId}/mapa-historias`)
        .then(res => {
          if (res && res.epics) {
            setData(res);
            setLocalJson(JSON.stringify(res, null, 2));
          } else {
            setData(null);
          }
        })
        .catch(err => {
          console.error("Error fetching story map:", err);
          setData(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [rawJson, initialData, projectId]);

  const allFeatures = useMemo(() => {
    if (!data) return [];
    return data.epics.flatMap(e => e.features.map((f: any) => ({ ...f, epicColor: e.color, epicName: e.nombre })));
  }, [data]);

  const handleJsonChange = (val: string) => {
    setLocalJson(val);
    try {
      const parsed = JSON.parse(val);
      setData(parsed);
    } catch (e) {}
  };

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

  const stopDragging = () => setIsDragging(false);

  const handleReset = async () => {
    const result = await Swal.fire({
      title: '⚠️ ¿Reiniciar Mapa?',
      text: "Se borrará el diseño actual para cargar uno nuevo.",
      icon: 'warning',
      showCancelButton: true,
      background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444'
    });
    if (result.isConfirmed) onReset();
  };

  const handleSyncBacklog = async () => {
    if (!projectId) return;
    setIsSyncing(true);
    try {
      await api.post(`/Agile/projects/${projectId}/sincronizar-backlog?cleanSync=false`, {});
      Swal.fire({ title: '✅ Sincronizado', icon: 'success', background: '#18181b', color: '#fff' });
    } catch (err) {
      Swal.fire({ title: 'Error', icon: 'error', background: '#18181b', color: '#fff' });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!projectId) return <ProjectSelectorRequired />;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Sparkles size={40} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Consultando Oráculo...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 w-full h-full pb-10 bg-transparent">
      <div className="flex items-center justify-between p-8 bg-white/5 backdrop-blur-xl border-b border-white/5 shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
            <Layout className="text-emerald-500" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{data.proyecto}</h2>
            <div className="flex gap-4 mt-2 overflow-x-auto max-w-[400px] no-scrollbar">
               {data.personas.map((p: any) => (
                 <div key={p.id} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <User size={10} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase">{p.nombre}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${isSidebarOpen ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'}`}
          >
            <Layout size={14} />
            {isSidebarOpen ? "OCULTAR JSON" : "VER JSON"}
          </button>
          <button onClick={handleReset} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 flex items-center gap-2 transition-all">
            <RefreshCcw size={14} /> REINICIAR
          </button>
          <button onClick={handleSyncBacklog} disabled={isSyncing} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2 transition-all">
            <Sparkles size={14} /> {isSyncing ? "SINC..." : "SINCRONIZAR"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden px-8">
          {isSidebarOpen && (
              <div className="w-[450px] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-left duration-300">
                  <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Editor de Requisitos (JSON)</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col bg-zinc-900">
                    <CodeEditorPane code={localJson} onChange={handleJsonChange} />
                  </div>
              </div>
          )}

          <div 
            ref={boardRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            className={`grid gap-px bg-zinc-800/30 border border-zinc-800 rounded-3xl overflow-auto shadow-2xl flex-1 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            style={{ 
              gridTemplateColumns: `180px repeat(${allFeatures.length}, minmax(320px, 1fr))`,
              gridAutoRows: 'min-content'
            }}
          >
            <div className="bg-zinc-900/90 p-4 flex items-center justify-center border-b border-zinc-800 sticky left-0 top-0 z-40 backdrop-blur-md">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] vertical-text">Estrategia</span>
            </div>
            {data.epics.map((epic: any) => (
              <div key={epic.id} className="p-6 border-b border-zinc-800 flex flex-col justify-center gap-2 bg-zinc-900/60 sticky top-0 z-30 backdrop-blur-md" style={{ gridColumn: `span ${epic.features.length}` }}>
                <div className="flex items-center gap-2">
                  <Box size={16} style={{ color: epic.color }} />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{epic.nombre}</h3>
                </div>
                <div className="h-1 rounded-full" style={{ backgroundColor: epic.color, opacity: 0.3 }} />
              </div>
            ))}

            <div className="bg-zinc-900/90 p-4 flex items-center justify-center border-b border-zinc-800 sticky left-0 top-[100px] z-40 backdrop-blur-md">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] vertical-text">Narrativa</span>
            </div>
            {allFeatures.map((feat: any, idx: number) => (
              <div key={idx} className="p-5 bg-zinc-900/40 border-b border-zinc-800 group transition-all hover:bg-zinc-800/40 sticky top-[100px] z-30 backdrop-blur-md">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Paso {idx + 1}</span>
                <h4 className="text-xs font-bold text-zinc-300 leading-tight group-hover:text-emerald-400">{feat.nombre}</h4>
              </div>
            ))}

            {data.releases.map((rel: any) => (
              <div key={rel.id} className="contents">
                <div className="bg-zinc-900/80 p-6 border-b border-zinc-800 sticky left-0 z-20 border-r border-zinc-800/50 backdrop-blur-md">
                  <h5 className="text-xs font-black text-emerald-500 uppercase italic">{rel.nombre}</h5>
                  <p className="text-[9px] text-zinc-500 mt-1 leading-tight">{rel.descripcion}</p>
                </div>
                {allFeatures.map((feat: any) => {
                  const storiesInCell = feat.user_stories.filter((s: any) => s.release_id === rel.id);
                  return (
                    <div key={`${rel.id}-${feat.id}`} className="p-4 border-b border-zinc-800/30 bg-zinc-950/20 min-h-[220px] flex flex-col gap-3">
                      {storiesInCell.map((story: any) => (
                        <div key={story.id} onClick={() => setSelectedHistoria(story)} className="p-4 bg-zinc-900 border-l-4 border-zinc-800 rounded-r-xl cursor-pointer hover:translate-x-1 hover:border-emerald-500 transition-all">
                          <h6 className="text-xs font-bold text-zinc-100">{story.titulo}</h6>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
      </div>

      {selectedHistoria && (
        <div className="fixed inset-y-0 right-0 w-[500px] z-50 bg-zinc-950 border-l border-zinc-800 shadow-2xl animate-in slide-in-from-right">
           <div className="p-8 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-white uppercase">Historia</h2>
                 <button onClick={() => setSelectedHistoria(null)}><X size={20} className="text-zinc-500" /></button>
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-6">{selectedHistoria.titulo}</h3>
              <div className="space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">BDD</h4>
                    <pre className="bg-black p-4 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 whitespace-pre-wrap">{selectedHistoria.bdd}</pre>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
