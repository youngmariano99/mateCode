import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { useProject } from '../../context/ProjectContext';

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

const TAG_GUIDES: Record<string, { desc: string; example: string; ai: string }> = {
    'definicion_problema': { 
        desc: 'Identificá el dolor principal.', 
        example: '¿Cuál es el proceso que más errores genera hoy?', 
        ai: 'Define la prioridad de las épicas en la Fase 1.' 
    },
    'mapa_impacto': { 
        desc: 'Medí el costo del problema.', 
        example: '¿Cuántas horas hombre se pierden al mes en esta tarea?', 
        ai: 'Calcula el ROI y justifica el presupuesto.' 
    },
    'usuarios_contexto': { 
        desc: 'Quiénes usarán el sistema.', 
        example: '¿Qué nivel técnico tiene la persona que cargará los datos?', 
        ai: 'Define la UX y complejidad de la interfaz.' 
    },
    'procesos_actuales': { 
        desc: 'Cómo se resuelve hoy.', 
        example: 'Describí el paso a paso desde que llega el pedido hasta que se factura.', 
        ai: 'Ayuda a diseñar el flujo lógico en el backend.' 
    },
    'entidades_clave': { 
        desc: 'Objetos principales.', 
        example: '¿Qué datos mínimos necesitás de un Cliente?', 
        ai: 'Diseña las tablas del ERD automáticamente.' 
    },
    'kpis': { 
        desc: 'Criterios de éxito.', 
        example: '¿Qué porcentaje de reducción de errores esperás?', 
        ai: 'Genera los casos de prueba para la Fase 4.' 
    },
    'restricciones': { 
        desc: 'Límites del proyecto.', 
        example: '¿Es obligatorio usar una base de datos específica?', 
        ai: 'Filtra el Stack tecnológico en el Blueprint.' 
    }
};

export const FormLibrary = () => {
    const { tenantId } = useProject();
    const [forms, setForms] = useState<FormTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingForm, setEditingForm] = useState<FormTemplate | null>(null);
    const [activeGuide, setActiveGuide] = useState<string | null>(null);

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            const data = await api.get('/FormLibrary');
            setForms(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingForm({
            nombre: '',
            tipo: 'lead',
            configuracionJson: [
                { pregunta: '', tipoInput: 'textarea', etiquetaSemantica: 'definicion_problema' }
            ]
        });
    };

    const addQuestion = () => {
        if (!editingForm) return;
        setEditingForm({
            ...editingForm,
            configuracionJson: [
                ...editingForm.configuracionJson,
                { pregunta: '', tipoInput: 'textarea', etiquetaSemantica: 'definicion_problema' }
            ]
        });
    };

    const handleSave = async () => {
        if (!editingForm) return;
        setIsSaving(true);
        try {
            if (editingForm.id) {
                await api.put(`/FormLibrary/${editingForm.id}`, editingForm);
            } else {
                await api.post('/FormLibrary', editingForm);
            }

            Swal.fire({ icon: 'success', title: 'Plantilla Guardada', background: '#18181b', color: '#fff' });
            setEditingForm(null);
            loadForms();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Eliminar plantilla?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            background: '#18181b',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/FormLibrary/${id}`);
                loadForms();
            } catch (err) { console.error(err); }
        }
    };

    const handleEdit = (form: FormTemplate) => {
        setEditingForm({ ...form });
    };

    if (isLoading) return <div className="p-8 text-zinc-500 font-black uppercase tracking-widest animate-pulse">Cargando Bóveda...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <header className="flex justify-between items-end mb-16">
                <div>
                    <h1 className="text-5xl font-black text-white mb-4 italic uppercase tracking-tighter">
                        Bóveda de <span className="text-emerald-500">Formularios</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">Estructuración Semántica para el ADN del Proyecto</p>
                </div>
                <button 
                    onClick={handleCreateNew}
                    className="group relative px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all shadow-2xl flex items-center gap-3"
                >
                    <span className="text-xl">+</span> NUEVA PLANTILLA
                </button>
            </header>

            {editingForm ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    {/* Main Editor */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-xl font-black text-white uppercase italic">Configuración de Estructura</h2>
                                <button onClick={() => setEditingForm(null)} className="px-4 py-2 bg-zinc-950 text-zinc-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Cancelar</button>
                            </div>

                            {/* Flow Type Visual Selector */}
                            <div className="mb-12">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 block ml-2">Propósito del Formulario</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setEditingForm({...editingForm, tipo: 'lead'})}
                                        className={`p-6 rounded-[2rem] border transition-all text-left group ${editingForm.tipo === 'lead' ? 'bg-emerald-500 border-emerald-500' : 'bg-zinc-950 border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${editingForm.tipo === 'lead' ? 'bg-black text-emerald-500' : 'bg-zinc-900 text-zinc-500'}`}>🌍</div>
                                        <h4 className={`text-xs font-black uppercase ${editingForm.tipo === 'lead' ? 'text-black' : 'text-white'}`}>Captura de Leads</h4>
                                        <p className={`text-[9px] font-bold uppercase mt-1 ${editingForm.tipo === 'lead' ? 'text-emerald-900' : 'text-zinc-600'}`}>Para Link Mágico y Landing Pages públicas.</p>
                                    </button>
                                    <button 
                                        onClick={() => setEditingForm({...editingForm, tipo: 'idea_propia'})}
                                        className={`p-6 rounded-[2rem] border transition-all text-left group ${editingForm.tipo === 'idea_propia' ? 'bg-purple-500 border-purple-500' : 'bg-zinc-950 border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${editingForm.tipo === 'idea_propia' ? 'bg-black text-purple-500' : 'bg-zinc-900 text-zinc-500'}`}>🧠</div>
                                        <h4 className={`text-xs font-black uppercase ${editingForm.tipo === 'idea_propia' ? 'text-black' : 'text-white'}`}>Definición de ADN</h4>
                                        <p className={`text-[9px] font-bold uppercase mt-1 ${editingForm.tipo === 'idea_propia' ? 'text-purple-900' : 'text-zinc-600'}`}>Uso interno para llenar contexto de Fase 0.</p>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-12">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 block ml-2">Identificación</label>
                                <input 
                                    value={editingForm.nombre}
                                    onChange={e => setEditingForm({...editingForm, nombre: e.target.value})}
                                    className="w-full bg-zinc-950 border-b border-white/5 p-6 text-2xl font-black text-white outline-none focus:border-emerald-500 transition-all"
                                    placeholder="NOMBRE DE LA PLANTILLA..."
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block ml-2">Cuerpo Semántico</label>
                                {editingForm.configuracionJson.map((q, idx) => (
                                    <div key={idx} className="relative group bg-zinc-950 border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all">
                                        <div className="flex gap-6">
                                            <div className="flex-1 space-y-4">
                                                <input 
                                                    value={q.pregunta}
                                                    onChange={e => {
                                                        const newConfig = [...editingForm.configuracionJson];
                                                        newConfig[idx].pregunta = e.target.value;
                                                        setEditingForm({...editingForm, configuracionJson: newConfig});
                                                    }}
                                                    placeholder="¿Qué necesitás saber?"
                                                    className="w-full bg-transparent border-b border-white/5 p-2 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all"
                                                />
                                                <div className="flex gap-4">
                                                    <select 
                                                        value={q.tipoInput}
                                                        onChange={e => {
                                                            const newConfig = [...editingForm.configuracionJson];
                                                            newConfig[idx].tipoInput = e.target.value as any;
                                                            setEditingForm({...editingForm, configuracionJson: newConfig});
                                                        }}
                                                        className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black text-zinc-400 outline-none uppercase"
                                                    >
                                                        <option value="text">Texto Corto</option>
                                                        <option value="textarea">Respuesta Larga</option>
                                                        <option value="number">Numérico</option>
                                                        <option value="date">Fecha</option>
                                                    </select>
                                                    <select 
                                                        value={q.etiquetaSemantica}
                                                        onFocus={() => setActiveGuide(q.etiquetaSemantica)}
                                                        onChange={e => {
                                                            const newConfig = [...editingForm.configuracionJson];
                                                            newConfig[idx].etiquetaSemantica = e.target.value;
                                                            setEditingForm({...editingForm, configuracionJson: newConfig});
                                                            setActiveGuide(e.target.value);
                                                        }}
                                                        className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black text-emerald-500 outline-none uppercase"
                                                    >
                                                        {SEMANTIC_TAGS.map(tag => (
                                                            <option key={tag.value} value={tag.value}>{tag.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newConfig = editingForm.configuracionJson.filter((_, i) => i !== idx);
                                                    setEditingForm({...editingForm, configuracionJson: newConfig});
                                                }}
                                                className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button onClick={addQuestion} className="flex-1 py-4 bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 rounded-2xl hover:text-white hover:border-white/20 transition-all">+ Añadir Interrogante</button>
                                <button onClick={handleSave} disabled={isSaving} className="flex-1 py-4 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                                    {isSaving ? 'Guardando...' : 'Consolidar Plantilla'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Semantic Codex Guide */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-zinc-900 border border-white/5 rounded-[2rem] p-8 space-y-6">
                            <h3 className="text-xs font-black text-white italic uppercase flex items-center gap-2">
                                <span className="text-emerald-500">●</span> Códex Semántico
                            </h3>
                            {activeGuide && TAG_GUIDES[activeGuide] ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Misión</p>
                                        <p className="text-xs text-white font-bold leading-relaxed">{TAG_GUIDES[activeGuide].desc}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Ejemplo Sugerido</p>
                                        <p className="text-[11px] text-emerald-200/70 font-medium italic italic">"{TAG_GUIDES[activeGuide].example}"</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Impacto en IA</p>
                                        <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">{TAG_GUIDES[activeGuide].ai}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[10px] text-zinc-600 font-bold uppercase leading-relaxed italic">Seleccioná una etiqueta semántica para recibir orientación arquitectónica.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {forms.map(form => (
                        <div key={form.id} className="group relative bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
                            
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${form.tipo === 'lead' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                    {form.tipo === 'lead' ? '● Público' : '● ADN Interno'}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleEdit(form)} className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-xs hover:bg-emerald-500 hover:text-black transition-all">✏️</button>
                                    <button onClick={() => handleDelete(form.id!)} className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2 group-hover:text-emerald-400 transition-all">{form.nombre}</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-8">{(form.configuracionJson || []).length} Capas Semánticas</p>

                            <div className="flex flex-wrap gap-2">
                                {(form.configuracionJson || []).slice(0, 4).map((q, i) => (
                                    <span key={i} className="px-2 py-1 bg-zinc-950 border border-white/5 rounded-lg text-[8px] font-black text-zinc-500 uppercase">
                                        #{q.etiquetaSemantica.split('_')[0]}
                                    </span>
                                ))}
                                {(form.configuracionJson || []).length > 4 && <span className="text-[8px] text-zinc-600 font-black">+{form.configuracionJson.length - 4}</span>}
                            </div>
                        </div>
                    ))}

                    {forms.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30">
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Bóveda de formularios vacía</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
