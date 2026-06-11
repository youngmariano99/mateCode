import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, CheckCircle2, Circle, Save } from 'lucide-react';
import type { PostItem, ChecklistItem } from './ContentKanbanSubTab';
import { motion, AnimatePresence } from 'framer-motion';

interface PostDetailsModalProps {
  isOpen: boolean;
  post: PostItem | null;
  onClose: () => void;
  onSave: (updatedPost: PostItem) => void;
}

const PLATFORMS = ['TikTok', 'Instagram', 'LinkedIn', 'Facebook'];
const FORMATS = ['Reel/TikTok', 'Carrusel', 'Historia', 'Post'];
const STATUSES = ['Idea', 'Guionado', 'Grabado', 'Editado', 'Programado', 'No Publicado'];

const DEFAULT_BATCHING_STEPS: ChecklistItem[] = [
  { id: 'b1', text: '🎬 Set-up armado (trípode, luces, cámara limpia)', checked: false },
  { id: 'b2', text: '📹 Grabé el Post', checked: false },
  { id: 'b3', text: '👕 Cambié de remera o ángulo', checked: false },
  { id: 'b4', text: '✍️ Subtítulos grandes en el centro', checked: false },
  { id: 'b5', text: '✂️ Cortes rápidos cada 3-5 segundos', checked: false },
  { id: 'b6', text: '💾 Archivos finales exportados', checked: false }
];

const DEFAULT_SEO_STEPS: ChecklistItem[] = [
  { id: 's1', text: '📂 Nombre del archivo relevante (ej: video.mp4 ➡️ excel-tickets.mp4)', checked: false },
  { id: 's2', text: '✍️ Palabras clave de forma natural en el texto', checked: false },
  { id: 's3', text: '🏷️ 3 a 5 hashtags muy específicos (B2B)', checked: false },
  { id: 's4', text: '🚫 Video limpio sin marcas de agua de otras redes', checked: false }
];

export const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  isOpen,
  post,
  onClose,
  onSave
}) => {
  const [localPost, setLocalPost] = useState<PostItem | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'checklist'>('details');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepText, setEditingStepText] = useState('');

  useEffect(() => {
    if (post) {
      // Deep copy to avoid mutating original props directly
      setLocalPost(JSON.parse(JSON.stringify(post)));
      setEditingStepId(null);
    }
  }, [post]);

  if (!isOpen || !localPost) return null;

  const handleFieldChange = (field: keyof PostItem, value: any) => {
    setLocalPost(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleLoadDefaults = (type: 'batching' | 'seo') => {
    const key = type === 'batching' ? 'checklistBatching' : 'checklistSeo';
    const defaults = type === 'batching' ? DEFAULT_BATCHING_STEPS : DEFAULT_SEO_STEPS;
    const freshDefaults = defaults.map(d => ({
      ...d,
      id: `${d.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }));
    handleFieldChange(key, freshDefaults);
  };

  const handleClearAll = (type: 'batching' | 'seo') => {
    const key = type === 'batching' ? 'checklistBatching' : 'checklistSeo';
    handleFieldChange(key, []);
  };

  // Checklist Helpers
  const toggleStep = (type: 'batching' | 'seo', id: string) => {
    const key = type === 'batching' ? 'checklistBatching' : 'checklistSeo';
    const list = localPost[key] || [];
    const updated = list.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    handleFieldChange(key, updated);
  };

  const addStep = (type: 'batching' | 'seo') => {
    const key = type === 'batching' ? 'checklistBatching' : 'checklistSeo';
    const list = localPost[key] || [];
    const newStep: ChecklistItem = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: 'Nuevo paso de producción...',
      checked: false
    };
    handleFieldChange(key, [...list, newStep]);
  };

  const deleteStep = (type: 'batching' | 'seo', id: string) => {
    const key = type === 'batching' ? 'checklistBatching' : 'checklistSeo';
    const list = localPost[key] || [];
    const updated = list.filter(item => item.id !== id);
    handleFieldChange(key, updated);
  };

  const startEditStep = (id: string, text: string) => {
    setEditingStepId(id);
    setEditingStepText(text);
  };

  const saveStepEdit = (type: 'batching' | 'seo', id: string) => {
    if (!editingStepText.trim()) return;
    const key = type === 'batching' ? 'checklistBatching' : 'checklistSeo';
    const list = localPost[key] || [];
    const updated = list.map(item => 
      item.id === id ? { ...item, text: editingStepText } : item
    );
    handleFieldChange(key, updated);
    setEditingStepId(null);
  };

  const handleSave = () => {
    if (localPost) {
      onSave(localPost);
    }
  };

  // Calcular progreso general
  const totalSteps = (localPost.checklistBatching?.length || 0) + (localPost.checklistSeo?.length || 0);
  const completedSteps = 
    (localPost.checklistBatching?.filter(s => s.checked).length || 0) + 
    (localPost.checklistSeo?.filter(s => s.checked).length || 0);
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-zinc-950/60 px-6 py-4 border-b border-zinc-850 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-emerald-450 tracking-wider">
                Detalle de Publicación
              </span>
              <span className="text-[10px] font-bold text-zinc-500">•</span>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                ID: {localPost.id}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-1 line-clamp-1">
              {localPost.titulo || 'Sin Título'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progreso rápido */}
        {totalSteps > 0 && (
          <div className="bg-zinc-950/20 px-6 py-2.5 border-b border-zinc-850/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Avance de Producción:</span>
              <span className="text-white">{completedSteps}/{totalSteps} tareas listas</span>
            </div>
            <div className="flex-1 max-w-[200px] bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-emerald-400 shrink-0">{progressPercent}%</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-zinc-950/30 px-6 border-b border-zinc-850/80">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
              activeTab === 'details'
                ? 'border-emerald-500 text-white font-extrabold'
                : 'border-transparent text-zinc-550 hover:text-zinc-350'
            }`}
          >
            Detalles & Guión
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
              activeTab === 'checklist'
                ? 'border-emerald-500 text-white font-extrabold'
                : 'border-transparent text-zinc-550 hover:text-zinc-350'
            }`}
          >
            Checklist de Producción ({totalSteps})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              {/* Titulo */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                  Título de la Publicación
                </label>
                <input
                  type="text"
                  value={localPost.titulo}
                  onChange={e => handleFieldChange('titulo', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 p-2.5 rounded-xl text-xs text-white outline-none"
                  placeholder="Ej: 5 errores fatales de código"
                />
              </div>

              {/* Formato y Plataforma & Estado & Fecha */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Plataforma
                  </label>
                  <select
                    value={localPost.plataforma}
                    onChange={e => handleFieldChange('plataforma', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none"
                  >
                    {PLATFORMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Formato
                  </label>
                  <select
                    value={localPost.formato}
                    onChange={e => handleFieldChange('formato', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none"
                  >
                    {FORMATS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Fase / Estado
                  </label>
                  <select
                    value={localPost.estado}
                    onChange={e => handleFieldChange('estado', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Publicación Planificada
                  </label>
                  <input
                    type="date"
                    value={localPost.fechaPublicacion || ''}
                    onChange={e => handleFieldChange('fechaPublicacion', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Gancho y Tip Visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Fórmula / Gancho Inicial
                  </label>
                  <textarea
                    rows={3}
                    value={localPost.gancho}
                    onChange={e => handleFieldChange('gancho', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none font-mono"
                    placeholder="El gancho principal para retener la atención en los primeros 3 segundos..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Recurso Visual / Tip
                  </label>
                  <textarea
                    rows={3}
                    value={localPost.tipVisual}
                    onChange={e => handleFieldChange('tipVisual', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none"
                    placeholder="Ej: B-Roll mostrando la laptop, zoom rápido, texto resaltado..."
                  />
                </div>
              </div>

              {/* Desarrollo y CTA */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Desarrollo / Guión del Post
                  </label>
                  <textarea
                    rows={6}
                    value={localPost.desarrollo}
                    onChange={e => handleFieldChange('desarrollo', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none font-mono leading-relaxed"
                    placeholder="Escribe el diálogo completo o el desarrollo paso a paso del contenido..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Llamado a la Acción (CTA)
                  </label>
                  <input
                    type="text"
                    value={localPost.cta}
                    onChange={e => handleFieldChange('cta', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none"
                    placeholder="Ej: Comenta 'CODIGO' y te envío la plantilla por DM"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Batching Checklist */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1.5">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Fase de Grabación (Batching Day)
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLoadDefaults('batching')}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-350 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      Cargar por Defecto
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearAll('batching')}
                      className="text-[10px] font-bold text-red-405 hover:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      Limpiar Todo
                    </button>
                    <button
                      type="button"
                      onClick={() => addStep('batching')}
                      className="text-[10px] font-bold text-emerald-450 hover:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      <Plus size={10} />
                      <span>Añadir Paso</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(localPost.checklistBatching || []).length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic">No hay tareas en esta fase.</p>
                  ) : (
                    (localPost.checklistBatching || []).map(step => (
                      <div 
                        key={step.id} 
                        className="flex items-center justify-between gap-3 bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-xl group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleStep('batching', step.id)}
                            className="text-zinc-500 hover:text-white transition-colors shrink-0"
                          >
                            {step.checked ? (
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : (
                              <Circle size={16} className="text-zinc-700 hover:text-zinc-550" />
                            )}
                          </button>
                          
                          {editingStepId === step.id ? (
                            <input
                              type="text"
                              value={editingStepText}
                              onChange={e => setEditingStepText(e.target.value)}
                              onBlur={() => saveStepEdit('batching', step.id)}
                              onKeyDown={e => e.key === 'Enter' && saveStepEdit('batching', step.id)}
                              autoFocus
                              className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-xs text-white outline-none flex-1"
                            />
                          ) : (
                            <span 
                              onClick={() => startEditStep(step.id, step.text)}
                              className={`text-xs select-none cursor-pointer truncate flex-1 hover:text-zinc-200 transition-colors ${
                                step.checked ? 'line-through text-zinc-550' : 'text-zinc-350'
                              }`}
                            >
                              {step.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditStep(step.id, step.text)}
                            className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-850 rounded transition-colors"
                            title="Editar texto"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => deleteStep('batching', step.id)}
                            className="p-1 text-zinc-550 hover:text-red-400 hover:bg-zinc-850 rounded transition-colors"
                            title="Eliminar paso"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SEO Checklist */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1.5">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Fase de Subida & SEO
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLoadDefaults('seo')}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-350 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      Cargar por Defecto
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearAll('seo')}
                      className="text-[10px] font-bold text-red-405 hover:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      Limpiar Todo
                    </button>
                    <button
                      type="button"
                      onClick={() => addStep('seo')}
                      className="text-[10px] font-bold text-emerald-450 hover:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      <Plus size={10} />
                      <span>Añadir Paso</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(localPost.checklistSeo || []).length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic">No hay tareas en esta fase.</p>
                  ) : (
                    (localPost.checklistSeo || []).map(step => (
                      <div 
                        key={step.id} 
                        className="flex items-center justify-between gap-3 bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-xl group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleStep('seo', step.id)}
                            className="text-zinc-500 hover:text-white transition-colors shrink-0"
                          >
                            {step.checked ? (
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : (
                              <Circle size={16} className="text-zinc-700 hover:text-zinc-550" />
                            )}
                          </button>
                          
                          {editingStepId === step.id ? (
                            <input
                              type="text"
                              value={editingStepText}
                              onChange={e => setEditingStepText(e.target.value)}
                              onBlur={() => saveStepEdit('seo', step.id)}
                              onKeyDown={e => e.key === 'Enter' && saveStepEdit('seo', step.id)}
                              autoFocus
                              className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-xs text-white outline-none flex-1"
                            />
                          ) : (
                            <span 
                              onClick={() => startEditStep(step.id, step.text)}
                              className={`text-xs select-none cursor-pointer truncate flex-1 hover:text-zinc-200 transition-colors ${
                                step.checked ? 'line-through text-zinc-550' : 'text-zinc-350'
                              }`}
                            >
                              {step.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditStep(step.id, step.text)}
                            className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-850 rounded transition-colors"
                            title="Editar texto"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => deleteStep('seo', step.id)}
                            className="p-1 text-zinc-550 hover:text-red-400 hover:bg-zinc-850 rounded transition-colors"
                            title="Eliminar paso"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/10"
          >
            <Save size={13} />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
