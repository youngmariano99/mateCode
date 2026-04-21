import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';
import { useProject } from '../../context/ProjectContext';

const API_BASE = 'http://localhost:5241';

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

interface Question {
    pregunta: string;
    tipoInput: 'text' | 'textarea' | 'number' | 'date';
    etiquetaSemantica: string;
}

interface FormTemplate {
    id?: string;
    nombre: string;
    tipo: 'lead' | 'idea_propia';
    configuracionJson: Question[];
}

export const FormLibrary = () => {
    const { tenantId } = useProject();
    const [forms, setForms] = useState<FormTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingForm, setEditingForm] = useState<FormTemplate | null>(null);

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${API_BASE}/api/FormLibrary`, {
                headers: { 
                    'Authorization': `Bearer ${session?.access_token}`,
                    'X-Tenant-Id': tenantId || ''
                }
            });
            if (response.ok) {
                setForms(await response.json());
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingForm({
            nombre: '',
            tipo: 'lead',
            configuracionJson: [
                { pregunta: '', tipoInput: 'text', etiquetaSemantica: 'definicion_problema' }
            ]
        });
    };

    const addQuestion = () => {
        if (!editingForm) return;
        setEditingForm({
            ...editingForm,
            configuracionJson: [
                ...editingForm.configuracionJson,
                { pregunta: '', tipoInput: 'text', etiquetaSemantica: 'definicion_problema' }
            ]
        });
    };

    const handleSave = async () => {
        if (!editingForm) return;
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            const method = editingForm.id ? 'PUT' : 'POST';
            const url = editingForm.id 
                ? `${API_BASE}/api/FormLibrary/${editingForm.id}` 
                : `${API_BASE}/api/FormLibrary`;

            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                    'X-Tenant-Id': tenantId || ''
                },
                body: JSON.stringify(editingForm)
            });

            if (response.ok) {
                Swal.fire('¡Éxito!', 'Formulario guardado', 'success');
                setEditingForm(null);
                loadForms();
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (form: FormTemplate) => {
        setEditingForm({ ...form });
    };

    if (isLoading) return <div className="p-8 text-zinc-500">Cargando biblioteca...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">Biblioteca de Formularios</h1>
                    <p className="text-zinc-400">Capturá requerimientos con estructura semántica para la IA.</p>
                </div>
                <button 
                    onClick={handleCreateNew}
                    className="px-6 py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg"
                >
                    + Nuevo Formulario
                </button>
            </header>

            {editingForm ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-white">Configurar Formulario</h2>
                        <button onClick={() => setEditingForm(null)} className="text-zinc-500 hover:text-white">Cerrar</button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Nombre de la Plantilla</label>
                            <input 
                                value={editingForm.nombre}
                                onChange={e => setEditingForm({...editingForm, nombre: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Ej: Calificación Inicial"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Tipo de Flujo</label>
                            <select 
                                value={editingForm.tipo}
                                onChange={e => setEditingForm({...editingForm, tipo: e.target.value as any})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="lead">Lead Público (Cliente)</option>
                                <option value="idea_propia">Idea Propia (ADN)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <label className="block text-xs font-bold text-zinc-500 uppercase">Preguntas del Formulario</label>
                        {editingForm.configuracionJson.map((q, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
                                <div className="flex-1">
                                    <input 
                                        value={q.pregunta}
                                        onChange={e => {
                                            const newConfig = [...editingForm.configuracionJson];
                                            newConfig[idx].pregunta = e.target.value;
                                            setEditingForm({...editingForm, configuracionJson: newConfig});
                                        }}
                                        placeholder="Escribí la pregunta..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white mb-2"
                                    />
                                    <div className="flex gap-3">
                                        <select 
                                            value={q.tipoInput}
                                            onChange={e => {
                                                const newConfig = [...editingForm.configuracionJson];
                                                newConfig[idx].tipoInput = e.target.value as any;
                                                setEditingForm({...editingForm, configuracionJson: newConfig});
                                            }}
                                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-400"
                                        >
                                            <option value="text">Texto Corto</option>
                                            <option value="textarea">Texto Largo</option>
                                            <option value="number">Número</option>
                                            <option value="date">Fecha</option>
                                        </select>
                                        <select 
                                            value={q.etiquetaSemantica}
                                            onChange={e => {
                                                const newConfig = [...editingForm.configuracionJson];
                                                newConfig[idx].etiquetaSemantica = e.target.value;
                                                setEditingForm({...editingForm, configuracionJson: newConfig});
                                            }}
                                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-emerald-400 font-bold"
                                        >
                                            {SEMANTIC_TAGS.map(tag => (
                                                <option key={tag.value} value={tag.value}>{tag.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={addQuestion}
                            className="px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-bold"
                        >
                            + Agregar Pregunta
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-2 bg-emerald-500 text-zinc-950 rounded-xl hover:bg-emerald-400 transition-all font-black"
                        >
                            {isSaving ? 'Guardando...' : 'GUARDAR PLANTILLA'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <div key={form.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${form.tipo === 'lead' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                    {form.tipo === 'lead' ? 'Público' : 'ADN Interno'}
                                </span>
                                <button 
                                    onClick={() => handleEdit(form)}
                                    className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    ✏️
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{form.nombre}</h3>
                            <p className="text-zinc-500 text-xs mb-6">{(form.configuracionJson || []).length} preguntas estructuradas.</p>
                            <div className="flex flex-wrap gap-2">
                                {(form.configuracionJson || []).map((q, i) => (
                                    <span key={i} className="px-2 py-1 bg-zinc-800 rounded-md text-[9px] text-zinc-400">
                                        #{q.etiquetaSemantica}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
