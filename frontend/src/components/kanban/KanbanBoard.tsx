import { useEffect, useState, useRef, useCallback } from 'react';
import { monitorForElements, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { TicketCard } from './TicketCard';
import { getMidRank } from './rankUtils';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabase';
import type { Ticket, TicketStatus } from '../agile/types';
import { LayoutGrid, Loader2 } from 'lucide-react';

const COLUMNAS: TicketStatus[] = ['Pendiente', 'En Progreso', 'Completado'];

const KanbanColumn = ({ 
    status, 
    tickets
}: { 
    status: TicketStatus, 
    tickets: Ticket[]
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        return dropTargetForElements({
            element: el,
            getData: () => ({ status }),
        });
    }, [status]);

    return (
        <div ref={ref} className="flex-1 min-w-[320px] bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'En Progreso' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                    {status}
                </h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
                    {tickets.length}
                </span>
            </div>

            <div className="space-y-3 min-h-[500px]">
                {tickets.map((ticket, index) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} />
                ))}
                
                {tickets.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-700">
                        <LayoutGrid size={24} />
                    </div>
                )}
            </div>
        </div>
    );
};

export const KanbanBoard = ({ projectId }: { projectId: string }) => {
    const { tenantId } = useProject();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5032';

    const fetchTickets = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${API_BASE}/api/Kanban/tickets/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                    'X-Tenant-Id': tenantId || ''
                }
            });
            if (!response.ok) throw new Error();
            const data = await response.json();
            setTickets(data);
        } catch (err) {
            console.error("Error al cargar tickets", err);
        } finally {
            setLoading(false);
        }
    }, [projectId, tenantId, API_BASE]);

    useEffect(() => {
        fetchTickets();

        return monitorForElements({
            onDrop({ source, location }) {
                const destination = location.current.dropTargets[0];
                if (!destination) return;

                const ticketId = source.data.id as string;
                const statusDestino = destination.data.status as TicketStatus;
                
                actualizarPosicionPersistence(ticketId, statusDestino, 999);
            },
        });
    }, [fetchTickets]);

    const actualizarPosicionPersistence = async (ticketId: string, nuevoEstado: TicketStatus, indexDestino: number) => {
        const backupTickets = [...tickets];
        let ticketToUpdate: Ticket | undefined;

        // 1. Optimistic Update
        setTickets(prev => {
            const filtered = prev.filter(t => t.id !== ticketId);
            const moveTicket = prev.find(t => t.id === ticketId);
            if (!moveTicket) return prev;
            ticketToUpdate = moveTicket;

            const ticketsEnColumna = filtered
                .filter(t => t.estado === nuevoEstado)
                .sort((a, b) => a.rangoLexicografico.localeCompare(b.rangoLexicografico));

            const prevTicket = ticketsEnColumna[indexDestino - 1] || ticketsEnColumna[ticketsEnColumna.length - 1] || null;
            const nextTicket = ticketsEnColumna[indexDestino] || null;
            
            const nuevoRango = getMidRank(
                prevTicket?.rangoLexicografico || null,
                nextTicket?.rangoLexicografico || null
            );

            const updatedTicket = { ...moveTicket, estado: nuevoEstado, rangoLexicografico: nuevoRango };
            return [...filtered, updatedTicket].sort((a, b) => a.rangoLexicografico.localeCompare(b.rangoLexicografico));
        });

        // 2. Persistence
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const ticketsEnColumna = backupTickets
                .filter(t => t.estado === nuevoEstado)
                .sort((a, b) => a.rangoLexicografico.localeCompare(b.rangoLexicografico));
                
            const prevTicket = ticketsEnColumna[indexDestino - 1] || ticketsEnColumna[ticketsEnColumna.length - 1] || null;
            const nextTicket = ticketsEnColumna[indexDestino] || null;
            const nuevoRango = getMidRank(prevTicket?.rangoLexicografico || null, nextTicket?.rangoLexicografico || null);

            const response = await fetch(`${API_BASE}/api/Kanban/tickets/${ticketId}/move`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                    'X-Tenant-Id': tenantId || ''
                },
                body: JSON.stringify({ Estado: nuevoEstado, Rango: nuevoRango })
            });

            if (!response.ok) throw new Error();
        } catch (err) {
            alert("⚠️ Se nos lavó el mate. No pudimos guardar el movimiento en el servidor.");
            setTickets(backupTickets); // Rollback
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-emerald-500" />
        </div>
    );

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 select-none">
            {COLUMNAS.map(col => (
                <KanbanColumn 
                    key={col} 
                    status={col} 
                    tickets={tickets.filter(t => t.estado === col)}
                />
            ))}
        </div>
    );
};
