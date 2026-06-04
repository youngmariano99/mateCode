import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { useAgencyStore } from '../../store/useAgencyStore';
import { Plus, Trash2, Edit, Copy, ExternalLink, Check, Globe, Brain, ArrowLeft, Code } from 'lucide-react';
import { motion } from 'framer-motion';

interface Question {
  pregunta: string;
  tipoInput: 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'linear_scale' | 'select' | 'rating';
  etiquetaSemantica: string;
  opciones?: string[];
}

interface FormTemplateConfig {
  questions: Question[];
  emailVisible: boolean;
  emailRequired: boolean;
  telefonoVisible: boolean;
  telefonoRequired: boolean;
}

interface FormTemplate {
  id?: string;
  nombre: string;
  tipo: 'lead' | 'idea_propia';
  configuracionJson: any; // Puede ser un arreglo de Question (antiguo) o FormTemplateConfig (nuevo)
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

export const AgencyFormsPanel: React.FC = () => {
  const { activeAgency } = useAgencyStore();
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingForm, setEditingForm] = useState<FormTemplate | null>(null);
  const [editingFormConfig, setEditingFormConfig] = useState<FormTemplateConfig>({
    questions: [],
    emailVisible: true,
    emailRequired: true,
    telefonoVisible: false,
    telefonoRequired: false
  });
  const [jsonImportText, setJsonImportText] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadForms();
  }, [activeAgency?.id]);

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

  const loadForms = async () => {
    if (!activeAgency?.id) return;
    try {
      setIsLoading(true);
      const data = await api.get('/FormLibrary');
      const parsedData = (data || []).map((f: any) => ({
        ...f,
        configuracionJson: typeof f.configuracionJson === 'string'
          ? JSON.parse(f.configuracionJson)
          : (f.configuracionJson || [])
      }));
      setForms(parsedData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (form: FormTemplate) => {
    setEditingForm(form);
    setEditingFormConfig(normalizeConfig(form.configuracionJson));
  };

  const handleCreateNew = () => {
    setEditingForm({
      nombre: '',
      tipo: 'lead',
      configuracionJson: []
    });
    setEditingFormConfig({
      questions: [
        { pregunta: '', tipoInput: 'textarea', etiquetaSemantica: 'definicion_problema' }
      ],
      emailVisible: true,
      emailRequired: true,
      telefonoVisible: false,
      telefonoRequired: false
    });
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

  const handleSave = async () => {
    if (!editingForm || !activeAgency?.id) return;
    setIsSaving(true);
    try {
      if (!editingForm.nombre.trim()) {
        throw new Error('El nombre de la plantilla es requerido.');
      }
      if (editingFormConfig.questions.length === 0) {
        throw new Error('Debes agregar al menos una pregunta.');
      }

      const payload = {
        ...editingForm,
        configuracionJson: editingFormConfig
      };

      if (editingForm.id) {
        await api.put(`/FormLibrary/${editingForm.id}`, payload);
      } else {
        await api.post('/FormLibrary', payload);
      }

      Swal.fire({
        icon: 'success',
        title: 'Formulario Guardado',
        background: '#09090b',
        color: '#f4f4f5',
        confirmButtonColor: '#10b981'
      });
      setEditingForm(null);
      loadForms();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err.message,
        background: '#09090b',
        color: '#f4f4f5',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar plantilla?',
      text: 'Esta acción eliminará el formulario permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/FormLibrary/${id}`);
        loadForms();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCopyLink = () => {
    if (!activeAgency?.id) return;
    const link = `${window.location.origin}/public-form/agency/${activeAgency.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonImportText);
      const normalized = normalizeConfig(parsed);
      setEditingFormConfig(normalized);
      Swal.fire({ title: 'Éxito', text: 'Preguntas importadas correctamente.', icon: 'success', timer: 1500 });
      setShowJsonImport(false);
      setJsonImportText('');
    } catch (err: any) {
      Swal.fire({ title: 'Error de Sintaxis', text: err.message, icon: 'error' });
    }
  };

  if (!activeAgency) return <div className="text-zinc-500 text-xs">Cargando contexto de agencia...</div>;

  const publicLink = `${window.location.origin}/public-form/agency/${activeAgency.id}`;

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {editingForm ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditingForm(null)}
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
                  onClick={() => setShowJsonImport(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportJson}
                  className="px-3 py-1.5 bg-emerald-500 text-black rounded-xl text-xs font-bold"
                >
                  Aplicar Importación
                </button>
              </div>
            </motion.div>
          )}

          <div className="bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl space-y-4">
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
                <p className="text-[10px] text-zinc-400">Vincula leads públicos con estado \'potencial\'.</p>
              </button>
              <button
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
                    onClick={() => removeQuestion(idx)}
                    className="absolute top-2 right-2 text-zinc-650 hover:text-red-405 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <div className="flex gap-3 pt-2 border-t border-zinc-850">
                <button
                  onClick={addQuestion}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-455 rounded-xl transition-colors"
                >
                  + Agregar Pregunta
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Enlace Mágico General */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Globe size={14} className="text-emerald-400" />
                <span>Enlace Mágico General de Captación</span>
              </div>
              <p className="text-[10px] text-zinc-500">
                Este link público cargará automáticamente la plantilla de tipo 'Público' más reciente de tu agencia.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-zinc-850 hover:bg-zinc-805 border border-zinc-700/60 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copiado' : 'Copiar Link'}</span>
              </button>
              <a
                href={publicLink}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink size={12} />
                <span>Ver Formulario</span>
              </a>
            </div>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Plantillas Activas</h3>
              <p className="text-zinc-500 text-[10px] mt-0.5">Define las preguntas clave que tus clientes potenciales responderán.</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Nueva Plantilla</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20 text-zinc-500 text-xs uppercase tracking-widest animate-pulse">
              Cargando plantillas...
            </div>
          ) : forms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-zinc-850 rounded-2xl">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No hay plantillas de formularios</p>
              <p className="text-[10px] text-zinc-650 mt-1">Crea tu primera plantilla de captación para recibir leads automáticamente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map(form => {
                const specificMagicLink = `${window.location.origin}/public-form/agency/${activeAgency.id}?formId=${form.id}`;
                return (
                  <div key={form.id} className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          form.tipo === 'lead'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {form.tipo === 'lead' ? 'Público / Lead' : 'Interno / ADN'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(form)}
                            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-450 hover:text-white transition-colors"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(form.id!)}
                            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-450 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-xs line-clamp-1">{form.nombre}</h4>
                      <p className="text-[10px] text-zinc-500">
                        {Array.isArray(form.configuracionJson) 
                          ? form.configuracionJson.length 
                          : (form.configuracionJson?.questions || []).length} preguntas configuradas
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(form.configuracionJson) 
                          ? form.configuracionJson 
                          : (form.configuracionJson?.questions || [])
                        ).slice(0, 3).map((q: any, i: number) => (
                          <span key={i} className="text-[8px] font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-zinc-500 uppercase">
                            #{q.etiquetaSemantica ? q.etiquetaSemantica.split('_')[0] : 'tag'}
                          </span>
                        ))}
                      </div>

                      {/* Enlace Mágico de la Plantilla Específica */}
                      <div className="border-t border-zinc-850/65 pt-2.5 flex items-center justify-between gap-2">
                        <span className="text-[9px] text-zinc-550 truncate max-w-[130px]">
                          ?formId={form.id?.substring(0, 8)}...
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(specificMagicLink);
                              Swal.fire({
                                title: 'Link Copiado',
                                text: 'Enlace de la plantilla específica copiado al portapapeles.',
                                icon: 'success',
                                timer: 1000,
                                showConfirmButton: false
                              });
                            }}
                            className="p-1 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white transition-colors"
                            title="Copiar link de plantilla"
                          >
                            <Copy size={11} />
                          </button>
                          <a
                            href={specificMagicLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 hover:bg-zinc-850 rounded text-emerald-400 hover:text-emerald-350 transition-colors"
                            title="Abrir formulario público"
                          >
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
