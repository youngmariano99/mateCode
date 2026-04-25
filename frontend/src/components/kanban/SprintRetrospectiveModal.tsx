import React, { useState } from 'react';
import type { Ticket, Sprint } from '../agile/types';
import { api as apiClient } from '../../lib/apiClient';
import { X, Trophy, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

interface SprintRetrospectiveModalProps {
  proyectoId: string;
  sprint: Sprint;
  tickets: Ticket[];
  onClose: () => void;
  onSprintClosed: () => void;
}

export const SprintRetrospectiveModal: React.FC<SprintRetrospectiveModalProps> = ({ proyectoId, sprint, tickets, onClose, onSprintClosed }) => {
  const [loading, setLoading] = useState(false);
  
  const completados = tickets.filter(t => t.estado === 'Done' || t.estado === 'Completado');
  const incompletos = tickets.filter(t => t.estado !== 'Done' && t.estado !== 'Completado' && t.estado !== 'Backlog');

  const [triage, setTriage] = useState<Record<string, 'Backlog' | 'Proximo' | 'Descartar'>>({});

  const handleTriageChange = (ticketId: string, action: 'Backlog' | 'Proximo' | 'Descartar') => {
    setTriage(prev => ({ ...prev, [ticketId]: action }));
  };

  const calculateCycleTime = () => {
    if (completados.length === 0) return 0;
    let total = 0;
    completados.forEach(t => {
      if (t.fechaInicioReal && t.fechaFinReal) {
        const start = new Date(t.fechaInicioReal).getTime();
        const end = new Date(t.fechaFinReal).getTime();
        total += (end - start) / (1000 * 60 * 60); // Horas
      }
    });
    return (total / completados.length).toFixed(1);
  };

  const handleCloseSprint = async () => {
    // Validar que todos los incompletos tengan triage
    if (Object.keys(triage).length < incompletos.length) {
      Swal.fire('Atención', 'Debes decidir el destino de TODOS los tickets incompletos.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const ticketsAlBacklog = Object.keys(triage).filter(id => triage[id] === 'Backlog');
      const ticketsDescartados = Object.keys(triage).filter(id => triage[id] === 'Descartar');
      // const ticketsProximo = Object.keys(triage).filter(id => triage[id] === 'Proximo');

      await apiClient.post(`/api/projects/${proyectoId}/sprints/${sprint.id}/close`, {
        ticketsAlBacklog,
        ticketsDescartados
      });
      
      // Manejar ticketsProximo
      // La lógica dictaba que si es próximo, se le quita el sprintId viejo y se asume que el user abrirá un sprint nuevo.
      // O el backend los deja en 'To Do' con sprintId null.
      
      Swal.fire('Sprint Cerrado', '¡Buen trabajo! Tómate un mate.', 'success');
      onSprintClosed();
    } catch (e) {
      Swal.fire('Error', 'No se pudo cerrar el sprint.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-950">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Trophy className="text-emerald-500" />
              Retrospectiva: {sprint.nombre}
            </h2>
            <p className="text-zinc-400 mt-1">Es hora de evaluar el rendimiento y hacer el Triage de tareas sueltas.</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-lg text-center">
              <p className="text-sm text-zinc-400 mb-1">Completados</p>
              <p className="text-3xl font-bold text-emerald-500">{completados.length}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-lg text-center">
              <p className="text-sm text-zinc-400 mb-1">Incompletos</p>
              <p className="text-3xl font-bold text-red-400">{incompletos.length}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-lg text-center">
              <p className="text-sm text-zinc-400 mb-1">Avg Cycle Time</p>
              <p className="text-3xl font-bold text-blue-400">{calculateCycleTime()}h</p>
            </div>
          </div>

          {/* Triage */}
          {incompletos.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Triage de Tickets Incompletos
              </h3>
              <div className="space-y-3">
                {incompletos.map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between bg-zinc-800 border border-zinc-700 p-4 rounded-lg">
                    <div>
                      <p className="font-medium text-zinc-200">{ticket.titulo}</p>
                      <p className="text-xs text-zinc-500 mt-1">Estado actual: {ticket.estado}</p>
                    </div>
                    <div className="flex bg-zinc-950 p-1 rounded-md border border-zinc-800">
                      <button 
                        onClick={() => handleTriageChange(ticket.id, 'Backlog')}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${triage[ticket.id] === 'Backlog' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Al Backlog
                      </button>
                      <button 
                        onClick={() => handleTriageChange(ticket.id, 'Proximo')}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${triage[ticket.id] === 'Proximo' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Próximo Sprint
                      </button>
                      <button 
                        onClick={() => handleTriageChange(ticket.id, 'Descartar')}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${triage[ticket.id] === 'Descartar' ? 'bg-red-500/20 text-red-400' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Descartar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
              <p className="text-lg text-zinc-300">¡Limpieza total! No hay tickets sueltos.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-4">
          <button onClick={onClose} className="px-5 py-2.5 text-zinc-400 hover:text-zinc-200 font-medium transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleCloseSprint}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold rounded-md transition-colors"
          >
            {loading ? 'Cerrando...' : 'Confirmar Cierre de Sprint'}
          </button>
        </div>
      </div>
    </div>
  );
};
