import React, { useState } from 'react';
import { ArrowLeft, Code, Trash2, Globe, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

export interface Question {
  pregunta: string;
  tipoInput: 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'linear_scale' | 'select' | 'rating';
  etiquetaSemantica: string;
  opciones?: string[];
}

export interface FormTemplateConfig {
  questions: Question[];
  emailVisible: boolean;
  emailRequired: boolean;
  telefonoVisible: boolean;
  telefonoRequired: boolean;
}

export interface FormTemplate {
  id?: string;
  nombre: string;
  tipo: 'lead' | 'idea_propia';
  configuracionJson: any;
}

const SEMANTIC_TAGS = [
  { value: 'definicion_problema', label: '🧠 Definición del Problema' },
  { value: 'mapa_impacto', label: '🎯 Mapa de Impacto' },
  { value: 'usuarios_contexto', label: '👥 Usuarios y Contexto' },
  { value: 'procesos_actuales', label: '🔄 Procesos Actuales' },
  { value: 'entidades_clave', label: '📦 Entidades Clave' },
  { value: 'kpis', label: '📈 KPIs de Éxito' },
  { value: 'restricciones', label: '⚠️ Restricciones' },
  { value: 'presupuesto', label: '💰 Presupuesto' },
  { value: 'autoridad', label: '🔑 Autoridad/Decisor' }
];

interface FormTemplateEditorProps {
  editingForm: FormTemplate;
  setEditingForm: (val: FormTemplate) => void;
  editingFormConfig: FormTemplateConfig;
  setEditingFormConfig: (val: FormTemplateConfig) => void;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => Promise<void>;
}

export const FormTemplateEditor: React.FC<FormTemplateEditorProps> = ({
  editingForm,
  setEditingForm,
  editingFormConfig,
  setEditingFormConfig,
  isSaving,
  onCancel,
  onSave
}) => {
  const [jsonImportText, setJsonImportText] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);

  const normalizeConfig = (config: any): FormTemplateConfig => {
    if (Array.isArray(config)) {
      return {
        questions: config,
        emailVisible: true,
        emailRequired: true,
        telefonoVisible: false,
        telefonoRequired: false
      };
    }
    return {
      questions: config?.questions || [],
      emailVisible: config?.emailVisible ?? true,
      emailRequired: config?.emailRequired ?? true,
      telefonoVisible: config?.telefonoVisible ?? false,
      telefonoRequired: config?.telefonoRequired ?? false
    };
  };

  const addQuestion = () => {
    setEditingFormConfig({
      ...editingFormConfig,
      questions: [
        ...editingFormConfig.questions,
        { pregunta: '', tipoInput: 'textarea', etiquetaSemantica: 'definicion_problema' }
      ]
    });
  };

  const removeQuestion = (idx: number) => {
    setEditingFormConfig({
      ...editingFormConfig,
      questions: editingFormConfig.questions.filter((_, i) => i !== idx)
    });
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonImportText);
      const normalized = normalizeConfig(parsed);
      setEditingFormConfig(normalized);
      Swal.fire({ 
        title: 'Éxito', 
        text: 'Preguntas importadas correctamente.', 
        icon: 'success', 
        timer: 1500,
        background: '#09090b',
        color: '#f4f4f5'
      });
      setShowJsonImport(false);
      setJsonImportText('');
    } catch (err: any) {
      Swal.fire({ 
        title: 'Error de Sintaxis', 
        text: err.message, 
        icon: 'error',
        background: '#09090b',
        color: '#f4f4f5'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">
              {editingForm.id ? 'Editar Plantilla de Formulario' : 'Crear Nueva Plantilla'}
            </h2>
            <p className="text-zinc-550 text-[10px] uppercase tracking-wider">Configuración semántica para la captación automatizada</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowJsonImport(!showJsonImport)}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-zinc-750"
        >
          <Code size={14} />
          <span>Importar JSON</span>
        </button>
      </div>

      {showJsonImport && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-zinc-950/60 border border-zinc-800/80 p-5 rounded-2xl space-y-3"
        >
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Pegar JSON de Configuración</label>
          <textarea
            value={jsonImportText}
            onChange={e => setJsonImportText(e.target.value)}
            placeholder='[{"pregunta": "¿Qué problema resuelve?", "tipoInput": "textarea", "etiquetaSemantica": "definicion_problema"}] o {"questions": [...]}'
            rows={5}
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowJsonImport(false)}
              className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImportJson}
              className="px-3 py-1.5 bg-emerald-500 text-black rounded-xl text-xs font-bold"
            >
              Aplicar Importación
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-zinc-950/40 border border-zinc-855 p-6 rounded-2xl space-y-4">
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Nombre de la Plantilla</label>
          <input
            type="text"
            value={editingForm.nombre}
            onChange={e => setEditingForm({ ...editingForm, nombre: e.target.value })}
            placeholder="Ej: Relevamiento Inicial de Software"
            className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setEditingForm({ ...editingForm, tipo: 'lead' })}
            className={`p-4 rounded-xl border text-left transition-colors ${
              editingForm.tipo === 'lead'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-550 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1">
              <Globe size={14} />
              <span>Captura Pública</span>
            </div>
            <p className="text-[10px] text-zinc-400">Vincula leads públicos con estado 'potencial'.</p>
          </button>
          <button
            type="button"
            onClick={() => setEditingForm({ ...editingForm, tipo: 'idea_propia' })}
            className={`p-4 rounded-xl border text-left transition-colors ${
              editingForm.tipo === 'idea_propia'
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-550 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1">
              <Brain size={14} />
              <span>Uso Interno</span>
            </div>
            <p className="text-[10px] text-zinc-400">Plantillas para definir el ADN de un proyecto.</p>
          </button>
        </div>

        {/* Configuración Campos de Contacto */}
        <div className="border border-zinc-800/80 bg-zinc-900/20 p-4 rounded-xl space-y-3">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Campos de Contacto Requeridos</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/55 p-3 rounded-lg border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Email</span>
                <input
                  type="checkbox"
                  checked={editingFormConfig.emailVisible}
                  onChange={e => setEditingFormConfig({ ...editingFormConfig, emailVisible: e.target.checked })}
                  className="rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950"
                />
              </div>
              {editingFormConfig.emailVisible && (
                <div className="flex justify-between items-center text-[10px] text-zinc-400">
                  <span>Obligatorio</span>
                  <input
                    type="checkbox"
                    checked={editingFormConfig.emailRequired}
                    onChange={e => setEditingFormConfig({ ...editingFormConfig, emailRequired: e.target.checked })}
                    className="rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950"
                  />
                </div>
              )}
            </div>

            <div className="bg-zinc-900/55 p-3 rounded-lg border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Teléfono</span>
                <input
                  type="checkbox"
                  checked={editingFormConfig.telefonoVisible}
                  onChange={e => setEditingFormConfig({ ...editingFormConfig, telefonoVisible: e.target.checked })}
                  className="rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950"
                />
              </div>
              {editingFormConfig.telefonoVisible && (
                <div className="flex justify-between items-center text-[10px] text-zinc-400">
                  <span>Obligatorio</span>
                  <input
                    type="checkbox"
                    checked={editingFormConfig.telefonoRequired}
                    onChange={e => setEditingFormConfig({ ...editingFormConfig, telefonoRequired: e.target.checked })}
                    className="rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Preguntas Estructuradas</label>
          </div>

          {editingFormConfig.questions.map((q, idx) => (
            <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl space-y-3 relative group">
              <input
                type="text"
                value={q.pregunta}
                onChange={e => {
                  const newConfig = { ...editingFormConfig };
                  newConfig.questions[idx].pregunta = e.target.value;
                  setEditingFormConfig(newConfig);
                }}
                placeholder="Escribe la pregunta..."
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-xs text-white focus:outline-none"
              />
              <div className="flex flex-wrap gap-3">
                <select
                  value={q.tipoInput}
                  onChange={e => {
                    const newConfig = { ...editingFormConfig };
                    newConfig.questions[idx].tipoInput = e.target.value as any;
                    if (e.target.value === 'select' || e.target.value === 'checkbox') {
                      newConfig.questions[idx].opciones = newConfig.questions[idx].opciones || ['Opción A', 'Opción B'];
                    }
                    setEditingFormConfig(newConfig);
                  }}
                  className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-[10px] font-bold text-zinc-450 focus:outline-none"
                >
                  <option value="text">Texto Corto</option>
                  <option value="textarea">Respuesta Larga</option>
                  <option value="number">Numérico</option>
                  <option value="date">Fecha</option>
                  <option value="checkbox">Casillas (Checkboxes)</option>
                  <option value="linear_scale">Escala Lineal</option>
                  <option value="select">Desplegable</option>
                  <option value="rating">Rating (Estrellas)</option>
                </select>
                <select
                  value={q.etiquetaSemantica}
                  onChange={e => {
                    const newConfig = { ...editingFormConfig };
                    newConfig.questions[idx].etiquetaSemantica = e.target.value;
                    setEditingFormConfig(newConfig);
                  }}
                  className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-[10px] font-bold text-emerald-400 focus:outline-none"
                >
                  {SEMANTIC_TAGS.map(tag => (
                    <option key={tag.value} value={tag.value}>{tag.label}</option>
                  ))}
                </select>
              </div>

              {(q.tipoInput === 'select' || q.tipoInput === 'checkbox') && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 block">Opciones (separadas por comas)</label>
                  <input
                    type="text"
                    value={q.opciones?.join(', ') || ''}
                    onChange={e => {
                      const newConfig = { ...editingFormConfig };
                      newConfig.questions[idx].opciones = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setEditingFormConfig(newConfig);
                    }}
                    placeholder="Ej: Opción 1, Opción 2, Opción 3"
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-[10px] text-zinc-300 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => removeQuestion(idx)}
                className="absolute top-2 right-2 text-zinc-650 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 animate-in fade-in duration-200"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <div className="flex gap-3 pt-2 border-t border-zinc-850">
            <button
              type="button"
              onClick={addQuestion}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-450 rounded-xl transition-colors"
            >
              + Agregar Pregunta
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
