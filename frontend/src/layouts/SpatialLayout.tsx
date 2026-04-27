import React, { useEffect, useState } from 'react';
import { WorkspaceTopBar } from '../components/layout/WorkspaceTopBar';
import { WorkspaceMap } from '../components/layout/WorkspaceMap';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { 
    Sparkles, AlertTriangle, Users, MessageSquare, 
    Database, Activity, LayoutGrid, Zap, Terminal, 
    History as HistoryIcon, ChevronRight, Rocket
} from 'lucide-react';
import { usePresence } from '../context/PresenceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { api } from '../lib/apiClient';
import Swal from 'sweetalert2';

export const SpatialLayout: React.FC = () => {
  const { tenantId, isLoading } = useProject();
  const { workspaceId } = useWorkspaceStore();
  const { 
    emergencyMeeting, presences, globalChat, activityLogs, sendGlobalMessage 
  } = usePresence();
  const { setActiveRoom } = useWorkspaceStore();
  const [showOverlay, setShowOverlay] = useState(false);
  const [leftTab, setLeftTab] = useState<'chat' | 'context'>('chat');
  const [messageText, setMessageText] = useState("");
  const [meetingsHistory, setMeetingsHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  const isValidUUID = (id: string) => {
    return id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  };

  // Contadores Reales
  const totalUsers = Object.keys(presences).length;
  const activeRooms = new Set(Object.values(presences).map(p => p.zonaActual)).size;

  useEffect(() => {
    if (emergencyMeeting) {
        setShowOverlay(true);
    }
  }, [emergencyMeeting]);

  useEffect(() => {
    // Usamos el workspaceId del store que es el UUID real
    const targetId = workspaceId && isValidUUID(workspaceId) ? workspaceId : (tenantId && isValidUUID(tenantId) ? tenantId : null);
    
    if (targetId && leftTab === 'context') {
        api.get(`colab/meetings/${targetId}`).then(res => setMeetingsHistory(res as any[]));
    }
  }, [tenantId, workspaceId, leftTab]);

  const handleSendGlobal = () => {
      if (!messageText.trim()) return;
      sendGlobalMessage(messageText);
      setMessageText("");
  };

  const handleViewMeeting = (meeting: any) => {
      const acta = typeof meeting.actaJson === 'string' ? JSON.parse(meeting.actaJson) : (meeting.actaJson || {});
      const date = new Date(meeting.fechaInicio).toLocaleDateString();
      
      Swal.fire({
          title: `<span style="color: #60a5fa; font-family: 'Inter', sans-serif; font-weight: 900; text-transform: uppercase; font-size: 16px;">Acta de Reunión: ${meeting.titulo}</span>`,
          html: `
            <div style="text-align: left; color: #94a3b8; font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.6;">
                <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin: 0; color: #fff; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 8px;">Participantes</p>
                    <p style="margin: 0; font-size: 12px;">${acta.participantes?.join(', ') || 'No registrados'}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p style="margin: 0; color: #fff; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px;">Decisiones Tomadas</p>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        ${(acta.encuestas || []).length > 0 ? acta.encuestas.map((p: any) => `
                            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                                <p style="margin: 0 0 10px 0; color: #cbd5e1; font-weight: 600; font-size: 12px;">${p.pregunta}</p>
                                <div style="display: flex; flex-direction: column; gap: 6px;">
                                    ${p.resultados.map((r: any, idx: number) => `
                                        <div>
                                            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                                                <span>${r.opcion}</span>
                                                <span>${r.porcentaje}%</span>
                                            </div>
                                            <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
                                                <div style="width: ${r.porcentaje}%; height: 100%; background: ${['#3b82f6','#10b981','#ef4444','#f59e0b'][idx % 4]};"></div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('') : '<p style="font-style: italic; font-size: 11px;">No se registraron encuestas en esta sesión.</p>'}
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px; font-size: 9px; font-weight: 900; color: #334155; text-transform: uppercase; tracking-widest;">
                    <span>REF: ${meeting.id.substring(0, 8)}</span>
                    <span>ARCHIVADO: ${date}</span>
                </div>
            </div>
          `,
          background: '#0B0F1A',
          color: '#fff',
          confirmButtonText: 'CERRAR DOSSIER',
          confirmButtonColor: '#3b82f6',
          width: '500px',
          customClass: {
              popup: 'rounded-[30px] border border-white/5 backdrop-blur-2xl shadow-2xl',
              confirmButton: 'rounded-xl px-8 font-black text-[10px] uppercase tracking-widest'
          }
      });
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
      navigate('/login');
    }
  }, [tenantId, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0B0F1A] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-10 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
          <Sparkles size={60} className="text-emerald-500 animate-spin relative" />
        </div>
        <p className="mt-8 text-zinc-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">
          Cargando Centro de Mando...
        </p>
      </div>
    );
  }

  if (!tenantId) return null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090F] text-zinc-300 font-sans">
      <WorkspaceTopBar />
      
      <div className="flex-1 flex overflow-hidden pt-[72px]">
        
        {/* --- PANEL IZQUIERDO: SOCIAL & CONTEXTO --- */}
        <aside className="w-[340px] border-r border-white/5 bg-zinc-950/40 backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-500">
            {/* Tabs Selector */}
            <div className="flex p-4 gap-2">
                <button 
                    onClick={() => setLeftTab('chat')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${leftTab === 'chat' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                >
                    <MessageSquare size={14} /> Canal Síncrono
                </button>
                <button 
                    onClick={() => setLeftTab('context')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${leftTab === 'context' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                >
                    <Database size={14} /> Dossier
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {leftTab === 'chat' ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            {/* Historial de Chat Global Real */}
                            {globalChat.map((msg, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black text-blue-400 uppercase">{msg.nombreUsuario}</span>
                                        <span className="text-[7px] text-zinc-600">{formatTime(msg.fecha)}</span>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] leading-relaxed">
                                        {msg.contenido}
                                    </div>
                                </div>
                            ))}
                            {globalChat.length === 0 && (
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 opacity-50">
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Sistema de Mensajería Global</span>
                                    <p className="text-xs text-zinc-400 leading-relaxed italic">"Sin transmisiones recientes. Iniciá la conversación."</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 p-2 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-2">
                            <input 
                                type="text" 
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendGlobal()}
                                placeholder="Transmitir..." 
                                className="flex-1 bg-transparent border-none text-xs px-3 focus:outline-none" 
                            />
                            <button 
                                onClick={handleSendGlobal}
                                className="p-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors"
                            >
                                <Zap size={14} className="text-white" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* SECCIÓN DE BUGS (Placeholder por ahora, pero con estilo) */}
                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2 px-1">
                                <AlertTriangle size={12} className="text-amber-500" /> Alertas de Bloqueo
                            </h4>
                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl opacity-50 italic">
                                <p className="text-[10px] text-amber-200/50">Escaneando dependencias críticas...</p>
                            </div>
                        </section>

                        {/* SECCIÓN DE REUNIONES DINÁMICA */}
                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2 px-1">
                                <HistoryIcon size={12} className="text-blue-500" /> Dossier de Actas
                            </h4>
                            <div className="space-y-3">
                                {meetingsHistory.length === 0 ? (
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No hay registros</p>
                                    </div>
                                ) : (
                                    meetingsHistory.map((meeting) => (
                                        <div 
                                            key={meeting.id}
                                            onClick={() => handleViewMeeting(meeting)}
                                            className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[11px] font-bold text-zinc-200 group-hover:text-blue-400 transition-colors line-clamp-1">{meeting.titulo}</span>
                                                <ChevronRight size={14} className="text-zinc-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">
                                                    {new Date(meeting.fechaInicio).toLocaleDateString()}
                                                </span>
                                                <div className="flex -space-x-1">
                                                    {[1,2,3].map(i => <div key={i} className="w-4 h-4 rounded-full border border-zinc-950 bg-zinc-800" />)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Status Footer */}
            <div className="p-6 border-t border-white/5 bg-zinc-950/60">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Estado del Sistema</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase">Óptimo</span>
                    </div>
                </div>
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-emerald-500" />
                </div>
            </div>
        </aside>

        {/* --- ÁREA CENTRAL: EL MAPA --- */}
        <main className="flex-1 relative bg-[#07090F] overflow-hidden">
            <WorkspaceMap />
            
            {/* Controles de Navegación Flotantes (Visual) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <button className="p-2 hover:bg-white/10 rounded-xl text-zinc-500 transition-colors"><LayoutGrid size={20} /></button>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 px-4">
                    <button className="text-lg font-black text-white hover:scale-110 transition-transform">−</button>
                    <span className="text-[10px] font-black text-zinc-400 uppercase w-12 text-center">100%</span>
                    <button className="text-lg font-black text-white hover:scale-110 transition-transform">+</button>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <button className="p-2 hover:bg-white/10 rounded-xl text-zinc-500 transition-colors"><Zap size={20} /></button>
            </div>
        </main>

        {/* --- PANEL DERECHO: LOGÍSTICA & MÉTRICAS --- */}
        <aside className="w-[340px] border-l border-white/5 bg-zinc-950/40 backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
            
            {/* ACTIVIDAD EN TIEMPO REAL */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                        <Activity size={14} className="text-blue-500" /> Actividad en Tiempo Real
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {activityLogs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                                <Terminal size={40} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Escaneando eventos...</span>
                            </div>
                        ) : (
                            activityLogs.map((log, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-4 group"
                                >
                                    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border bg-white/5 border-white/10">
                                        {getEventIcon(log.tipoEvento)}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-white group-hover:text-blue-400 transition-colors uppercase">{log.nombreUsuario}</span>
                                            <span className="text-[8px] text-zinc-600 font-bold">{formatTime(log.fecha)}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-tight">{getEventText(log)}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* RESUMEN GENERAL REAL */}
            <div className="p-8 border-t border-white/5 bg-black/40 space-y-6">
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Resumen General</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                        <Users size={16} className="text-emerald-500 mb-1" />
                        <span className="text-xl font-black text-white leading-none">{totalUsers}</span>
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">Usuarios Conectados</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                        <LayoutGrid size={16} className="text-blue-500 mb-1" />
                        <span className="text-xl font-black text-white leading-none">{activeRooms}</span>
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">Oficinas Activas</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Carga del Servidor</span>
                        <span className="text-[9px] font-black text-blue-500 uppercase">12%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full w-[12%] bg-blue-500" />
                    </div>
                </div>
            </div>
        </aside>

      </div>

      {/* Alerta de Emergencia Global (Overlay) */}
      <AnimatePresence>
        {showOverlay && emergencyMeeting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-red-900/60 backdrop-blur-md"
            />

            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-2xl bg-zinc-950 border-2 border-red-500/50 rounded-[3rem] shadow-[0_0_100px_-10px_rgba(239,68,68,0.5)] p-12 overflow-hidden pointer-events-auto"
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                
                <div className="flex items-start gap-10">
                    <div className="shrink-0 w-24 h-24 bg-red-500/20 rounded-3xl border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <AlertTriangle className="text-red-500 animate-bounce" size={48} />
                    </div>
                    
                    <div className="flex-1">
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Emergency <span className="text-red-600">Meeting</span></h2>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mt-3 italic">Prioridad Máxima Requerida</p>
                        
                        <div className="mt-10 bg-white/5 border border-white/10 rounded-[2rem] p-8">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Tema de Discusión:</p>
                            <p className="text-2xl font-bold text-white uppercase italic tracking-tight leading-none">{emergencyMeeting.tema}</p>
                            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white uppercase border border-white/10">
                                    {emergencyMeeting.nombreCreador?.[0]}
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Convocado por <span className="text-white font-black">{emergencyMeeting.nombreCreador}</span></span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button 
                                onClick={() => { setActiveRoom('reunion'); setShowOverlay(false); }}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs py-5 rounded-2xl shadow-2xl shadow-red-500/30 transition-all flex items-center justify-center gap-3 group"
                            >
                                <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Ingresar a Sala de Guerra
                            </button>
                            <button 
                                onClick={() => setShowOverlay(false)}
                                className="px-10 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white font-black uppercase text-[10px] py-5 rounded-2xl border border-white/5 transition-all"
                            >
                                Ignorar
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const History = ({ size, className }: { size?: number, className?: string }) => (
    <Activity size={size} className={className} /> // Reemplazo temporal si no existe History
);
