import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, MessageSquare, Eraser, Lock, PlusCircle, Trash2, ClipboardList, BarChart3, HelpCircle } from 'lucide-react';
import { usePresence } from '../../hooks/usePresence';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import Swal from 'sweetalert2';

interface ChatMessage {
    user: string;
    text: string;
    time: string;
}

interface PollOption {
    id: string;
    text: string;
    votes: string[]; // User IDs
}

interface Poll {
    id: string;
    pregunta: string;
    tipo: 'boolean' | 'single' | 'multiple';
    opciones: PollOption[];
    activa: boolean;
    creadaPor: string;
}

export const SynchronousMeetingRoom: React.FC = () => {
    const { setActiveRoom } = useWorkspaceStore();
    const {
        emergencyMeeting,
        presences,
        currentUser,
        sendMeetingMessage,
        lastChatMessage,
        sendDrawAction,
        lastDrawAction,
        finalizeMeeting,
        startPoll,
        closePoll,
        submitPollVote,
        lastPollStarted,
        lastPollClosed,
        lastPollVoteReceived
    } = usePresence();

    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<ChatMessage[]>([]);
    
    // Encuestas Dinámicas
    const [polls, setPolls] = useState<Poll[]>([]);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [newPoll, setNewPoll] = useState<{
        pregunta: string;
        tipo: 'boolean' | 'single' | 'multiple';
        opciones: string[];
    }>({
        pregunta: '',
        tipo: 'boolean',
        opciones: ['']
    });

    // Pizarra
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ef4444');

    const isCreator = String(currentUser?.id).toLowerCase() === String(emergencyMeeting?.creadorId).toLowerCase();

    // AUTO-CIERRE
    useEffect(() => {
        if (!emergencyMeeting) {
            setActiveRoom('idle');
        }
    }, [emergencyMeeting, setActiveRoom]);

    // RESET CHAT ON MOUNT
    useEffect(() => {
        setChat([]);
    }, []);

    const handleClose = () => {
        setActiveRoom('idle');
    };

    const handleFinalize = async () => {
        const result = await Swal.fire({
            title: '¿FINALIZAR SESIÓN SÍNCRONA?',
            html: `
                <div class="text-left space-y-4 font-mono text-xs">
                    <p class="text-emerald-500">>>> GENERANDO ACTA DE AUDITORÍA...</p>
                    <div class="grid grid-cols-1 gap-2 border border-zinc-800 p-4 rounded-xl">
                        <p class="text-zinc-500">RESUMEN DE ACTIVIDAD</p>
                        <p class="text-white font-black">${polls.length} ENCUESTAS REALIZADAS</p>
                        <p class="text-white font-black">${chat.length} MENSAJES DE CHAT</p>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'SÍ, CERRAR Y GUARDAR',
            background: '#18181b',
            color: '#fff'
        });

        if (result.isConfirmed) {
            const acta = {
                tema: emergencyMeeting?.tema,
                encuestas: polls.map(p => ({
                    pregunta: p.pregunta,
                    tipo: p.tipo,
                    resultados: p.opciones.map(o => ({
                        opcion: o.text,
                        votos: o.votes.length,
                        porcentaje: p.opciones.reduce((acc, opt) => acc + opt.votes.length, 0) > 0 
                            ? Math.round((o.votes.length / p.opciones.reduce((acc, opt) => acc + opt.votes.length, 0)) * 100) 
                            : 0
                    }))
                })),
                mensajes: chat.length,
                fecha: new Date().toISOString(),
                participantes: Object.values(presences).map(p => p.nombre)
            };

            await finalizeMeeting(acta);
            setActiveRoom('idle');
        }
    };

    // --- ESCUCHADORES SIGNALR ---
    useEffect(() => {
        if (lastChatMessage) setChat(prev => [...prev, lastChatMessage]);
    }, [lastChatMessage]);

    useEffect(() => {
        if (lastPollStarted) {
            // Evitar duplicados si ya existe por ID
            setPolls(prev => {
                if (prev.find(p => p.id === lastPollStarted.id)) return prev;
                return [...prev, { ...lastPollStarted, activa: true }];
            });
        }
    }, [lastPollStarted]);

    useEffect(() => {
        if (lastPollClosed) {
            const { pollId, finalPollData } = lastPollClosed;
            
            // Actualizar estado local
            setPolls(prev => prev.map(p => {
                if (p.id === pollId) return { ...p, activa: false, opciones: finalPollData.opciones };
                return p;
            }));

            // Mostrar Popup de Resultados para todos
            const winner = [...finalPollData.opciones].sort((a, b) => b.votes.length - a.votes.length)[0];
            Swal.fire({
                title: 'ENCUESTA FINALIZADA',
                html: `
                    <div class="text-left space-y-4">
                        <p class="text-zinc-400 text-xs font-bold uppercase tracking-widest">Resultado de:</p>
                        <p class="text-white font-black text-lg leading-tight">"${finalPollData.pregunta}"</p>
                        <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <span class="text-[9px] font-black text-blue-400 uppercase tracking-widest">Decisión Ganadora</span>
                            <p class="text-2xl font-black text-white mt-1 uppercase">${winner.text}</p>
                            <p class="text-xs text-zinc-500 mt-1">${winner.votes.length} Votos totales</p>
                        </div>
                    </div>
                `,
                timer: 4000,
                showConfirmButton: false,
                background: '#09090b',
                color: '#fff',
                toast: true,
                position: 'top-end'
            });
        }
    }, [lastPollClosed]);

    useEffect(() => {
        if (lastPollVoteReceived) {
            const { pollId, userId, opcionesSeleccionadas } = lastPollVoteReceived;
            setPolls(prev => prev.map(p => {
                if (p.id !== pollId) return p;
                return {
                    ...p,
                    opciones: p.opciones.map(opt => ({
                        ...opt,
                        votes: opcionesSeleccionadas.includes(opt.id) 
                            ? [...new Set([...opt.votes, userId])]
                            : opt.votes.filter((id: string) => id !== userId)
                    }))
                };
            }));
        }
    }, [lastPollVoteReceived]);

    useEffect(() => {
        if (lastDrawAction && !isDrawing) drawFromNetwork(lastDrawAction);
    }, [lastDrawAction]);

    const handleSendMessage = () => {
        if (!message.trim()) return;
        sendMeetingMessage(message);
        setMessage('');
    };

    const handleCreatePoll = () => {
        if (!newPoll.pregunta.trim()) return;
        
        const pollData: Poll = {
            id: crypto.randomUUID(),
            pregunta: newPoll.pregunta,
            tipo: newPoll.tipo,
            creadaPor: currentUser?.id,
            activa: true,
            opciones: newPoll.tipo === 'boolean' 
                ? [
                    { id: 'yes', text: 'SÍ', votes: [] },
                    { id: 'no', text: 'NO', votes: [] }
                  ]
                : newPoll.opciones.filter(o => o.trim()).map(o => ({
                    id: crypto.randomUUID(),
                    text: o,
                    votes: []
                  }))
        };

        startPoll(pollData);
        setShowPollCreator(false);
        setNewPoll({ pregunta: '', tipo: 'boolean', opciones: [''] });
    };

    const handleVote = (pollId: string, optionId: string) => {
        const poll = polls.find(p => p.id === pollId);
        if (!poll || !poll.activa) return;

        let selected = [];
        if (poll.tipo === 'multiple') {
            const currentVotes = poll.opciones.find(o => o.id === optionId)?.votes || [];
            const isRemoving = currentVotes.includes(currentUser.id);
            
            selected = poll.opciones
                .filter(o => {
                    const hasVote = o.votes.includes(currentUser.id);
                    if (o.id === optionId) return !isRemoving;
                    return hasVote;
                })
                .map(o => o.id);
        } else {
            selected = [optionId];
        }

        submitPollVote(pollId, { userId: currentUser.id, opcionesSeleccionadas: selected });
    };

    const handleStopPoll = (pollId: string) => {
        const poll = polls.find(p => p.id === pollId);
        if (poll) {
            closePoll(pollId, { ...poll, activa: false });
        }
    };

    // --- LÓGICA DE PIZARRA ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 3;
    }, []);

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
        sendDrawAction({ x, y, color, type: 'draw' });
    };

    const drawFromNetwork = (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = data.color;
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        canvasRef.current?.getContext('2d')?.beginPath();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    };

    const activePoll = polls.find(p => p.activa);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full h-full max-w-[98vw] max-h-[95vh] bg-[#09090b] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative">
                
                {/* Header Superior */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/60">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                            <ShieldAlert className="text-red-500" size={24} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em] block mb-1">Sala de Guerra Síncrona</span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{emergencyMeeting?.tema}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {Object.values(presences).slice(0, 5).map(p => (
                                <div key={p.userId} className="w-8 h-8 rounded-full border-2 border-[#09090b] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                    {p.nombre[0]}
                                </div>
                            ))}
                            {Object.keys(presences).length > 5 && (
                                <div className="w-8 h-8 rounded-full border-2 border-[#09090b] bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500">
                                    +{Object.keys(presences).length - 5}
                                </div>
                            )}
                        </div>
                        {isCreator && (
                            <button onClick={handleFinalize} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
                                <Lock size={12} /> Finalizar y Archivar
                            </button>
                        )}
                        <button onClick={handleClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 flex items-center justify-center transition-all">
                            <X size={20} className="text-zinc-500" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* CHAT (IZQUIERDA) */}
                    <div className="w-72 flex flex-col border-r border-white/5 bg-zinc-950/20">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Canal de Debate</span>
                            <MessageSquare size={12} className="text-zinc-600" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {chat.map((msg, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[8px] font-black text-blue-400 uppercase">{msg.user}</span>
                                        <span className="text-[7px] text-zinc-600 font-bold">{msg.time}</span>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] text-zinc-300 leading-relaxed group-hover:border-white/10 transition-colors">
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-zinc-950/40">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Transmitir..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* PIZARRA (CENTRO) */}
                    <div className="flex-1 relative bg-[#0c0c0e] cursor-crosshair">
                        <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
                            <div className="p-3 bg-black/60 backdrop-blur-xl rounded-[1.5rem] border border-white/10 flex flex-col gap-4 shadow-2xl">
                                <button onClick={() => setColor('#ef4444')} className={`w-8 h-8 rounded-xl bg-red-500 transition-all ${color === '#ef4444' ? 'scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'opacity-40 hover:opacity-100'}`} />
                                <button onClick={() => setColor('#10b981')} className={`w-8 h-8 rounded-xl bg-emerald-500 transition-all ${color === '#10b981' ? 'scale-110 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'opacity-40 hover:opacity-100'}`} />
                                <button onClick={() => setColor('#3b82f6')} className={`w-8 h-8 rounded-xl bg-blue-500 transition-all ${color === '#3b82f6' ? 'scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'opacity-40 hover:opacity-100'}`} />
                                <div className="h-px bg-white/5 mx-1" />
                                <button onClick={clearCanvas} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 transition-all">
                                    <Eraser size={16} />
                                </button>
                            </div>
                        </div>
                        <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} className="w-full h-full" />
                    </div>

                    {/* ENCUESTAS Y DECISIONES (DERECHA) */}
                    <div className="w-[400px] border-l border-white/5 bg-zinc-950/40 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ClipboardList size={16} className="text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Inteligencia de Decisión</span>
                            </div>
                            {isCreator && (
                                <button 
                                    onClick={() => setShowPollCreator(!showPollCreator)}
                                    className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
                                >
                                    <PlusCircle size={18} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {showPollCreator ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Pregunta de Votación</label>
                                        <textarea 
                                            value={newPoll.pregunta}
                                            onChange={e => setNewPoll({...newPoll, pregunta: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all h-24"
                                            placeholder="¿Ej: Deberíamos migrar el core a Next.js?"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Tipo de Cuestionario</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['boolean', 'single', 'multiple'] as const).map(t => (
                                                <button 
                                                    key={t}
                                                    onClick={() => setNewPoll({...newPoll, tipo: t})}
                                                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${newPoll.tipo === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                                                >
                                                    {t === 'boolean' ? 'SÍ/NO' : t === 'single' ? 'ÚNICA' : 'MÚLTIPLE'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {newPoll.tipo !== 'boolean' && (
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Opciones</label>
                                            {newPoll.opciones.map((opt, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input 
                                                        value={opt}
                                                        onChange={e => {
                                                            const copy = [...newPoll.opciones];
                                                            copy[i] = e.target.value;
                                                            setNewPoll({...newPoll, opciones: copy});
                                                        }}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                                                        placeholder={`Opción ${i+1}`}
                                                    />
                                                    <button onClick={() => setNewPoll({...newPoll, opciones: newPoll.opciones.filter((_, idx) => idx !== i)})} className="p-3 text-zinc-600 hover:text-red-400"><Trash2 size={16}/></button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => setNewPoll({...newPoll, opciones: [...newPoll.opciones, '']})}
                                                className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[9px] font-black text-zinc-500 hover:text-white transition-all uppercase"
                                            >
                                                + Añadir Opción
                                            </button>
                                        </div>
                                    )}

                                    <button 
                                        onClick={handleCreatePoll}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all"
                                    >
                                        Lanzar Encuesta en Vivo
                                    </button>
                                </div>
                            ) : activePoll ? (
                                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                                    <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] relative overflow-hidden">
                                        <HelpCircle className="absolute -right-4 -bottom-4 text-blue-500/10 w-24 h-24" />
                                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-2">Encuesta Activa</span>
                                        <h3 className="text-xl font-black text-white leading-tight mb-6">{activePoll.pregunta}</h3>
                                        
                                        <div className="space-y-3">
                                            {activePoll.opciones.map(opt => {
                                                const totalVotes = activePoll.opciones.reduce((acc, o) => acc + o.votes.length, 0);
                                                const hasMyVote = opt.votes.includes(currentUser?.id);
                                                const percent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;

                                                return (
                                                    <button 
                                                        key={opt.id}
                                                        onClick={() => handleVote(activePoll.id, opt.id)}
                                                        className={`w-full group relative h-14 rounded-xl overflow-hidden transition-all ${hasMyVote ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
                                                    >
                                                        <div className="absolute inset-0 bg-blue-500/10 transition-all" style={{ width: `${percent}%` }} />
                                                        <div className="relative px-4 h-full flex items-center justify-between">
                                                            <span className={`text-xs font-bold ${hasMyVote ? 'text-white' : 'text-zinc-400'}`}>{opt.text}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black text-zinc-500">{percent}%</span>
                                                                <div className="flex -space-x-1">
                                                                    {opt.votes.slice(0,3).map(id => <div key={id} className="w-4 h-4 rounded-full border border-black bg-zinc-800" />)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {isCreator && (
                                        <button 
                                            onClick={() => handleStopPoll(activePoll.id)}
                                            className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                                        >
                                            Detener Votación y Guardar
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-30 space-y-4">
                                    <BarChart3 size={40} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Esperando encuestas del host...</p>
                                </div>
                            )}

                            {/* Historial de Encuestas Terminadas */}
                            {!showPollCreator && polls.filter(p => !p.activa).length > 0 && (
                                <div className="mt-12 space-y-6">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-px flex-1 bg-white/5" />
                                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Resumen de Decisiones</span>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>
                                    <div className="space-y-4">
                                        {polls.filter(p => !p.activa).map(p => (
                                            <div key={p.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-[11px] font-bold text-zinc-400 mb-3">{p.pregunta}</p>
                                                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                                                    {p.opciones.map((opt, i) => {
                                                        const total = p.opciones.reduce((acc, o) => acc + o.votes.length, 0);
                                                        const pct = total > 0 ? (opt.votes.length / total) * 100 : 0;
                                                        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-red-500', 'bg-amber-500'];
                                                        return <div key={opt.id} style={{ width: `${pct}%` }} className={`${colors[i % colors.length]}`} />
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
