import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient';
import { TicketSelector } from './TicketSelector';
import { Link2 } from 'lucide-react';

interface Bug {
    id: string;
    titulo: string;
    descripcion: string;
    estado: string;
    fechaCreacion: string;
}

export const BugTracker: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [bugs, setBugs] = useState<Bug[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newSteps, setNewSteps] = useState('');
    const [selectingForBug, setSelectingForBug] = useState<string | null>(null);
    const [selectingForNew, setSelectingForNew] = useState(false);
    const [selectedNewTicket, setSelectedNewTicket] = useState<{id: string, titulo: string} | null>(null);

    useEffect(() => {
        loadBugs();
    }, [projectId]);

    const loadBugs = async () => {
        try {
            const res = (await apiClient.get(`/api/colab/bugs/${projectId}`)) as Bug[];
            setBugs(res || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleReportBug = async () => {
        if (!newTitle || !newDesc) return;
        const res = await apiClient.post(`/api/colab/bugs`, { 
            proyectoId: projectId, 
            titulo: newTitle, 
            descripcion: newDesc, 
            pasosReproduccion: newSteps 
        }) as any; // Usar any temporalmente para extraer el ID
        
        // Si se seleccionó un ticket al crearlo, asociarlo inmediatamente
        if (selectedNewTicket && res && res.id) {
            await apiClient.put(`/api/colab/bugs/${res.id}/associate`, { ticketId: selectedNewTicket.id });
        }

        setNewTitle('');
        setNewDesc('');
        setNewSteps('');
        setSelectedNewTicket(null);
        loadBugs();
    };

    const handleConvertToTicket = async (bugId: string) => {
        // En un caso real, abrimos un modal para elegir el sprintId. Aquí lo enviamos al Backlog (null).
        await apiClient.post(`/api/colab/bugs/${bugId}/convert`, { sprintId: null });
        alert('Bug convertido en Ticket exitosamente y enviado al Backlog.');
        loadBugs();
    };

    const handleAssociateTicket = async (bugId: string, ticketId: string) => {
        await apiClient.put(`/api/colab/bugs/${bugId}/associate`, { ticketId });
        setSelectingForBug(null);
        loadBugs();
    };

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Reportar Incidencia</h3>
                <input 
                    type="text" 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    placeholder="Título breve del Bug..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                />
                <textarea 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Descripción detallada..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white h-24"
                />
                <textarea 
                    value={newSteps}
                    onChange={e => setNewSteps(e.target.value)}
                    placeholder="Pasos para reproducir..."
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

                <button 
                    onClick={handleReportBug} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
                    Reportar Bug
                </button>
            </div>

            <div className="space-y-4 mt-8">
                {bugs.map(b => (
                    <div key={b.id} className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 flex flex-col gap-4 hover:border-zinc-700 transition-colors">
                        <div>
                            <h4 className="text-sm font-bold text-red-400 leading-tight flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                {b.titulo}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{b.descripcion}</p>
                            <div className="mt-3">
                                <span className="bg-zinc-800/80 border border-zinc-700 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded text-zinc-400 mr-2">{b.estado}</span>
                            </div>
                        </div>
                        {b.estado === 'Abierto' && (
                            <div className="flex flex-col gap-2 relative">
                                <button 
                                    onClick={() => handleConvertToTicket(b.id)} 
                                    className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl transition-colors"
                                >
                                    Convertir a Ticket
                                </button>
                                <button 
                                    onClick={() => setSelectingForBug(selectingForBug === b.id ? null : b.id)} 
                                    className="w-full flex justify-center items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl transition-colors"
                                >
                                    <Link2 size={12} /> Asociar Existente
                                </button>
                                {selectingForBug === b.id && (
                                    <TicketSelector 
                                        proyectoId={projectId as string} 
                                        onSelect={(ticketId) => handleAssociateTicket(b.id, ticketId)} 
                                        onCancel={() => setSelectingForBug(null)} 
                                    />
                                )}
                            </div>
                        )}
                        {b.estado === 'Asociado' && (
                            <div className="mt-2 text-[10px] text-zinc-500 font-mono bg-zinc-950/50 p-2 rounded border border-zinc-800/50 flex items-center gap-2">
                                <Link2 size={12} className="text-emerald-500" />
                                Vinculado a Ticket Externo
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
