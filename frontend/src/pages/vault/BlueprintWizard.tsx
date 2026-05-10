import React, { useState, useEffect } from 'react';
import { 
    BrainCircuit, Cpu, ShieldCheck, Sparkles, 
    ChevronRight, ChevronLeft, Trash2, Copy, FileJson, 
    Search, RefreshCcw, LayoutPanelLeft
} from 'lucide-react';
import { useProjectBlueprintStore } from '../../store/useProjectBlueprintStore';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';

const SECTIONS = [
    { id: 'contexto', label: '1. Entender el Problema', icon: BrainCircuit, color: 'emerald' },
    { id: 'stack', label: '2. Herramientas y Lenguajes', icon: Cpu, color: 'blue' },
    { id: 'calidad', label: '3. Reglas de Juego y Calidad', icon: ShieldCheck, color: 'purple' },
];

export const BlueprintWizard = () => {
    const store = useProjectBlueprintStore();
    const [activeSection, setActiveSection] = useState(0);
    const [forms, setForms] = useState<any[]>([]);
    const [selectedFormId, setSelectedFormId] = useState<string>('');
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [importJson, setImportJson] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            const data = await api.get('/FormLibrary');
            setForms(data);
            if (data.length > 0 && !selectedFormId) {
                // Seleccionar el primero por defecto o el que ya esté en el store si existiera
                setSelectedFormId(data[0].id);
                setSelectedForm(data[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedFormId) {
            const form = forms.find(f => f.id === selectedFormId);
            setSelectedForm(form);
        }
    }, [selectedFormId, forms]);

    const generateSectionPrompt = () => {
        let prompt = "";
        const projectName = store.adn.nombre || "Proyecto Sin Nombre";
        const projectDesc = store.adn.proposito || "Sin descripción";

        if (activeSection === 0) {
            // Prompt para Contexto
            const questions = (selectedForm?.configuracionJson || []).map((q: any) => `- ${q.pregunta} (ID Semántico: ${q.etiquetaSemantica})`).join('\n');
            prompt = `Actúa como Product Manager Senior. Tengo un proyecto llamado "${projectName}".\nDescripción: ${projectDesc}\n\nNecesito que respondas este cuestionario de forma técnica y detallada para entender el problema.\n\nPREGUNTAS:\n${questions}\n\nRESPONDE ÚNICAMENTE CON UN OBJETO JSON PLANO donde la clave sea el ID Semántico y el valor sea la respuesta detallada.`;
        } else if (activeSection === 1) {
            // Prompt para Stack (Alimentado por contexto + respuestas dinámicas)
            const fullContext = JSON.stringify({ ...store.adn, detalles: store.respuestasContexto });
            prompt = `Actúa como Arquitecto de Software Staff. Basado en el siguiente contexto del problema y detalles técnicos:\n${fullContext}\n\nSugiere el STACK TECNOLÓGICO ideal (Plataforma, Backend, Frontend, DB, Testing, Infra). Explica el porqué de cada elección.\n\nRESPONDE ÚNICAMENTE EN FORMATO JSON con estas llaves: plataforma, backend, frontend, bdd, infra, testing, librerias_back, librerias_front.`;
        } else {
            // Prompt para Calidad (Alimentado por contexto completo)
            const fullContext = JSON.stringify({ adn: store.adn, detalles: store.respuestasContexto, stack: store.stack });
            prompt = `Actúa como Experto en Calidad y Seguridad. Basado en este proyecto y su configuración técnica:\n${fullContext}\n\nDefine las Reglas de Juego (Estándares) y la estrategia de calidad. Incluye Auth, RBAC, Estándares de Código y Riesgos.\n\nRESPONDE ÚNICAMENTE EN FORMATO JSON con estas llaves: auth, rbac, estandares, legal, hitos, riesgos.`;
        }

        navigator.clipboard.writeText(prompt);
        Swal.fire({
            title: '✨ Guía Copiada',
            text: 'El prompt ha sido copiado al portapapeles. Pégalo en tu IA favorita.',
            icon: 'success',
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#10b981'
        });
    };

    const handleImportJson = () => {
        try {
            const data = JSON.parse(importJson);
            if (activeSection === 0) {
                // Inyectar en ADN/Contexto
                store.updateAdn({ 
                    nombre: data.nombre || store.adn.nombre,
                    proposito: data.definicion_problema || data.proposito || store.adn.proposito,
                    vision: data.mapa_impacto || data.vision || store.adn.vision,
                    publico: data.usuarios_contexto || data.publico || store.adn.publico,
                    diferenciador: data.kpis || data.diferenciador || store.adn.diferenciador
                });
                
                // Inyectar respuestas dinámicas (todo lo que no sea campo base)
                Object.keys(data).forEach(key => {
                    if (typeof data[key] === 'string') {
                        store.updateRespuestaContexto(key, data[key]);
                    }
                });
            } else if (activeSection === 1) {
                store.updateStack(data);
            } else {
                store.updateCalidad({
                    auth: data.auth,
                    rbac: data.rbac,
                    estandares: data.estandares,
                    legal: data.legal
                });
                store.updateGestion({
                    hitos: data.hitos,
                    riesgos: data.riesgos
                });
            }

            Swal.fire({ title: '✨ Datos Inyectados', icon: 'success', background: '#18181b', color: '#fff' });
            setImportJson('');
        } catch (err) {
            Swal.fire({ title: 'Error de Formato', text: 'El JSON no es válido', icon: 'error', background: '#18181b', color: '#fff' });
        }
    };

    if (isLoading) return <div className="p-20 text-center font-black text-zinc-800 tracking-[0.5em] animate-pulse uppercase">Iniciando ADN Hub...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto p-4 lg:p-10 animate-in fade-in duration-700">
            {/* Sidebar Wizard */}
            <aside className="w-full lg:w-80 space-y-6">
                <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[3rem] backdrop-blur-xl shadow-2xl">
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-10 px-2 leading-none">
                        Arranque del <span className="text-emerald-500 block text-4xl">Proyecto</span>
                    </h2>
                    <nav className="space-y-4">
                        {SECTIONS.map((section, idx) => (
                            <button 
                                key={section.id}
                                onClick={() => setActiveSection(idx)}
                                className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] transition-all duration-500 group ${activeSection === idx ? 'bg-white text-black shadow-2xl scale-105' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <div className={`p-2 rounded-lg ${activeSection === idx ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-500 group-hover:text-white'}`}>
                                    <section.icon size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-left leading-tight">{section.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="px-4 space-y-4">
                    <button 
                        onClick={() => store.reset()}
                        className="w-full p-4 bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={12} /> Limpiar Todo el ADN
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 space-y-8">
                {/* AI Assistant Bar */}
                <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-6 items-center shadow-xl">
                    <div className="flex-1">
                        <h3 className="text-xs font-black text-white uppercase italic flex items-center gap-2 mb-1">
                            <Sparkles className="text-emerald-500 animate-pulse" size={16} /> 
                            Asistente Inteligente de {SECTIONS[activeSection].label.split(' ')[1]}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Copiá la guía para tu IA y pegá el resultado JSON aquí debajo.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button 
                            onClick={generateSectionPrompt}
                            className="flex-1 md:flex-none px-6 py-3 bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center gap-2 border border-white/5"
                        >
                            <Copy size={14} /> Copiar Guía
                        </button>
                        <div className="flex-1 md:w-64 relative">
                            <input 
                                value={importJson}
                                onChange={(e) => setImportJson(e.target.value)}
                                placeholder="Pegar JSON de la IA..."
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                            />
                            {importJson && (
                                <button 
                                    onClick={handleImportJson}
                                    className="absolute right-2 top-2 p-1 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all animate-in zoom-in"
                                >
                                    <FileJson size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* dynamic content */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[3rem] p-12 backdrop-blur-xl shadow-2xl relative min-h-[600px] flex flex-col">
                    <header className="mb-12 flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Etapa 0{activeSection + 1}</p>
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{SECTIONS[activeSection].label}</h2>
                        </div>
                        <div className="p-6 bg-zinc-950 rounded-[2rem] border border-white/5 text-emerald-500 shadow-inner">
                            {React.createElement(SECTIONS[activeSection].icon, { size: 40 })}
                        </div>
                    </header>

                    <div className="flex-1">
                        {activeSection === 0 && (
                            <div className="space-y-8">
                                <div className="flex items-end gap-6 mb-12 p-6 bg-zinc-950 rounded-[2rem] border border-white/5">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 block ml-2">Modelo de Entendimiento</label>
                                        <select 
                                            value={selectedFormId}
                                            onChange={(e) => setSelectedFormId(e.target.value)}
                                            className="w-full bg-transparent text-xl font-black text-white outline-none appearance-none cursor-pointer uppercase italic tracking-tighter"
                                        >
                                            {forms.map(f => (
                                                <option key={f.id} value={f.id} className="bg-zinc-900 text-sm">{f.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="p-3 bg-zinc-800 rounded-xl text-zinc-500">
                                        <LayoutPanelLeft size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="col-span-full border-b border-white/5 pb-4 mb-4">
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Cuestionario de Contexto</h4>
                                    </div>
                                    
                                    {/* Campos básicos obligatorios */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-2">Nombre del Proyecto</label>
                                        <input 
                                            value={store.adn.nombre}
                                            onChange={(e) => store.updateAdn({ nombre: e.target.value })}
                                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-sm text-white font-bold outline-none focus:border-emerald-500/30 transition-all"
                                            placeholder="Ej: Quantum ERP"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-2">Propósito Inicial</label>
                                        <input 
                                            value={store.adn.proposito}
                                            onChange={(e) => store.updateAdn({ proposito: e.target.value })}
                                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-sm text-white font-bold outline-none focus:border-emerald-500/30 transition-all"
                                            placeholder="Resumen rápido de la idea..."
                                        />
                                    </div>

                                    {/* Preguntas dinámicas del formulario */}
                                    {selectedForm?.configuracionJson?.map((q: any, i: number) => (
                                        <div key={i} className="space-y-2 col-span-full">
                                            <label className="text-[9px] font-black uppercase text-emerald-500/50 tracking-widest ml-2">{q.pregunta}</label>
                                            <textarea 
                                                value={store.respuestasContexto[q.etiquetaSemantica] || ''}
                                                onChange={(e) => store.updateRespuestaContexto(q.etiquetaSemantica, e.target.value)}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500/30 transition-all min-h-[100px] resize-none"
                                                placeholder={`Respuesta para ${q.etiquetaSemantica}...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-8 duration-500">
                                {[
                                    { id: 'plataforma', label: 'Plataformas (Web, Mobile, etc.)' },
                                    { id: 'backend', label: 'Cerebro / Backend' },
                                    { id: 'frontend', label: 'Interfaz / Frontend' },
                                    { id: 'bdd', label: 'Base de Datos' },
                                    { id: 'infra', label: 'Infraestructura / Cloud' },
                                    { id: 'testing', label: 'Estrategia de Pruebas' },
                                    { id: 'librerias_back', label: 'Librerías Backend' },
                                    { id: 'librerias_front', label: 'Librerías Frontend' },
                                ].map(field => (
                                    <div key={field.id} className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-blue-500/50 tracking-widest ml-2">{field.label}</label>
                                        <input 
                                            value={(store.stack as any)[field.id]}
                                            onChange={(e) => store.updateStack({ [field.id]: e.target.value })}
                                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-sm text-white font-bold outline-none focus:border-blue-500/30 transition-all"
                                            placeholder="..."
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-8 duration-500">
                                {[
                                    { id: 'auth', label: 'Seguridad y Acceso' },
                                    { id: 'rbac', label: 'Roles y Permisos' },
                                    { id: 'estandares', label: 'Estándares de Código' },
                                    { id: 'legal', label: 'Cumplimiento y Legal' },
                                    { id: 'hitos', label: 'Hitos de Entrega' },
                                    { id: 'riesgos', label: 'Riesgos Técnicos' },
                                ].map(field => (
                                    <div key={field.id} className="space-y-2 col-span-full md:col-span-1">
                                        <label className="text-[9px] font-black uppercase text-purple-500/50 tracking-widest ml-2">{field.label}</label>
                                        <textarea 
                                            value={field.id === 'hitos' || field.id === 'riesgos' ? (store.gestion as any)[field.id] : (store.calidad as any)[field.id]}
                                            onChange={(e) => {
                                                if (field.id === 'hitos' || field.id === 'riesgos') {
                                                    store.updateGestion({ [field.id]: e.target.value });
                                                } else {
                                                    store.updateCalidad({ [field.id]: e.target.value });
                                                }
                                            }}
                                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-sm text-white outline-none focus:border-purple-500/30 transition-all min-h-[100px] resize-none"
                                            placeholder="..."
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <footer className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center">
                        <button 
                            onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
                            disabled={activeSection === 0}
                            className={`flex items-center gap-2 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 0 ? 'text-zinc-800 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <ChevronLeft size={16} /> Paso Anterior
                        </button>
                        
                        <button 
                            onClick={() => setActiveSection(prev => Math.min(SECTIONS.length - 1, prev + 1))}
                            disabled={activeSection === SECTIONS.length - 1}
                            className={`flex items-center gap-2 px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSection === SECTIONS.length - 1 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:scale-105 active:scale-95'}`}
                        >
                            Siguiente Paso <ChevronRight size={16} />
                        </button>
                    </footer>
                </div>
            </main>
        </div>
    );
};
