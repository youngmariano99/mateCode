import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { X, Send, Users, ShieldAlert, CheckCircle2, MessageSquare } from 'lucide-react';
import { api as apiClient } from '../../lib/apiClient';

interface SynchronousMeetingRoomProps {
    entidadId: string;
    tipo: 'bug' | 'decision';
    onClose: () => void;
    hubConnection: signalR.HubConnection | null;
}

interface ChatMessage {
    user: string;
    text: string;
    time: string;
}

export const SynchronousMeetingRoom: React.FC<SynchronousMeetingRoomProps> = ({ entidadId, tipo, onClose, hubConnection }) => {
    const [entidad, setEntidad] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [votes, setVotes] = useState<{ accept: number, reject: number }>({ accept: 0, reject: 0 });

    useEffect(() => {
        // Cargar datos de la entidad (Bug o Decisión)
        const endpoint = tipo === 'bug' ? `/api/colab/bugs` : `/api/colab/decisions`;
        // Nota: Deberíamos tener un endpoint para traer una sola entidad por ID, 
        // pero por simplicidad asumiremos que podemos filtrar de la lista o que el backend lo soporta.
        apiClient.get(`${endpoint}`).then((res: any) => {
            const found = res.find((item: any) => item.id === entidadId);
            setEntidad(found);
        });

        if (hubConnection) {
            hubConnection.on("ReceiveChatMessage", (user: string, text: string) => {
                setChat(prev => [...prev, { user, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            });

            hubConnection.on("VoteReceived", (voteType: 'accept' | 'reject') => {
                setVotes(prev => ({ ...prev, [voteType]: prev[voteType] + 1 }));
            });
        }

        return () => {
            if (hubConnection) {
                hubConnection.off("ReceiveChatMessage");
                hubConnection.off("VoteReceived");
            }
        };
    }, [entidadId, tipo, hubConnection]);

    const handleSendMessage = () => {
        if (!message.trim() || !hubConnection) return;
        hubConnection.invoke("SendMeetingMessage", message);
        setMessage('');
    };

    const handleVote = (voteType: 'accept' | 'reject') => {
        if (!hubConnection) return;
        hubConnection.invoke("SubmitVote", voteType);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full h-full max-w-7xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden m-4">
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <ShieldAlert className="text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Reunión de Emergencia</h2>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Users size={12} /> Sesión Síncrona Activa
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors">
                        <X size={20} className="text-zinc-400" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Entity Viewer */}
                    <div className="flex-1 p-8 overflow-y-auto border-r border-zinc-800 bg-zinc-950/20">
                        {entidad ? (
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Contexto del Problema</span>
                                    <h3 className="text-3xl font-bold text-white leading-tight">{entidad.titulo}</h3>
                                </div>
                                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                    <p className="text-zinc-400 leading-relaxed">{entidad.descripcion}</p>
                                </div>
                                {entidad.pasosReproduccion && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-zinc-300 uppercase">Pasos para reproducir</h4>
                                        <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-xl text-sm text-red-200 font-mono">
                                            {entidad.pasosReproduccion}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-600">Cargando detalles...</div>
                        )}
                    </div>

                    {/* Right: Live Chat */}
                    <div className="w-96 flex flex-col bg-zinc-950/40">
                        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                            <MessageSquare size={16} className="text-zinc-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Canal de Voz / Texto</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                            {chat.map((msg, i) => (
                                <div key={i} className="flex flex-col gap-1 animate-in slide-in-from-right-2 duration-300">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600 uppercase">
                                        <span>{msg.user}</span>
                                        <span>{msg.time}</span>
                                    </div>
                                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tr-none text-sm text-zinc-300">
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {chat.length === 0 && (
                                <div className="h-full flex items-center justify-center text-zinc-700 text-xs text-center px-8 italic">
                                    La sesión ha comenzado. Utiliza el chat para discutir la solución.
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Escribe un mensaje..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none transition-all"
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-all shadow-lg shadow-emerald-900/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer: Voting Bar */}
                <div className="p-8 border-t border-zinc-800 bg-zinc-950 flex items-center justify-center gap-12">
                    <div className="flex flex-col items-center gap-2">
                        <button 
                            onClick={() => handleVote('reject')}
                            className="group flex items-center gap-3 bg-zinc-900 hover:bg-red-900/20 border border-zinc-800 hover:border-red-500/30 px-8 py-4 rounded-2xl transition-all"
                        >
                            <span className="text-xl font-bold text-zinc-500 group-hover:text-red-400">RECHAZAR</span>
                            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg font-bold text-red-500">
                                {votes.reject}
                            </div>
                        </button>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Voto negativo / Bloqueo</span>
                    </div>

                    <div className="h-12 w-px bg-zinc-800"></div>

                    <div className="flex flex-col items-center gap-2">
                        <button 
                            onClick={() => handleVote('accept')}
                            className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-900/20"
                        >
                            <span className="text-xl font-bold text-white uppercase tracking-tight">APROBAR SOLUCIÓN</span>
                            <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center text-lg font-bold text-white">
                                {votes.accept}
                            </div>
                        </button>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Voto positivo / Merge</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
