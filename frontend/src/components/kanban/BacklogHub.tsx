import React, { useState, useEffect } from 'react';
import type { Ticket, Sprint } from '../agile/types';
import { api as apiClient } from '../../lib/apiClient';
import { Play, BrainCircuit, Download, CheckSquare, Square, X, FileJson, Search, Filter } from 'lucide-react';
import Swal from 'sweetalert2';

interface BacklogHubProps {
  proyectoId: string;
  onSprintStarted?: (sprint: Sprint) => void;
}

export const BacklogHub: React.FC<BacklogHubProps> = ({ proyectoId, onSprintStarted }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [epicFilter, setEpicFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modales
  const [showImport, setShowImport] = useState(false);
  const [jsonText, setJsonText] = useState('');
  
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [sprintForm, setSprintForm] = useState({ nombre: '', objetivo: '', duracionDias: 14 });

  const loadTickets = async () => {
    try {
      // Idealmente habria un endpoint GET /tickets?proyectoId=... pero si no, filtramos
      const res = await apiClient.get(`/api/kanban/tickets/${proyectoId}`);
      const backlog = res.filter((t: Ticket) => t.estado === 'Backlog');
      // Sort por prioridad si quisieramos
      setTickets(backlog);
    } catch (e) {
      console.warn("Error cargando tickets, mockeando...", e);
      // Fallback si el endpoint GET de tickets todavia no existe en la API general
    }
  };

  useEffect(() => {
    loadTickets();
  }, [proyectoId]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedTickets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTickets(next);
  };

  const handleGenerarPrompt = async () => {
    try {
      Swal.fire({
        title: 'Calentando el agua...',
        text: 'Generando contexto experto para la IA...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      const res = await apiClient.get(`/api/projects/${proyectoId}/sprints/grooming-prompt`);
      await navigator.clipboard.writeText(res.prompt);
      Swal.fire('¡Mate listo!', 'El Prompt de Grooming se copió al portapapeles. Pégalo en tu IA de preferencia.', 'success');
    } catch (e) {
      Swal.fire('Se nos lavó el mate', 'Hubo un error generando el prompt', 'error');
    }
  };

  const handleExportarEstado = async () => {
    try {
      Swal.fire({
        title: 'Exportando...',
        text: 'Obteniendo el estado actual de todos los tickets...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      const res = await apiClient.get(`/api/projects/${proyectoId}/sprints/exportar-estado`);
      await navigator.clipboard.writeText(res.export);
      Swal.fire('¡Exportado!', 'El JSON con el estado actual se copió al portapapeles.', 'success');
    } catch (e) {
      Swal.fire('Error', 'No se pudo exportar el estado de los tickets.', 'error');
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      const payload = JSON.parse(jsonText);
      await apiClient.post(`/api/projects/${proyectoId}/sprints/bulk-import`, payload);
      setShowImport(false);
      setJsonText('');
      Swal.fire('¡Tickets importados!', 'El Backlog fue poblado exitosamente', 'success');
      loadTickets();
    } catch (e) {
      Swal.fire('Error', 'El JSON es inválido o hubo un error en la importación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = async () => {
    if (selectedTickets.size === 0) return;
    try {
      setLoading(true);
      const res = await apiClient.post(`/api/projects/${proyectoId}/sprints/start`, {
        ...sprintForm,
        ticketIds: Array.from(selectedTickets)
      });
      Swal.fire('¡Sprint Iniciado!', '¡A picar código!', 'success');
      setShowSprintModal(false);
      setSelectedTickets(new Set());
      if (onSprintStarted) onSprintStarted(res);
      loadTickets();
    } catch (e) {
      Swal.fire('Error', 'No se pudo iniciar el sprint', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-zinc-100 p-8">
      {/* Action Bar (Refined) */}
      <div className="flex justify-end items-center gap-4 mb-8">
        <div className="flex gap-3">
          <button 
            onClick={handleGenerarPrompt}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-emerald-400 px-5 py-2.5 rounded-xl transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest"
          >
            <BrainCircuit size={16} />
            Generar Prompt
          </button>
          <button 
            onClick={handleExportarEstado}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-amber-400 px-5 py-2.5 rounded-xl transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest"
          >
            <FileJson size={16} />
            Exportar Estado
          </button>
          <button 
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-100 px-5 py-2.5 rounded-xl transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest"
          >
            <Download size={16} />
            Importar
          </button>
          <button 
            onClick={() => setShowSprintModal(true)}
            disabled={selectedTickets.size === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${
              selectedTickets.size > 0 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' 
                : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'
            }`}
          >
            <Play size={16} fill="currentColor" />
            Iniciar Sprint ({selectedTickets.size})
          </button>
        </div>
      </div>

      {/* FILTERS (Spatial style) */}
      {tickets.length > 0 && (
        <div className="flex gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Filtrar por título..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-[11px] text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all uppercase tracking-widest"
            />
          </div>
          <div className="w-56 relative">
            <Filter className="absolute left-4 top-3 text-zinc-500" size={14} />
            <select 
              value={epicFilter}
              onChange={(e) => setEpicFilter(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black text-zinc-400 focus:outline-none focus:border-emerald-500/50 appearance-none uppercase tracking-widest"
            >
              <option value="">Épica: Todas</option>
              {Array.from(new Set(tickets.map(t => t.epicTag).filter(Boolean))).map(epic => (
                <option key={epic} value={epic}>{epic}</option>
              ))}
            </select>
          </div>
          <div className="w-56 relative">
            <Filter className="absolute left-4 top-3 text-zinc-500" size={14} />
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black text-zinc-400 focus:outline-none focus:border-emerald-500/50 appearance-none uppercase tracking-widest"
            >
              <option value="">Prioridad: Cualquiera</option>
              <option value="MVP">MVP</option>
              <option value="Mejora">Mejora</option>
              <option value="Escala">Escala</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {(() => {
          const filteredTickets = tickets.filter(t => {
            const matchesSearch = t.titulo.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesEpic = epicFilter ? t.epicTag === epicFilter : true;
            const matchesPriority = priorityFilter ? t.prioridad === priorityFilter : true;
            return matchesSearch && matchesEpic && matchesPriority;
          });

          if (tickets.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center h-80 text-zinc-500 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                <BrainCircuit size={60} className="mb-6 opacity-20 text-emerald-500 animate-pulse" />
                <p className="text-xl font-black uppercase tracking-[0.2em]">El backlog está en blanco</p>
                <p className="text-[10px] uppercase font-bold text-zinc-600 mt-2">Usa la IA para generar el primer set de historias</p>
              </div>
            );
          }

          if (filteredTickets.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-500 border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                <p className="text-[10px] font-black uppercase tracking-widest">Sin resultados para el filtro actual</p>
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => toggleSelect(ticket.id)}
                  className={`flex items-center p-6 rounded-[2rem] border-2 cursor-pointer transition-all active:scale-[0.98] ${
                    selectedTickets.has(ticket.id) 
                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-900/10' 
                      : 'bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="mr-6">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${selectedTickets.has(ticket.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-transparent'}`}>
                        <CheckSquare size={14} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-tight leading-tight">{ticket.titulo}</h4>
                    <div className="flex gap-3 mt-3">
                      <span className="bg-white/5 border border-white/5 text-zinc-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">
                        {ticket.epicTag || 'Sin Épica'}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                        ticket.prioridad === 'MVP' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-zinc-600'
                      }`}>
                        {ticket.prioridad || 'Prioridad normal'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* MODAL IMPORTAR */}
      {showImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-100">Importar Tickets de IA</h3>
              <button onClick={() => setShowImport(false)} className="text-zinc-400 hover:text-zinc-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <p className="text-sm text-zinc-400 mb-3">Pega el JSON devuelto por la IA para inyectarlo en el Backlog.</p>
              <textarea 
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-zinc-300 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder='{"sprint_recomendado_dias": 14, "tickets": [...]}'
              />
            </div>
            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
              <button onClick={() => setShowImport(false)} className="px-4 py-2 text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors">Cancelar</button>
              <button onClick={handleImport} disabled={loading || !jsonText.trim()} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-medium rounded-md transition-colors disabled:opacity-50">
                {loading ? 'Procesando...' : 'Inyectar al Backlog'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SPRINT */}
      {showSprintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-100">Planificar Sprint</h3>
              <button onClick={() => setShowSprintModal(false)} className="text-zinc-400 hover:text-zinc-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre del Sprint</label>
                <input 
                  type="text" 
                  value={sprintForm.nombre}
                  onChange={e => setSprintForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                  placeholder="Ej: Sprint 1 - MVP Core"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Objetivo del Sprint</label>
                <textarea 
                  value={sprintForm.objetivo}
                  onChange={e => setSprintForm(prev => ({ ...prev, objetivo: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:border-emerald-500 focus:outline-none h-24 resize-none"
                  placeholder="Ej: Tener el carrito funcionando offline"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Duración (Días)</label>
                <input 
                  type="number" 
                  value={sprintForm.duracionDias}
                  onChange={e => setSprintForm(prev => ({ ...prev, duracionDias: Number(e.target.value) }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                  min="1"
                />
              </div>
            </div>
            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
              <button onClick={() => setShowSprintModal(false)} className="px-4 py-2 text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors">Cancelar</button>
              <button onClick={handleStartSprint} disabled={loading || !sprintForm.nombre} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-medium rounded-md transition-colors flex items-center gap-2">
                <Play size={16} fill="currentColor" />
                Iniciar ({selectedTickets.size} Tickets)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
