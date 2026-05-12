import React, { useState, useEffect } from 'react';
import { X, Save, FileJson, List, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { type Ticket } from '../agile/types';
import Swal from 'sweetalert2';

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: Partial<Ticket>) => void;
  ticket?: Ticket; // Si viene, es modo edición
  proyectoId: string;
}

export const TicketFormModal: React.FC<TicketFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  ticket,
  proyectoId
}) => {
  const [mode, setMode] = useState<'manual' | 'json'>('manual');
  const [formData, setFormData] = useState<Partial<Ticket>>({
    titulo: '',
    tipo: 'Tarea',
    prioridad: 'MVP',
    epicTag: '',
    estado: 'Backlog',
    criteriosJson: [],
    tareasJson: []
  });

  const [jsonInput, setJsonInput] = useState('');
  const [tempCriterion, setTempCriterion] = useState('');
  const [tempTask, setTempTask] = useState({ capa: 'Backend', detalle: '' });

  useEffect(() => {
    if (ticket) {
      setFormData({
        ...ticket,
        criteriosJson: Array.isArray(ticket.criteriosJson) ? ticket.criteriosJson : [],
        tareasJson: Array.isArray(ticket.tareasJson) ? ticket.tareasJson : []
      });
      setMode('manual');
    } else {
      setFormData({
        titulo: '',
        tipo: 'Tarea',
        prioridad: 'MVP',
        epicTag: '',
        estado: 'Backlog',
        criteriosJson: [],
        tareasJson: []
      });
    }
  }, [ticket, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (mode === 'manual') {
      if (!formData.titulo) {
        Swal.fire('Error', 'El título es obligatorio', 'error');
        return;
      }
      onSave({ ...formData, proyectoId });
    } else {
      try {
        const parsed = JSON.parse(jsonInput);
        // Normalización para que acepte formatos de la IA
        const normalized: Partial<Ticket> = {
          proyectoId,
          titulo: parsed.titulo_tecnico || parsed.titulo || 'Ticket Importado',
          tipo: parsed.tipo || 'Tarea',
          prioridad: parsed.prioridad_release || parsed.prioridad || 'MVP',
          epicTag: parsed.epic_tag || parsed.epic || '',
          estado: 'Backlog',
          criteriosJson: parsed.criterios_aceptacion || parsed.criterios || [],
          tareasJson: parsed.tareas_tecnicas || parsed.tareas || []
        };
        onSave(normalized);
      } catch (e) {
        Swal.fire('Error', 'JSON inválido', 'error');
      }
    }
  };

  const addCriterion = () => {
    if (!tempCriterion.trim()) return;
    setFormData(prev => ({
      ...prev,
      criteriosJson: [...(prev.criteriosJson || []), tempCriterion]
    }));
    setTempCriterion('');
  };

  const addTask = () => {
    if (!tempTask.detalle.trim()) return;
    setFormData(prev => ({
      ...prev,
      tareasJson: [...(prev.tareasJson || []), { ...tempTask }]
    }));
    setTempTask({ ...tempTask, detalle: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-[#0D0F16] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              {mode === 'manual' ? <List className="text-emerald-400" size={24} /> : <FileJson className="text-blue-400" size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                {ticket ? 'Editar Ticket' : 'Nuevo Ticket'}
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                {ticket ? `ID: ${ticket.id.substring(0,8)}` : 'Gestión de Backlog • Fase 03'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs Mode */}
        {!ticket && (
          <div className="flex p-2 bg-black/40 border-b border-white/5">
            <button 
              onClick={() => setMode('manual')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'manual' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Formulario Manual
            </button>
            <button 
              onClick={() => setMode('json')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'json' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Importar JSON
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {mode === 'manual' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Título de la Tarea</label>
                  <input 
                    type="text" 
                    value={formData.titulo}
                    onChange={e => setFormData(prev => ({...prev, titulo: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-zinc-100 focus:border-emerald-500/50 outline-none transition-all"
                    placeholder="Ej: Implementar Auth en el Backend"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Tipo</label>
                  <select 
                    value={formData.tipo}
                    onChange={e => setFormData(prev => ({...prev, tipo: e.target.value as any}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-[11px] text-zinc-300 outline-none"
                  >
                    <option value="Tarea">Tarea</option>
                    <option value="Bug">Bug</option>
                    <option value="DeudaTécnica">Deuda Técnica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Prioridad</label>
                  <select 
                    value={formData.prioridad}
                    onChange={e => setFormData(prev => ({...prev, prioridad: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-[11px] text-zinc-300 outline-none"
                  >
                    <option value="MVP">MVP (Crítico)</option>
                    <option value="Mejora">Mejora</option>
                    <option value="Escala">Escala</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Módulo / Épica</label>
                  <input 
                    type="text" 
                    value={formData.epicTag}
                    onChange={e => setFormData(prev => ({...prev, epicTag: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-[11px] text-zinc-300 outline-none"
                    placeholder="Ej: Core / Auth"
                  />
                </div>
              </div>

              {/* Criterios de Aceptación */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Criterios de Aceptación</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tempCriterion}
                    onChange={e => setTempCriterion(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addCriterion()}
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-[11px] text-zinc-300"
                    placeholder="Añadir criterio..."
                  />
                  <button onClick={addCriterion} className="p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors text-emerald-400">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.criteriosJson?.map((c: string, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-3 rounded-xl group">
                      <span className="text-[11px] text-zinc-400">• {c}</span>
                      <button 
                        onClick={() => setFormData(prev => ({...prev, criteriosJson: prev.criteriosJson.filter((_: any, idx: number) => idx !== i)}))}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tareas Técnicas */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Plan de Acción (Tareas Técnicas)</label>
                <div className="flex gap-2">
                  <select 
                    value={tempTask.capa}
                    onChange={e => setTempTask(prev => ({...prev, capa: e.target.value}))}
                    className="bg-zinc-800 border-none rounded-xl text-[10px] px-2"
                  >
                    <option value="Frontend">FE</option>
                    <option value="Backend">BE</option>
                    <option value="DB">DB</option>
                    <option value="Infra">Infra</option>
                  </select>
                  <input 
                    type="text" 
                    value={tempTask.detalle}
                    onChange={e => setTempTask(prev => ({...prev, detalle: e.target.value}))}
                    onKeyPress={e => e.key === 'Enter' && addTask()}
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-[11px] text-zinc-300"
                    placeholder="Acción técnica específica..."
                  />
                  <button onClick={addTask} className="p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors text-blue-400">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.tareasJson?.map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-3 rounded-xl group">
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded uppercase">{t.capa}</span>
                        <span className="text-[11px] text-zinc-400">{t.detalle}</span>
                      </div>
                      <button 
                        onClick={() => setFormData(prev => ({...prev, tareasJson: prev.tareasJson.filter((_: any, idx: number) => idx !== i)}))}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl mb-4">
                <AlertCircle className="text-blue-400 shrink-0" size={18} />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Pega aquí el objeto JSON individual que generó la IA. El sistema reconocerá automáticamente los campos <span className="text-blue-300">titulo_tecnico</span>, <span className="text-blue-300">criterios_aceptacion</span> y <span className="text-blue-300">tareas_tecnicas</span>.
                </p>
              </div>
              <textarea 
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                className="w-full h-80 bg-black/40 border border-white/10 rounded-2xl p-6 text-zinc-300 font-mono text-sm focus:border-blue-500/50 outline-none transition-all"
                placeholder='{
  "titulo_tecnico": "Backend: Endpoint de Login",
  "prioridad_release": "MVP",
  "epic_tag": "Auth",
  "criterios_aceptacion": ["..."],
  "tareas_tecnicas": [{"capa": "BE", "detalle": "..."}]
}'
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 flex justify-end gap-4 bg-white/[0.01]">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className={`flex items-center gap-3 px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/10 ${mode === 'manual' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            <Save size={16} />
            {ticket ? 'Guardar Cambios' : 'Crear Ticket'}
          </button>
        </div>

      </div>
    </div>
  );
};
