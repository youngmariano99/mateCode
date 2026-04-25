import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient';
import { TicketSelector } from './TicketSelector';
import { Link2 } from 'lucide-react';

interface Decision {
    id: string;
    titulo: string;
    descripcion: string;
    estado: string;
    fechaCreacion: string;
    elementosRelacionados?: { tipo: string, id: string, nombre: string }[];
}

interface OracleResult {
    tipo: string;
    id: string;
    titulo: string;
    extracto: string;
    score: number;
}

export const DecisionBoard: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [decisiones, setDecisiones] = useState<Decision[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [oracleResults, setOracleResults] = useState<OracleResult[]>([]);
    const [selectingForDecision, setSelectingForDecision] = useState<string | null>(null);
    const [selectingForNew, setSelectingForNew] = useState(false);
    const [selectedNewTicket, setSelectedNewTicket] = useState<{id: string, titulo: string} | null>(null);

    useEffect(() => {
        loadDecisiones();
    }, [projectId]);

    const loadDecisiones = async () => {
        try {
            const res = (await apiClient.get(`/api/colab/decisions/${projectId}`)) as Decision[];
            setDecisiones(res || []);
        } catch (e) {
            console.error(e);
        }
    };

    // Debounce manual simple
    useEffect(() => {
        const timer = setTimeout(() => {
            if (newTitle.length > 3) {
                apiClient.get(`/api/oracle/search?query=${newTitle}`).then(res => {
                    setOracleResults((res as OracleResult[]) || []);
                });
            } else {
                setOracleResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [newTitle]);

    const handleCreate = async () => {
        if (!newTitle) return;
        const res = await apiClient.post('/api/colab/decisions', {
            proyectoId: projectId,
            titulo: newTitle,
            descripcion: newDesc,
            etiquetas: []
        }) as any;

        if (selectedNewTicket && res && res.id) {
            await apiClient.put(`/api/colab/decisions/${res.id}/associate`, { 
                tipo: 'Ticket', 
                elementoId: selectedNewTicket.id,
                nombre: selectedNewTicket.titulo
            });
        }

        setNewTitle('');
        setNewDesc('');
        setOracleResults([]);
        setSelectedNewTicket(null);
        loadDecisiones();
    };

    const handleVote = async (id: string, isUpvote: boolean) => {
        await apiClient.post(`/api/colab/decisions/${id}/vote`, { esUpvote: isUpvote });
        loadDecisiones(); // Reload to see the new votes (if backend supported returning votes, here we just reload)
    };

    const handleAssociateTicket = async (decisionId: string, ticketId: string, ticketTitulo: string) => {
        await apiClient.put(`/api/colab/decisions/${decisionId}/associate`, { 
            tipo: 'Ticket', 
            elementoId: ticketId,
            nombre: ticketTitulo
        });
        setSelectingForDecision(null);
        loadDecisiones();
    };

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Proponer Decisión</h3>
                <div className="relative">
                    <input 
                        type="text" 
                        value={newTitle} 
                        onChange={e => setNewTitle(e.target.value)} 
                        placeholder="Título de la decisión..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    />
                    {oracleResults.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded shadow-xl z-10 p-2">
                            <p className="text-xs text-emerald-400 mb-2 font-bold flex items-center gap-1">🔮 El Oráculo sugiere evitar duplicados:</p>
                            {oracleResults.map(r => (
                                <div key={r.id} className="text-sm p-2 hover:bg-zinc-700 rounded cursor-pointer">
                                    <span className="bg-zinc-600 px-1 rounded text-xs mr-2">{r.tipo}</span>
                                    {r.titulo} <span className="text-zinc-400 text-xs">(Score: {r.score.toFixed(2)})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <textarea 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Contexto y justificación..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white h-24"
                />
                <div className="relative">
                    {selectedNewTicket ? (
                        <div className="flex items-center justify-between bg-zinc-950 border border-emerald-500/30 p-2 rounded text-xs text-emerald-400 mb-2">
                            <span className="truncate pr-2"><Link2 size={12} className="inline mr-1"/> Vinculado a: {selectedNewTicket.titulo}</span>
                            <button onClick={() => setSelectedNewTicket(null)} className="text-zinc-500 hover:text-red-400">✕</button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setSelectingForNew(!selectingForNew)}
                            className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors mb-4"
                        >
                            <Link2 size={14} /> Vincular a Ticket Existente
                        </button>
                    )}
                    
                    {selectingForNew && (
                        <div className="absolute left-0 bottom-full mb-2 z-10">
                            <TicketSelector 
                                proyectoId={projectId as string} 
                                onSelect={(id, titulo) => { setSelectedNewTicket({id, titulo}); setSelectingForNew(false); }} 
                                onCancel={() => setSelectingForNew(false)} 
                            />
                        </div>
                    )}
                </div>

                <button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition-colors">
                    Proponer
                </button>
            </div>

            <div className="space-y-4 mt-8">
                {decisiones.map(d => (
                    <div key={d.id} className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 flex justify-between items-start hover:border-zinc-700 transition-colors">
                        <div className="pr-4 flex-1">
                            <h4 className="text-sm font-bold text-emerald-400 leading-tight">{d.titulo}</h4>
                            <p className="text-xs text-zinc-400 mt-2 line-clamp-3">{d.descripcion}</p>
                            
                            {/* Tags y Estado */}
                            <div className="mt-3 flex gap-2 items-center">
                                <span className="bg-zinc-800/80 border border-zinc-700 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded text-zinc-400">{d.estado}</span>
                            </div>

                            {/* Elementos Relacionados */}
                            {d.elementosRelacionados && d.elementosRelacionados.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-zinc-800/50">
                                    <div className="text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Vinculaciones:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {d.elementosRelacionados.map(rel => (
                                            <div key={rel.id} className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-[10px] text-zinc-400">
                                                <Link2 size={10} className="text-emerald-500" />
                                                <span className="opacity-50">{rel.tipo}:</span> {rel.nombre}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Botón de Asociar */}
                            <div className="mt-4 relative">
                                <button 
                                    onClick={() => setSelectingForDecision(selectingForDecision === d.id ? null : d.id)}
                                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
                                >
                                    <Link2 size={12} /> Vincular a Ticket
                                </button>
                                {selectingForDecision === d.id && (
                                    <div className="absolute left-0 mt-2 z-10">
                                        <TicketSelector 
                                            proyectoId={projectId as string} 
                                            onSelect={(ticketId, ticketTitulo) => handleAssociateTicket(d.id, ticketId, ticketTitulo)} 
                                            onCancel={() => setSelectingForDecision(null)} 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-zinc-950/50 rounded-xl p-2 border border-zinc-800/50 shrink-0">
                            <button onClick={() => handleVote(d.id, true)} className="p-1 hover:text-emerald-400 transition-colors">▲</button>
                            <span className="font-bold text-sm">?</span>
                            <button onClick={() => handleVote(d.id, false)} className="p-1 hover:text-red-400 transition-colors">▼</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
