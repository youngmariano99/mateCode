import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { useAgencyStore } from '../../store/useAgencyStore';
import { Plus, Trash2, Edit, Copy, ExternalLink, Check, Globe } from 'lucide-react';
import { FormTemplateEditor } from './forms/FormTemplateEditor';
import type { FormTemplate, FormTemplateConfig } from './forms/FormTemplateEditor';

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



  if (!activeAgency) return <div className="text-zinc-500 text-xs">Cargando contexto de agencia...</div>;

  const publicLink = `${window.location.origin}/public-form/agency/${activeAgency.id}`;

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {editingForm ? (
        <FormTemplateEditor
          editingForm={editingForm}
          setEditingForm={setEditingForm}
          editingFormConfig={editingFormConfig}
          setEditingFormConfig={setEditingFormConfig}
          isSaving={isSaving}
          onCancel={() => setEditingForm(null)}
          onSave={handleSave}
        />
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
