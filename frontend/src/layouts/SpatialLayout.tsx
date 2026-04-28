import React, { useEffect, useState, lazy, Suspense } from 'react';
import { WorkspaceTopBar } from '../components/layout/WorkspaceTopBar';
import { WorkspaceMap } from '../components/layout/WorkspaceMap';
import { MateLoadingScreen } from '../components/layout/MateLoadingScreen';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { 
    AlertTriangle, Users, MessageSquare, 
    Database, Activity, Zap, 
    History as HistoryIcon, ChevronRight, Rocket,
    Bug as BugIcon, Lightbulb, Plus, Search, ChevronLeft,
    X, Box, Map as MapIcon
} from 'lucide-react';
import { CreateBugModal } from '../components/devhub/CreateBugModal';
import { CreateDecisionModal } from '../components/devhub/CreateDecisionModal';
import { usePresence } from '../context/PresenceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { api } from '../lib/apiClient';
import Swal from 'sweetalert2';

const SpatialOS = lazy(() => import('../spatial-os/SpatialOS').then(m => ({ default: m.SpatialOS })));

export const SpatialLayout: React.FC = () => {
  const { tenantId, isLoading } = useProject();
  const { workspaceId, activeRoom, setActiveRoom } = useWorkspaceStore();
  const { 
    emergencyMeeting, presences, globalChat, activityLogs, sendGlobalMessage 
  } = usePresence();
  
  const [showOverlay, setShowOverlay] = useState(false);
  const [leftTab, setLeftTab] = useState<'chat' | 'context' | 'meetings'>('chat');
  const [messageText, setMessageText] = useState("");
  const [meetingsHistory, setMeetingsHistory] = useState<any[]>([]);
  const [bugs, setBugs] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isSpatialOS, setIsSpatialOS] = useState(false);

  // Floating HUD States
  const [activePanel, setActivePanel] = useState<'chat' | 'dossier' | 'activity' | null>(null);
  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadActivity, setUnreadActivity] = useState(0);

  // Pagination & Filtering States
  const [meetingSearch, setMeetingSearch] = useState("");
  const [bugSearch, setBugSearch] = useState("");
  const [decisionSearch, setDecisionSearch] = useState("");
  const [meetingPage, setMeetingPage] = useState(0);
  const [bugPage, setBugPage] = useState(0);
  const [decisionPage, setDecisionPage] = useState(0);
  const PAGE_SIZE = 3;

  const navigate = useNavigate();

  // Track unread notifications
  useEffect(() => {
    if (activePanel !== 'chat' && globalChat.length > 0) {
      setUnreadChat(prev => prev + 1);
    }
  }, [globalChat.length]);

  useEffect(() => {
    if (activePanel !== 'activity' && activityLogs.length > 0) {
      setUnreadActivity(prev => prev + 1);
    }
  }, [activityLogs.length]);

  useEffect(() => {
    if (activePanel === 'chat') setUnreadChat(0);
    if (activePanel === 'activity') setUnreadActivity(0);
  }, [activePanel]);

  useEffect(() => {
    const isIdValid = (id: string | null) => id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const targetId = workspaceId || tenantId;

    if (isIdValid(targetId)) {
        api.get(`colab/meetings/${targetId}`).then(res => setMeetingsHistory(res as any[])).catch(() => setMeetingsHistory([]));
        api.get(`colab/bugs/${targetId}`).then(res => setBugs(res as any[])).catch(() => setBugs([]));
        api.get(`colab/decisions/${targetId}`).then(res => setDecisions(res as any[])).catch(() => setDecisions([]));
    }
  }, [workspaceId, tenantId]);

  const openMeetingDetail = (m: any) => {
      Swal.fire({
          title: `<h2 style="color: #fff; font-family: Inter, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; font-style: italic;">ACTA DE REUNIÓN</h2>`,
          html: `
              <div style="text-align: left; padding: 10px;">
                  <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                          <span style="background: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-size: 9px; font-weight: 900; text-transform: uppercase;">REGISTRO OFICIAL</span>
                          <span style="color: #64748b; font-size: 10px; font-weight: 700;">${new Date(m.fechaCreacion).toLocaleString()}</span>
                      </div>
                      <h4 style="color: #fff; margin: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; line-height: 1.2;">${m.titulo}</h4>
                      <p style="color: #94a3b8; font-size: 12px; margin-top: 10px; line-height: 1.6;">${m.descripcion || 'Sin descripción adicional.'}</p>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 12px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                      <div style="width: 32px; height: 32px; border-radius: 10px; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: white;">${m.creadorNombre?.[0] || 'U'}</div>
                      <div>
                          <p style="margin: 0; color: #4b5563; font-size: 8px; font-weight: 900; text-transform: uppercase; tracking: 0.1em;">Organizado por</p>
                          <p style="margin: 0; color: #fff; font-size: 11px; font-weight: 700;">${m.creadorNombre || 'Usuario del Sistema'}</p>
                      </div>
                  </div>
              </div>
          `,
          background: '#09090b',
          color: '#fff',
          confirmButtonText: 'ENTENDIDO',
          confirmButtonColor: '#10b981',
          width: '500px',
          customClass: {
              popup: 'rounded-[40px] border border-white/5 backdrop-blur-2xl shadow-2xl',
              confirmButton: 'rounded-xl px-10 font-black text-[10px] uppercase tracking-widest'
          }
      });
  };

  const handleSendGlobal = () => {
      if (!messageText.trim()) return;
      sendGlobalMessage(messageText);
      setMessageText("");
  };

  const formatTime = (dateStr: string) => {
      try {
          const date = new Date(dateStr);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch { return "Ahora"; }
  };

  const getEventIcon = (tipo: string) => {
      switch(tipo) {
          case 'INICIO_REUNION': return <AlertTriangle size={12} className="text-red-500" />;
          case 'CHAT_ENVIADO': return <MessageSquare size={12} className="text-blue-500" />;
          case 'ENTRADA_SALA': return <Users size={12} className="text-emerald-500" />;
          default: return <Activity size={12} className="text-zinc-500" />;
      }
  };

  const getEventText = (log: any) => {
      const detalles = typeof log.detalles === 'string' ? JSON.parse(log.detalles) : log.detalles;
      switch(log.tipoEvento) {
          case 'INICIO_REUNION': return `Convocó una reunión: ${detalles?.tema || ''}`;
          case 'CHAT_ENVIADO': return `Envió un mensaje: "${detalles?.extracto || ''}"`;
          case 'ENTRADA_SALA': return `Entró a la sala ${detalles?.sala || 'Central'}`;
          default: return log.tipoEvento;
      }
  };

  useEffect(() => {
    if (!isLoading && !tenantId) {
      navigate('/workspace-selector');
    }
  }, [tenantId, isLoading, navigate]);

  // Filtrado de Datos
  const filteredMeetings = meetingsHistory.filter(m => 
    (m.titulo?.toLowerCase() || "").includes(meetingSearch.toLowerCase()) ||
    (m.creadorNombre?.toLowerCase() || "").includes(meetingSearch.toLowerCase())
  );

  const filteredBugs = bugs.filter(b => 
    (b.titulo?.toLowerCase() || "").includes(bugSearch.toLowerCase()) ||
    (b.nombreUsuario?.toLowerCase() || "").includes(bugSearch.toLowerCase())
  );

  const filteredDecisions = decisions.filter(d => 
    (d.titulo?.toLowerCase() || "").includes(decisionSearch.toLowerCase()) ||
    (d.nombreUsuario?.toLowerCase() || "").includes(decisionSearch.toLowerCase())
  );

  if (isLoading || !tenantId) return null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090F] text-zinc-300 font-sans relative">
      <WorkspaceTopBar />
      
      <div className="flex-1 flex overflow-hidden pt-[72px] relative">
        
        {/* --- ÁREA CENTRAL: EL MAPA --- */}
        <main className="flex-1 relative bg-[#07090F] overflow-hidden">
            {isSpatialOS ? (
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><MateLoadingScreen isEmbedded /></div>}>
                    <SpatialOS />
                </Suspense>
            ) : (
                <WorkspaceMap />
            )}

            {/* FLOATING HUD: LEFT */}
            <div className="absolute left-8 top-8 flex flex-col gap-6 z-[100]">
                <button 
                  onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
                  className={`group relative w-16 h-16 rounded-full border border-white/10 backdrop-blur-3xl flex items-center justify-center transition-all duration-500 shadow-2xl ${activePanel === 'chat' ? 'bg-blue-600 scale-110 rotate-12' : 'bg-zinc-950/80 hover:bg-zinc-900'}`}
                >
                    <MessageSquare size={24} className={activePanel === 'chat' ? 'text-white' : 'text-zinc-500'} />
                    {unreadChat > 0 && activePanel !== 'chat' && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-zinc-950 animate-bounce">{unreadChat}</span>
                    )}
                </button>

                <button 
                  onClick={() => setActivePanel(activePanel === 'dossier' ? null : 'dossier')}
                  className={`group relative w-16 h-16 rounded-full border border-white/10 backdrop-blur-3xl flex items-center justify-center transition-all duration-500 shadow-2xl ${activePanel === 'dossier' ? 'bg-emerald-600 scale-110 -rotate-12' : 'bg-zinc-950/80 hover:bg-zinc-900'}`}
                >
                    <Database size={24} className={activePanel === 'dossier' ? 'text-white' : 'text-zinc-500'} />
                </button>
            </div>

            {/* FLOATING HUD: RIGHT */}
            <div className="absolute right-8 top-8 flex flex-col gap-6 z-[100]">
                <button 
                  onClick={() => setActivePanel(activePanel === 'activity' ? null : 'activity')}
                  className={`group relative w-16 h-16 rounded-full border border-white/10 backdrop-blur-3xl flex items-center justify-center transition-all duration-500 shadow-2xl ${activePanel === 'activity' ? 'bg-indigo-600 scale-110' : 'bg-zinc-950/80 hover:bg-zinc-900'}`}
                >
                    <Activity size={24} className={activePanel === 'activity' ? 'text-white' : 'text-zinc-500'} />
                    {unreadActivity > 0 && activePanel !== 'activity' && (
                      <span className="absolute -top-1 -left-1 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-zinc-950 animate-pulse">{unreadActivity}</span>
                    )}
                </button>

                <button 
                  onClick={() => setIsSpatialOS(!isSpatialOS)}
                  className={`group relative w-16 h-16 rounded-full border border-white/10 backdrop-blur-3xl flex items-center justify-center transition-all duration-500 shadow-2xl ${isSpatialOS ? 'bg-orange-600 scale-110' : 'bg-zinc-950/80 hover:bg-zinc-900'}`}
                >
                    {isSpatialOS ? <MapIcon size={24} className="text-white" /> : <Box size={24} className="text-zinc-500" />}
                </button>
            </div>

            {/* OVERLAY PANELS */}
            <AnimatePresence>
                {activePanel && (
                  <motion.aside
                    initial={{ x: activePanel === 'activity' ? 500 : -500, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: activePanel === 'activity' ? 500 : -500, opacity: 0 }}
                    className={`fixed top-24 bottom-10 ${activePanel === 'activity' ? 'right-8' : 'left-8'} w-[420px] bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl z-[150] flex flex-col overflow-hidden`}
                  >
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white">{activePanel}</span>
                        <button onClick={() => setActivePanel(null)}><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activePanel === 'chat' && (
                           <div className="flex flex-col h-full">
                              <div className="flex-1 space-y-6">
                                  {globalChat.map((msg, i) => (
                                      <div key={i} className="flex flex-col gap-1">
                                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{msg.nombreUsuario}</span>
                                          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-[12px] leading-relaxed italic">{msg.contenido}</div>
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-6 p-2 bg-black/60 rounded-2xl border border-white/10 flex items-center gap-3">
                                  <input 
                                      value={messageText}
                                      onChange={e => setMessageText(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && handleSendGlobal()}
                                      placeholder="Transmitir..."
                                      className="flex-1 bg-transparent border-none text-[11px] px-2 focus:outline-none" 
                                  />
                                  <button onClick={handleSendGlobal} className="p-2 bg-blue-600 rounded-xl"><Zap size={14} className="text-white" /></button>
                              </div>
                           </div>
                        )}

                        {activePanel === 'activity' && (
                           <div className="space-y-6">
                              {activityLogs.map((log, i) => (
                                  <div key={i} className="flex gap-4">
                                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10">{getEventIcon(log.tipoEvento)}</div>
                                      <div className="flex-1">
                                          <span className="text-[10px] font-black text-white uppercase">{log.nombreUsuario}</span>
                                          <p className="text-[11px] text-zinc-400 leading-tight">{getEventText(log)}</p>
                                      </div>
                                  </div>
                              ))}
                           </div>
                        )}

                        {activePanel === 'dossier' && (
                           <div className="space-y-8">
                                <div className="flex p-1 bg-white/5 rounded-2xl gap-1">
                                    <button onClick={() => setLeftTab('chat')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest ${leftTab === 'chat' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>Bugs</button>
                                    <button onClick={() => setLeftTab('context')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest ${leftTab === 'context' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>Ideas</button>
                                    <button onClick={() => setLeftTab('meetings')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest ${leftTab === 'meetings' ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}>Reuniones</button>
                                </div>
                                
                                {leftTab === 'chat' && (
                                    <div className="space-y-4">
                                        <input value={bugSearch} onChange={e => setBugSearch(e.target.value)} placeholder="Buscar bug..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px]" />
                                        {filteredBugs.slice(bugPage * PAGE_SIZE, (bugPage + 1) * PAGE_SIZE).map((b, i) => (
                                            <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-[2rem]">
                                                <h5 className="text-[12px] font-black text-white uppercase mb-2">{b.titulo}</h5>
                                                <p className="text-[10px] text-zinc-500 italic">"{b.descripcion}"</p>
                                            </div>
                                        ))}
                                        <button onClick={() => setIsBugModalOpen(true)} className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={16} /> Reportar Bug</button>
                                    </div>
                                )}

                                {leftTab === 'context' && (
                                    <div className="space-y-4">
                                        <input value={decisionSearch} onChange={e => setDecisionSearch(e.target.value)} placeholder="Buscar idea..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px]" />
                                        {filteredDecisions.slice(decisionPage * PAGE_SIZE, (decisionPage + 1) * PAGE_SIZE).map((d, i) => (
                                            <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-[2rem]">
                                                <h5 className="text-[12px] font-black text-white uppercase mb-2">{d.titulo}</h5>
                                                <p className="text-[10px] text-zinc-500 italic">"{d.descripcion}"</p>
                                            </div>
                                        ))}
                                        <button onClick={() => setIsDecisionModalOpen(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={16} /> Proponer Idea</button>
                                    </div>
                                )}

                                {leftTab === 'meetings' && (
                                    <div className="space-y-4">
                                        <input value={meetingSearch} onChange={e => setMeetingSearch(e.target.value)} placeholder="Buscar acta..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px]" />
                                        {filteredMeetings.slice(meetingPage * PAGE_SIZE, (meetingPage + 1) * PAGE_SIZE).map((m, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => openMeetingDetail(m)}
                                                className="p-5 bg-white/5 border border-white/5 rounded-[2rem] hover:border-emerald-500/40 hover:bg-white/[0.07] transition-all cursor-pointer group active:scale-[0.98]"
                                            >
                                                <h5 className="text-[12px] font-black text-white uppercase mb-2 group-hover:text-emerald-400 transition-colors">{m.titulo}</h5>
                                                <p className="text-[10px] text-zinc-500 italic">"{m.descripcion || 'Sin descripción'}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                           </div>
                        )}
                    </div>
                  </motion.aside>
                )}
            </AnimatePresence>
        </main>
      </div>

      {isBugModalOpen && <CreateBugModal projectId={workspaceId || tenantId!} onClose={() => setIsBugModalOpen(false)} onSuccess={() => setIsBugModalOpen(false)} />}
      {isDecisionModalOpen && <CreateDecisionModal projectId={workspaceId || tenantId!} onClose={() => setIsDecisionModalOpen(false)} onSuccess={() => setIsDecisionModalOpen(false)} />}

      <AnimatePresence>
        {showOverlay && emergencyMeeting && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center">
            <div className="absolute inset-0 bg-red-900/60 backdrop-blur-md" />
            <div className="relative w-full max-w-2xl bg-zinc-950 border-2 border-red-500/50 rounded-[3rem] p-12 text-center">
                <AlertTriangle className="text-red-500 mx-auto mb-6" size={48} />
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Emergency Meeting</h2>
                <p className="text-xl font-bold text-white mt-6 uppercase">{emergencyMeeting.tema}</p>
                <div className="flex gap-4 mt-10">
                    <button onClick={() => { setActiveRoom('reunion'); setShowOverlay(false); }} className="flex-1 bg-red-600 py-4 rounded-xl text-white font-black uppercase">Ingresar</button>
                    <button onClick={() => setShowOverlay(false)} className="px-10 bg-zinc-900 py-4 rounded-xl text-zinc-500 font-black uppercase">Ignorar</button>
                </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
