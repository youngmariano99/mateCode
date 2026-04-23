import { useEffect, useState, useRef, useCallback } from 'react';
import { monitorForElements, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { TicketCard } from './TicketCard';
import { getMidRank } from './rankUtils';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import type { Ticket } from '../agile/types';
import { LayoutGrid, Loader2, Plus } from 'lucide-react';
import Swal from 'sweetalert2';

interface KanbanColumna {
    id: string;
    nombre: string;
    ordenPosicion: number;
}

const KanbanColumn = ({ 
    columna, 
    tickets
}: { 
    columna: KanbanColumna, 
    tickets: Ticket[]
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        return dropTargetForElements({
            element: el,
            getData: () => ({ status: columna.nombre }),
        });
    }, [columna]);

    return (
        <div ref={ref} className="flex-1 min-w-[320px] bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${columna.nombre === 'En Progreso' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                    {columna.nombre}
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
    const [columnas, setColumnas] = useState<KanbanColumna[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBoardData = useCallback(async () => {
        try {
            setLoading(true);
            const [tData, cData] = await Promise.all([
                api.get(`/Kanban/tickets/${projectId}`),
                api.get(`/Kanban/columns/${projectId}`)
            ]);

            setTickets(tData);
            setColumnas(cData);
        } catch (err) {
            console.error("Error al cargar tablero", err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchBoardData();

        return monitorForElements({
            onDrop({ source, location }) {
                const destination = location.current.dropTargets[0];
                if (!destination) return;

                const ticketId = source.data.id as string;
                const statusDestino = destination.data.status as string;
                
                actualizarPosicionPersistence(ticketId, statusDestino, 999);
            },
        });
    }, [fetchBoardData]);

    const handleAddColumn = async () => {
        const { value: name } = await Swal.fire({
            title: 'Nueva Columna',
            input: 'text',
            inputLabel: 'Nombre de la columna',
            inputPlaceholder: 'Ej: QA, Testing, Review...',
            showCancelButton: true,
            background: '#18181b',
            color: '#f4f4f5',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: 'Añadir',
            cancelButtonText: 'Cancelar'
        });

        if (name) {
            try {
                await api.post('/Kanban/columns', { ProyectoId: projectId, Nombre: name });
                await fetchBoardData();
            } catch (err) {
                console.error("Error adding column", err);
            }
        }
    };

    const actualizarPosicionPersistence = async (ticketId: string, nuevoEstado: string, indexDestino: number) => {
        const backupTickets = [...tickets];
        
        // 1. Optimistic Update
        setTickets(prev => {
            const filtered = prev.filter(t => t.id !== ticketId);
            const moveTicket = prev.find(t => t.id === ticketId);
            if (!moveTicket) return prev;

            const ticketsEnColumna = filtered
                .filter(t => t.estado === nuevoEstado)
                .sort((a, b) => a.rangoLexicografico.localeCompare(b.rangoLexicografico));

            const prevTicket = ticketsEnColumna[indexDestino - 1] || ticketsEnColumna[ticketsEnColumna.length - 1] || null;
            const nextTicket = ticketsEnColumna[indexDestino] || null;
            
            const nuevoRango = getMidRank(
                prevTicket?.rangoLexicografico || null,
                nextTicket?.rangoLexicografico || null
            );

            const updatedTicket = { ...moveTicket, estado: nuevoEstado, rangoLexicografico: nuevoRango } as Ticket;
            return [...filtered, updatedTicket].sort((a, b) => a.rangoLexicografico.localeCompare(b.rangoLexicografico));
        });

        // 2. Persistence
        try {
            const ticketsEnColumna = backupTickets
                .filter(t => t.estado === nuevoEstado)
                .sort((a, b) => a.rangoLexicografico.localeCompare(b.rangoLexicografico));
                
            const prevTicket = ticketsEnColumna[indexDestino - 1] || ticketsEnColumna[ticketsEnColumna.length - 1] || null;
            const nextTicket = ticketsEnColumna[indexDestino] || null;
            const nuevoRango = getMidRank(prevTicket?.rangoLexicografico || null, nextTicket?.rangoLexicografico || null);

            await api.put(`/Kanban/tickets/${ticketId}/move`, { Estado: nuevoEstado, Rango: nuevoRango });
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'No pudimos guardar el movimiento en el servidor.',
                icon: 'error',
                background: '#18181b',
                color: '#f4f4f5'
            });
            setTickets(backupTickets); // Rollback
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-emerald-500" />
        </div>
    );

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 select-none items-start">
            {columnas.map(col => (
                <KanbanColumn 
                    key={col.id} 
                    columna={col} 
                    tickets={tickets.filter(t => t.estado === col.nombre)}
                />
            ))}

            {columnas.length === 0 && (
                 <div className="flex-1 py-20 text-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                    No hay columnas configuradas para este proyecto.
                 </div>
            )}

            <button 
                onClick={handleAddColumn}
                className="min-w-[200px] h-12 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-zinc-500 hover:border-emerald-500 hover:text-emerald-500 transition-all group shrink-0"
            >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Añadir Columna</span>
            </button>
        </div>
    );
};
