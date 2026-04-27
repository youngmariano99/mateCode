import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient';
import { 
    Zap, Bug as BugIcon, Activity, Plus, CheckCircle2, PenTool 
} from 'lucide-react';
import { CreateDecisionModal } from './CreateDecisionModal';
import { CreateBugModal } from './CreateBugModal';
import { VirtualOfficeMap } from './VirtualOfficeMap';
import { SynchronousMeetingRoom } from './SynchronousMeetingRoom';
import { usePresence } from '../../hooks/usePresence';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

interface UserPresence {
    userId: string;
    nombre: string;
    zonaActual: string;
    actividadActual?: { tipo: string, id: string, titulo: string, especialidad?: string };
    globoDialogo?: { texto: string, tipo: 'info' | 'accion' | 'alerta', expiraEn: number };
}

interface Ticket {
    id: string;
    titulo: string;
    estado: string;
    especialidad?: string;
}

interface FeedItem {
    id: string;
    tipo: 'decision' | 'bug';
    titulo: string;
    descripcion: string;
    estado: string;
    fechaCreacion: string;
    elementosRelacionados?: { tipo: string, id: string, nombre: string }[];
    score?: number;
}

export const DevHubLayout: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { setActiveRoom } = useWorkspaceStore();
    const { 
        presences, 
        emergencyMeeting, 
        currentUser
    } = usePresence();
    
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeBoards, setActiveBoards] = useState<{ id: string, nombre: string, sala: number }[]>([]);
    
    // UI State
    const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [sidebarTab, setSidebarTab] = useState<'feed' | 'tickets' | 'boards'>('feed');

    // Mapear presencias del contexto al formato local para el Mapa
    const users: UserPresence[] = Object.values(presences).map(p => ({
        userId: p.userId,
        nombre: p.nombre,
        zonaActual: p.zonaActual,
        actividadActual: p.actividadActual,
        globoDialogo: p.globoDialogo
    }));

    const myPresence = presences[currentUser?.id || ''] || {
        userId: currentUser?.id || 'anon',
        nombre: currentUser?.nombre || 'Mariano',
        zonaActual: 'pasillo'
    };

    const loadData = async () => {
        try {
            const [decisiones, bugs, projectTickets] = await Promise.all([
                apiClient.get(`/api/colab/decisions/${projectId}`),
                apiClient.get(`/api/colab/bugs/${projectId}`),
                apiClient.get(`/api/kanban/tickets/${projectId}`)
            ]);

            setTickets((projectTickets as Ticket[]) || []);

            const mappedDecisiones = (decisiones as any[]).map(d => ({ ...d, tipo: 'decision' as const }));
            const mappedBugs = (bugs as any[]).map(b => ({ ...b, tipo: 'bug' as const }));
            const combined = [...mappedDecisiones, ...mappedBugs].sort((a, b) => 
                new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
            );
            setFeed(combined);
        } catch (error) {
            console.error("Error cargando datos", error);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        loadData();
    }, [projectId]);

    const handleCheckIn = (ticket: Ticket) => {
        let zone = 'pasillo';
        const spec = ticket.especialidad?.toLowerCase();
        
        if (spec?.includes('front')) zone = 'focus_frontend';
        else if (spec?.includes('back')) zone = 'focus_backend';
        else if (spec?.includes('qa') || spec?.includes('test')) zone = 'focus_qa';
        else if (spec?.includes('devops') || spec?.includes('infra')) zone = 'focus_devops';
        
        setActiveRoom(zone);
    };

    const handleCreateBoard = () => {
        const name = prompt("Nombre de la pizarra:");
        if (!name) return;
        const sala = activeBoards.length + 1;
        if (sala > 3) { alert("Todas las salas de pizarra están ocupadas."); return; }
        
        const newBoard = { id: Math.random().toString(36).substring(7), nombre: name, sala };
        setActiveBoards(prev => [...prev, newBoard]);
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden bg-zinc-950 text-white font-sans">
            
            {/* Sidebar Moderno */}
            <div className="w-80 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col z-20 shadow-2xl">
                <div className="p-6 flex flex-col gap-6 bg-zinc-950/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to={`/app/projects`} className="w-10 h-10 rounded-2xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all border border-zinc-700">
                                ←
                            </Link>
                            <h1 className="text-lg font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-cyan-500">Virtual HQ</h1>
                        </div>
                    </div>
                    
                    {/* Tabs de Navegación del Sidebar */}
                    <div className="flex bg-zinc-950 rounded-xl p-1 border border-zinc-800">
                        <button onClick={() => setSidebarTab('feed')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'feed' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600'}`}>Actividad</button>
                        <button onClick={() => setSidebarTab('tickets')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'tickets' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600'}`}>Tickets</button>
                        <button onClick={() => setSidebarTab('boards')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'boards' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600'}`}>Pizarras</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
                    {sidebarTab === 'feed' && (
                        <>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <button onClick={() => setIsDecisionModalOpen(true)} className="flex flex-col items-center gap-2 bg-zinc-800/30 hover:bg-emerald-900/20 p-3 rounded-xl border border-zinc-800 transition-all">
                                    <Zap size={16} className="text-emerald-500" />
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase">Proponer ADR</span>
                                </button>
                                <button onClick={() => setIsBugModalOpen(true)} className="flex flex-col items-center gap-2 bg-zinc-800/30 hover:bg-red-900/20 p-3 rounded-xl border border-zinc-800 transition-all">
                                    <BugIcon size={16} className="text-red-500" />
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase">Reportar Bug</span>
                                </button>
                            </div>
                            {feed.map(item => (
                                <div key={item.id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${item.tipo === 'decision' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>{item.tipo.toUpperCase()}</span>
                                        <span className="text-[9px] text-zinc-600 ml-auto">{new Date(item.fechaCreacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{item.titulo}</h4>
                                </div>
                            ))}
                        </>
                    )}

                    {sidebarTab === 'tickets' && (
                        <div className="space-y-2">
                            {tickets.map(t => (
                                <div key={t.id} className="group p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{t.especialidad || 'Sin asignar'}</span>
                                        <button 
                                            onClick={() => handleCheckIn(t)}
                                            className="opacity-0 group-hover:opacity-100 bg-indigo-600 hover:bg-indigo-500 text-[8px] font-black px-2 py-1 rounded transition-all"
                                        >
                                            CHECK-IN
                                        </button>
                                    </div>
                                    <h4 className="text-xs font-medium text-zinc-300">{t.titulo}</h4>
                                </div>
                            ))}
                        </div>
                    )}

                    {sidebarTab === 'boards' && (
                        <div className="space-y-4">
                            <button onClick={handleCreateBoard} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20 transition-all">
                                <Plus size={14} /> Nueva Pizarra
                            </button>
                            {activeBoards.map(b => (
                                <div key={b.id} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-emerald-400">{b.nombre}</span>
                                        <span className="text-[8px] text-emerald-600 font-black uppercase">Sala {b.sala}</span>
                                    </div>
                                    <PenTool size={16} className="text-emerald-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* User Status Bar */}
                <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs shadow-lg">YO</div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-[10px] font-black text-white uppercase truncate">{myPresence.nombre}</div>
                        <div className="text-[8px] text-zinc-500 flex items-center gap-1">
                            <Activity size={8} className="text-emerald-500" /> {myPresence.zonaActual.replace('_', ' ')}
                        </div>
                    </div>
                    <button onClick={() => setActiveRoom('pasillo')} className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-600 hover:text-white">
                        <CheckCircle2 size={16} />
                    </button>
                </div>
            </div>

            {/* Virtual Office Map */}
            <div className="flex-1 relative">
                <VirtualOfficeMap 
                    users={[...users, myPresence]} 
                    activeBoards={activeBoards}
                    onJoinBoard={(id) => {
                        const b = activeBoards.find(x => x.id === id);
                        if (b) setActiveRoom(`pizarra_${b.sala}`);
                    }}
                />
            </div>

            {/* Modals */}
            {isDecisionModalOpen && <CreateDecisionModal projectId={projectId!} onClose={() => setIsDecisionModalOpen(false)} onSuccess={loadData} />}
            {isBugModalOpen && <CreateBugModal projectId={projectId!} onClose={() => setIsBugModalOpen(false)} onSuccess={loadData} />}
            {emergencyMeeting && (
                <SynchronousMeetingRoom />
            )}
            
        </div>
    );
};
