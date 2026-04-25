import React, { useState, useEffect } from 'react';
import type { Sprint, Ticket } from '../agile/types';
import { api as apiClient } from '../../lib/apiClient';
import { SprintRetrospectiveModal } from './SprintRetrospectiveModal';
import { Trophy, GripVertical, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import * as signalR from '@microsoft/signalr';

interface ActiveSprintBoardProps {
  proyectoId: string;
  sprint: Sprint;
  onSprintClosed: () => void;
}

export const ActiveSprintBoard: React.FC<ActiveSprintBoardProps> = ({ proyectoId, sprint, onSprintClosed }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showRetrospective, setShowRetrospective] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
  const [focusedTickets, setFocusedTickets] = useState<Record<string, {avatarUrl: string, name: string}>>({});
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const COLUMNS = ['To Do', 'In Progress', 'Done'];

  const loadTickets = async () => {
    try {
      // Idealmente fetch por sprintId
      const res = await apiClient.get(`/api/kanban/tickets/${proyectoId}`);
      const sprintTickets = res.filter((t: Ticket) => t.sprintId === sprint.id);
      setTickets(sprintTickets);
    } catch (e) {
      console.warn("Error loading sprint tickets", e);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [sprint.id]);

  useEffect(() => {
    const newConn = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5241/hub/devhub')
        .withAutomaticReconnect()
        .build();

    setConnection(newConn);
  }, []);

  useEffect(() => {
    if (connection) {
        connection.start()
            .then(() => {
                connection.invoke('JoinProjectGroup', proyectoId);
                connection.on('UserFocused', (ticketId: string, userAvatarUrl: string, userName: string) => {
                    setFocusedTickets(prev => ({...prev, [ticketId]: {avatarUrl: userAvatarUrl, name: userName}}));
                });
                connection.on('UserUnfocused', (ticketId: string, connectionId: string) => {
                    setFocusedTickets(prev => {
                        const newF = {...prev};
                        delete newF[ticketId];
                        return newF;
                    });
                });
            })
            .catch(e => console.error('SignalR Connection Error:', e));
    }
    return () => {
        if (connection) connection.stop();
    };
  }, [connection, proyectoId]);

  const handleMouseEnterTicket = (ticketId: string) => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
          // Simulamos el usuario actual
          connection.invoke('SetFocusMode', proyectoId, ticketId, 'https://ui-avatars.com/api/?name=Yo', 'Current User');
      }
  };

  const handleMouseLeaveTicket = (ticketId: string) => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
          connection.invoke('ClearFocusMode', proyectoId, ticketId);
      }
  };

  const handleDragStart = (ticket: Ticket) => {
    setDraggedTicket(ticket);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Permitir el drop
  };

  const handleDrop = async (estado: string) => {
    if (!draggedTicket) return;
    if (draggedTicket.estado === estado) return;

    // Optimistic UI update
    const previousState = [...tickets];
    setTickets(prev => prev.map(t => t.id === draggedTicket.id ? { ...t, estado } : t));

    try {
      // Llamada al backend para mover. Se asume que el backend actualiza la fechaInicioReal y fechaFinReal
      // Esto también se puede hacer explícitamente enviando los timestamps, pero la buena práctica es que lo haga el backend (KanbanService)
      await apiClient.put(`/api/kanban/tickets/${draggedTicket.id}/move`, {
        estado: estado,
        rango: draggedTicket.rangoLexicografico
      });

    } catch (e) {
      console.error("Error moving ticket", e);
      setTickets(previousState);
      Swal.fire('Error', 'No se pudo mover el ticket', 'error');
    } finally {
      setDraggedTicket(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      {/* Header del Sprint Activo */}
      <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-sans text-emerald-400">{sprint.nombre}</h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-medium border border-emerald-500/30">
              SPRINT ACTIVO
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1 flex items-center gap-2">
            <Trophy size={14} /> Objetivo: {sprint.objetivo || 'Sin objetivo definido'}
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowRetrospective(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-5 py-2.5 rounded-md font-medium transition-colors border border-zinc-700"
          >
            Finalizar Sprint
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-w-max">
          {COLUMNS.map(col => (
            <div
              key={col}
              className="w-80 flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col)}
            >
              <div className="p-4 border-b border-zinc-800 font-semibold text-zinc-300 flex justify-between items-center">
                <span>{col}</span>
                <span className="bg-zinc-800 text-xs px-2 py-1 rounded-full text-zinc-500">
                  {tickets.filter(t => t.estado === col).length}
                </span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {tickets.filter(t => t.estado === col).map(ticket => (
                  <div
                    key={ticket.id}
                    draggable
                    onDragStart={() => handleDragStart(ticket)}
                    onMouseEnter={() => handleMouseEnterTicket(ticket.id)}
                    onMouseLeave={() => handleMouseLeaveTicket(ticket.id)}
                    className="relative bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-sm cursor-grab hover:border-zinc-500 transition-colors"
                  >
                    {focusedTickets[ticket.id] && (
                        <div className="absolute -top-3 -right-3 flex items-center justify-center">
                            <img src={focusedTickets[ticket.id].avatarUrl} alt={focusedTickets[ticket.id].name} className="w-8 h-8 rounded-full border-2 border-emerald-500 shadow-lg" title={`${focusedTickets[ticket.id].name} está viendo esto`} />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-800 rounded-full"></span>
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${ticket.tipo === 'Bug' ? 'bg-red-500/20 text-red-400' :
                        ticket.tipo === 'DeudaTécnica' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                        {ticket.tipo || 'Tarea'}
                      </span>
                      <GripVertical size={16} className="text-zinc-600" />
                    </div>
                    <h4 className="text-sm font-medium text-zinc-200 leading-snug">{ticket.titulo}</h4>

                    <div className="mt-3 flex justify-between items-center text-xs text-zinc-500">
                      <span>{ticket.epicTag || 'Tech'}</span>
                      {ticket.prioridad === 'MVP' && <span className="text-emerald-500 font-medium">MVP</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRetrospective && (
        <SprintRetrospectiveModal
          proyectoId={proyectoId}
          sprint={sprint}
          tickets={tickets}
          onClose={() => setShowRetrospective(false)}
          onSprintClosed={onSprintClosed}
        />
      )}
    </div>
  );
};
