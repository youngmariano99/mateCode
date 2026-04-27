import React, { useState, useEffect } from 'react';
import type { Sprint, Ticket } from '../agile/types';
import { api as apiClient } from '../../lib/apiClient';
import { SprintRetrospectiveModal } from './SprintRetrospectiveModal';
import { Trophy, GripVertical, Eye, Box, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import * as signalR from '@microsoft/signalr';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

interface ActiveSprintBoardProps {
  proyectoId?: string;
  sprint?: Sprint;
  onSprintClosed?: () => void;
}

import { ProjectSelectorRequired } from '../shared/ProjectSelectorRequired';

export const ActiveSprintBoard: React.FC<ActiveSprintBoardProps> = ({ 
  proyectoId: propProyectoId, 
  sprint: propSprint, 
  onSprintClosed 
}) => {
  const activeProjectId = useWorkspaceStore(state => state.activeProjectId);
  const proyectoId = propProyectoId || activeProjectId;

  const [sprint, setSprint] = useState<Sprint | null>(propSprint || null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showRetrospective, setShowRetrospective] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
  const [focusedTickets, setFocusedTickets] = useState<Record<string, {avatarUrl: string, name: string}>>({});
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propSprint && proyectoId) {
      setLoading(true);
      apiClient.get(`/api/projects/${proyectoId}/sprints`)
        .then((res: any) => {
          if (Array.isArray(res)) {
            const active = res.find((s: Sprint) => s.estado === 'Activo');
            setSprint(active || null);
          }
        })
        .catch(err => {
          console.error("Error fetching sprints:", err);
          setSprint(null);
        })
        .finally(() => setLoading(false));
    } else if (propSprint) {
      setSprint(propSprint);
    }
  }, [proyectoId, propSprint]);

  const COLUMNS = ['To Do', 'In Progress', 'Done'];

  const loadTickets = async () => {
    if (!proyectoId || !sprint) return;
    try {
      const res = await apiClient.get(`/api/kanban/tickets/${proyectoId}`);
      const sprintTickets = res.filter((t: Ticket) => t.sprintId === sprint.id);
      setTickets(sprintTickets);
    } catch (e) {
      console.warn("Error loading sprint tickets", e);
    }
  };

  useEffect(() => {
    if (sprint?.id) {
      loadTickets();
    }
  }, [sprint?.id, proyectoId]);

  useEffect(() => {
    if (!proyectoId) return;

    const newConn = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5241/hub/devhub')
        .withAutomaticReconnect()
        .build();

    setConnection(newConn);
    return () => { if (newConn) newConn.stop(); };
  }, [proyectoId]);

  useEffect(() => {
    if (connection && proyectoId) {
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
      if (connection && connection.state === signalR.HubConnectionState.Connected && proyectoId) {
          connection.invoke('SetFocusMode', proyectoId, ticketId, 'https://ui-avatars.com/api/?name=Yo', 'Current User');
      }
  };

  const handleMouseLeaveTicket = (ticketId: string) => {
      if (connection && connection.state === signalR.HubConnectionState.Connected && proyectoId) {
          connection.invoke('ClearFocusMode', proyectoId, ticketId);
      }
  };

  const handleDragStart = (ticket: Ticket) => {
    setDraggedTicket(ticket);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (estado: string) => {
    if (!draggedTicket || !proyectoId) return;
    if (draggedTicket.estado === estado) return;

    const previousState = [...tickets];
    setTickets(prev => prev.map(t => t.id === draggedTicket.id ? { ...t, estado } : t));

    try {
      await apiClient.put(`/api/kanban/tickets/${draggedTicket.id}/move`, {
        estado: estado,
        rango: draggedTicket.rangoLexicografico
      });
    } catch (e) {
      setTickets(previousState);
      Swal.fire('Error', 'No se pudo mover el ticket', 'error');
    } finally {
      setDraggedTicket(null);
    }
  };

  if (!proyectoId) return <ProjectSelectorRequired />;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <Sparkles size={40} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Sincronizando con .NET 8...</p>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-transparent">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mb-6">
          <Trophy size={40} className="text-emerald-500 opacity-20" />
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">No hay Sprint Activo</h3>
        <p className="text-zinc-500 max-w-sm mb-6">Esta sala requiere un sprint en curso para mostrar el tablero de comando.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent text-zinc-100">
      {/* Header del Sprint Activo (Compacto) */}
      <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black font-sans text-emerald-400 uppercase tracking-tighter">{sprint.nombre}</h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded font-black border border-emerald-500/30 uppercase tracking-widest">
              LIVE
            </span>
          </div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
            <Trophy size={12} className="text-emerald-500" /> {sprint.objetivo || 'Fase de Ejecución'}
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowRetrospective(true)}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-emerald-500/20 shadow-lg"
          >
            Finalizar Ciclo
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6 scrollbar-hide">
        <div className="flex gap-6 h-full min-w-max">
          {COLUMNS.map(col => (
            <div
              key={col}
              className="w-80 flex flex-col bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col)}
            >
              <div className="p-5 border-b border-white/5 font-black text-[10px] text-zinc-500 uppercase tracking-[0.2em] flex justify-between items-center">
                <span>{col}</span>
                <span className="bg-white/5 text-[9px] px-2 py-1 rounded-full text-zinc-400 border border-white/5">
                  {tickets.filter(t => t.estado === col).length}
                </span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-4 no-scrollbar">
                {tickets.filter(t => t.estado === col).map(ticket => (
                  <div
                    key={ticket.id}
                    draggable
                    onDragStart={() => handleDragStart(ticket)}
                    onMouseEnter={() => handleMouseEnterTicket(ticket.id)}
                    onMouseLeave={() => handleMouseLeaveTicket(ticket.id)}
                    className="relative bg-zinc-900/40 border border-white/5 p-5 rounded-2xl shadow-xl cursor-grab hover:border-emerald-500/50 hover:bg-zinc-900/60 transition-all group"
                  >
                    {focusedTickets[ticket.id] && (
                        <div className="absolute -top-3 -right-3 flex items-center justify-center z-10">
                            <img src={focusedTickets[ticket.id].avatarUrl} alt={focusedTickets[ticket.id].name} className="w-8 h-8 rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" title={`${focusedTickets[ticket.id].name} está viendo esto`} />
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border ${ticket.tipo === 'Bug' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        ticket.tipo === 'DeudaTécnica' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                        {ticket.tipo || 'Tarea'}
                      </span>
                      <GripVertical size={14} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-200 leading-tight group-hover:text-white transition-colors">{ticket.titulo}</h4>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{ticket.epicTag || 'Core'}</span>
                      {ticket.prioridad === 'MVP' && (
                        <div className="flex items-center gap-1 text-emerald-500">
                          <Sparkles size={10} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">MVP</span>
                        </div>
                      )}
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
          onSprintClosed={() => onSprintClosed?.()}
        />
      )}
    </div>
  );
};
