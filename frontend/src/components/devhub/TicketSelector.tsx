import React, { useState, useEffect } from 'react';
import { api as apiClient } from '../../lib/apiClient';

interface Ticket {
    id: string;
    titulo: string;
    estado: string;
    tipo: string;
}

interface TicketSelectorProps {
    proyectoId: string;
    onSelect: (ticketId: string, ticketTitulo: string) => void;
    onCancel: () => void;
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({ proyectoId, onSelect, onCancel }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get(`/api/kanban/tickets/${proyectoId}`)
            .then(res => {
                setTickets((res as Ticket[]) || []);
            })
            .catch(e => console.error("Error loading tickets", e))
            .finally(() => setLoading(false));
    }, [proyectoId]);

    const filtered = tickets.filter(t => t.titulo.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex flex-col gap-3 mt-2">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Seleccionar Ticket</span>
                <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
            
            <input 
                type="text" 
                placeholder="Buscar ticket..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
            
            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-700">
                {loading ? (
                    <div className="text-center text-zinc-500 text-xs py-4">Cargando...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-zinc-500 text-xs py-4">No se encontraron tickets</div>
                ) : (
                    filtered.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => onSelect(t.id, t.titulo)}
                            className="w-full text-left p-2 hover:bg-zinc-800 rounded flex items-center justify-between group transition-colors"
                        >
                            <span className="text-sm text-zinc-300 group-hover:text-white truncate pr-2">{t.titulo}</span>
                            <span className="text-[9px] uppercase bg-zinc-800 group-hover:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-500 whitespace-nowrap">{t.estado}</span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};
