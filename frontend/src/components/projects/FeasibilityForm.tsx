import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { Cpu, Layers, Zap, Loader2, Save, Plus, RefreshCw, Copy, FileText } from 'lucide-react';
import { TemplatePickerModal } from '../shared/TemplatePickerModal';
import { ProjectStandardsAside } from './ProjectStandardsAside';
import { StackBuilder } from './StackBuilder';
import ArchitectureBlueprint from '../../pages/projects/components/ArchitectureBlueprint';

import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { PromptBuilderModal } from './PromptBuilderModal';
import { useProjectBlueprintStore } from '../../store/useProjectBlueprintStore';

export const FeasibilityForm = () => {
    const { id: paramProjectId } = useParams<{ id: string }>();
    const activeProjectId = useWorkspaceStore(state => state.activeProjectId);

    const projectId = activeProjectId || paramProjectId;

    const { tenantId } = useProject();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [isBrainstorming, setIsBrainstorming] = useState(false);
    const [availableForms, setAvailableForms] = useState<any[]>([]);
    const [adnTemplate, setAdnTemplate] = useState<any>(null);
    const [adnData, setAdnData] = useState<any>(null);
    const [showAdnSelector, setShowAdnSelector] = useState(false);
    const [showContextBuilder, setShowContextBuilder] = useState(false);
    const [activeTab, setActiveTab] = useState<'engineering' | 'stack' | 'blueprint'>('engineering');
    const [stackCount, setStackCount] = useState(0);
    const [standardsCount, setStandardsCount] = useState(0);
    const [projectStandards, setProjectStandards] = useState<any[]>([]);
    const [projectStack, setProjectStack] = useState<any[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [projectInfo, setProjectInfo] = useState({ nombre: '', descripcion: '' });
    const [importJson, setImportJson] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const project = await api.get(`/Project/${projectId}`);
                setProjectInfo({ nombre: project.nombre, descripcion: project.descripcion });
                setAdnData(project.contextoJson?.adn?.data || {});
                if (project.contextoJson?.adn?.plantillaId) fetchTemplate(project.contextoJson.adn.plantillaId);
                const [forms, catalog] = await Promise.all([
                    api.get(`/FormLibrary`),
                    api.get(`/Standard`)
                ]);
                setAvailableForms(forms);

                // Extraer categorías únicas del catálogo de estándares
                const cats = Array.from(new Set(catalog.map((s: any) => s.categoria))).filter(Boolean) as string[];
                setAvailableCategories(cats);
            } catch (err) { console.error("Error init:", err); }
        };
        init();
        fetchStatus();
    }, [tenantId, projectId]);

    // AUTO-SAVE LOGIC (Debounce)
    useEffect(() => {
        if (!isDirty) return;

        const timer = setTimeout(() => {
            updateAdn();
        }, 2000); // 2 segundos de calma y guardamos

        return () => clearTimeout(timer);
    }, [adnData, isDirty]);

    const { updateTechStack, setPendingStackImport, setPendingStandardsImport, updateCalidad } = useProjectBlueprintStore();

    const fetchStatus = async () => {
        try {
            const [stack, standards] = await Promise.all([
                api.get(`/Stack/project/${projectId}`),
                api.get(`/Project/${projectId}/standards`)
            ]);
            setProjectStack(stack);
            setStackCount(stack.length);
            setStandardsCount(standards.length);
            setProjectStandards(standards);

            // Sincronizar con Zustand para el Context Builder
            updateTechStack(stack.map((s: any) => ({
                id: s.tecnologia?.id,
                categoriaPrincipal: s.tecnologia?.categoriaPrincipal,
                nombre: s.tecnologia?.nombre
            })).filter((t: any) => t.id));

        } catch (err) { console.error("Error status:", err); }
    };

    const generateAIPrompt = () => {
        let prompt = "";
        const projectName = projectInfo.nombre || "Proyecto";

        if (activeTab === 'engineering') {
            const questions = (adnTemplate?.configuracionJson || []).map((q: any, i: number) => `- ${q.pregunta} (REF_ID: ${q.etiquetaSemantica || q.etiqueta_semantica}##${i})`).join('\n');
            prompt = `<system_context>
Eres un Product Manager Senior y Analista de Negocios Técnico.
Dominio: Descubrimiento de Producto y Definición de Arquitectura Empresarial (Fase 0 - ADN Hub).
</system_context>

<contexto_del_proyecto>
Proyecto: "${projectName}"
</contexto_del_proyecto>

<imperativo_de_tarea>
Analizar y responder con precisión técnica y visión de negocio el siguiente cuestionario de viabilidad para asentar las bases fundamentales del proyecto.
</imperativo_de_tarea>

<cuestionario_referencia>
${questions}
</cuestionario_referencia>

<restricciones_criticas>
- MANTÉN LA COHERENCIA: Las respuestas deben ser realistas, exhaustivas, profesionales y mostrar un claro entendimiento de las necesidades del mercado y del desarrollo de software.
- RESPETA EL IDENTIFICADOR: Utiliza estrictamente el REF_ID provisto en el cuestionario como la clave en tu respuesta JSON. Esto es crítico para el mapeo de base de datos.
- MANTENÉ UN EQUILIBRIO ENTRE LO TÉCNICO Y LO DE NEGOCIO: Debes responder de manera que muestres un claro entendimiento de las necesidades del mercado y del desarrollo de software.
</restricciones_criticas>

<formato_de_salida_estricto>
- Devuelve ÚNICAMENTE un objeto JSON válido, sin bloques de código markdown, sin introducciones ni conclusiones.
- Estructura exacta esperada:
{
  "etiqueta##0": "Respuesta analítica y profesional a la pregunta...",
  "etiqueta##1": "Respuesta analítica y profesional a la pregunta..."
}
</formato_de_salida_estricto>`;
        } else if (activeTab === 'stack') {
            // CONTEXTO RICO: Mapeamos preguntas con respuestas para que la IA entienda el "sentido" de cada dato
            const technicalContext = (adnTemplate?.configuracionJson || []).map((q: any, i: number) => {
                const key = `${q.etiquetaSemantica || q.etiqueta_semantica}##${i}`;
                return {
                    pregunta: q.pregunta,
                    respuesta: adnData?.[key] || 'No especificado'
                };
            });

            const fullContext = {
                proyecto: projectName,
                descripcion_general: projectInfo.descripcion,
                especificaciones_tecnicas: technicalContext
            };

            const contextStr = JSON.stringify(fullContext, null, 2);

            prompt = `Actúa como Arquitecto de Software Senior. Basado en este contexto del problema:\n${contextStr}\n\nSugiere el STACK TECNOLÓGICO ideal.
        
        REGLAS PARA EL JSON:
        1. "capa" debe ser uno de: "🖥️ Frontend", "⚙️ Backend", "🗄️ Base de Datos", "☁️ Infra & DevOps", "🧪 Testing & QA", "📱 Mobile", "🎨 Diseño & UI".
        2. "tipo" debe ser uno de: "Lenguaje", "Framework", "Librería", "Motor DB", "Extensión / ORM", "Plataforma / Herramienta".
        
        RESPONDE ÚNICAMENTE CON UN JSON CON ESTA ESTRUCTURA:
        {
          "tecnologias": [
            {
              "nombre": "Nombre de la herramienta",
              "capa": "Capa (según regla 1)",
              "tipo": "Tipo (según regla 2)",
              "url_doc": "URL oficial de la documentación",
              "justificacion": "Breve explicación de por qué es la mejor opción para este caso"
            }
          ]
        }`;
        } else {
            // CONTEXTO PARA BLUEPRINT (ESTÁNDARES)
            const stackSummary = projectStack.map(s => `${s.tecnologia?.nombre} (${s.tecnologia?.categoriaPrincipal})`).join(', ');

            const fullCtx = JSON.stringify({
                proyecto: projectName,
                descripcion: projectInfo.descripcion,
                adn: adnData,
                stack_detallado: stackSummary,
                categorias_estandares_disponibles: availableCategories
            }, null, 2);

            prompt = `<system_context>
Eres un Arquitecto de Software Senior y un Experto en Calidad, Seguridad y Compliance.
Dominio Tecnológico: Eres experto en las herramientas listadas en el stack técnico del proyecto.
</system_context>

<contexto_del_proyecto>
${fullCtx}
</contexto_del_proyecto>

<imperativo_de_tarea>
Analizar el contexto del proyecto y su stack técnico, y definir exactamente 10 Reglas de Juego y Estándares de Calidad obligatorios para el desarrollo.
</imperativo_de_tarea>

<restricciones_criticas>
- NO generes estándares genéricos. Deben ser técnicamente específicos y viables para el stack tecnológico definido.
- OBLIGATORIO: Incluye como estándares las estrategias de Autenticación, Roles/Permisos (RBAC) y Cumplimiento Legal/Protección de Datos.
- CATEGORÍAS: Utiliza las "categorias_estandares_disponibles" proporcionadas si encajan, o crea nuevas si son vitales (ej. agrupando por Niveles: Técnicos, Operativos, Estratégicos).
- CONCISIÓN: La "descripcion" actuará como un Tooltip en la interfaz gráfica. DEBE ser directa y NO superar los 150 caracteres bajo ninguna circunstancia.
</restricciones_criticas>

<formato_de_salida_estricto>
- Devuelve ÚNICAMENTE un objeto JSON válido, sin texto introductorio, sin formato markdown o bloques de código adicionales.
- El JSON debe contener una única clave raíz "estandares" que sea un array de objetos.
- Estructura exacta del JSON esperado:
{
  "estandares": [
    {
      "nombre": "Título corto y preciso (Ej: Autenticación Stateless JJWT)",
      "categoria": "Categoría lógica (Ej: Seguridad)",
      "descripcion": "Explicación técnica estricta y concisa. Máximo 150 caracteres.",
      "color": "Color hexadecimal sugerido (Ej: #10B981)"
    }
  ]
}
</formato_de_salida_estricto>`;
        }

        navigator.clipboard.writeText(prompt);
        Swal.fire({ title: '🚀 Prompt Granular Copiado', text: 'Formato estricto XML listo para inyección.', icon: 'success', background: '#18181b', color: '#fff' });
    };

    const handleImportJson = async () => {
        try {
            const data = JSON.parse(importJson);
            if (activeTab === 'engineering') {
                setAdnData({ ...adnData, ...data });
                setIsDirty(true);
                Swal.fire({ title: 'ADN Inyectado', icon: 'success', background: '#18181b', color: '#fff' });
            } else if (activeTab === 'stack') {
                if (data.tecnologias && Array.isArray(data.tecnologias)) {
                    setPendingStackImport(data.tecnologias);
                    Swal.fire({ title: 'Stack Procesado', text: 'Detectamos sugerencias de la IA. El constructor las procesará ahora.', icon: 'success', background: '#18181b', color: '#fff' });
                }
            } else if (activeTab === 'blueprint') {
                if (data.estandares && Array.isArray(data.estandares)) {
                    setPendingStandardsImport(data.estandares);
                    Swal.fire({
                        title: 'Blueprint Inyectado',
                        text: 'Los estándares arquitectónicos están listos para tu revisión y consolidación.',
                        icon: 'success',
                        background: '#18181b',
                        color: '#fff'
                    });
                } else {
                    Swal.fire({ title: 'Formato Incorrecto', text: 'El JSON debe contener un array "estandares".', icon: 'warning', background: '#18181b', color: '#fff' });
                }
            }
            setImportJson('');
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'JSON no válido', icon: 'error', background: '#18181b', color: '#fff' });
        }
    };

    const fetchTemplate = async (id: string) => {
        const template = await api.get(`/FormLibrary/${id}`);
        setAdnTemplate(template);
    };

    const handleAssignTemplate = async (templateId: string) => {
        if (Object.keys(adnData || {}).length > 0) {
            const result = await Swal.fire({ title: '¿Cambiar ADN?', text: 'Ya existen datos de ingeniería. ¿Deseas cambiar el modelo?', icon: 'warning', showCancelButton: true, background: '#18181b', color: '#fff' });
            if (!result.isConfirmed) return;
        }
        const project = await api.get(`/Project/${projectId}`);
        const ctx = project.contextoJson || {};
        ctx.adn = { ...ctx.adn, plantillaId: templateId };

        await api.put(`/Project/${projectId}/feasibility`, ctx);
        fetchTemplate(templateId);
        setShowAdnSelector(false);
    };

    const updateAdn = async () => {
        setIsSaving(true);
        try {
            const project = await api.get(`/Project/${projectId}`);
            const ctx = project.contextoJson || {};
            ctx.adn = { ...ctx.adn, data: adnData };
            await api.put(`/Project/${projectId}/feasibility`, ctx);
            setIsDirty(false);
            setLastSaved(new Date());
        } finally { setIsSaving(false); }
    };

    const calculateProgress = () => {
        let p = 0;
        if (Object.keys(adnData || {}).length > 0) p += 40;
        if (stackCount > 0) p += 30;
        if (standardsCount > 0) p += 30;
        return p;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">ADN Hub <span className="text-emerald-500">Fase 0</span></h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-3">Definición de ingeniería y procesos técnicos del proyecto.</p>
                </div>

                {/* AI Assistant Mini-Bar */}
                <div className="flex bg-zinc-900 border border-zinc-800 p-2 rounded-2xl items-center gap-3">
                    <div className="px-4 flex items-center gap-3">
                        <div>
                            <p className="text-[9px] font-black text-emerald-500 uppercase">Asistente IA</p>
                            <p className="text-[10px] text-zinc-500 font-bold">Cascada Nivel 0{activeTab === 'engineering' ? 1 : activeTab === 'stack' ? 2 : 3}</p>
                        </div>
                        <div className="h-8 w-px bg-zinc-800" />
                        <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-500 animate-pulse' : isDirty ? 'bg-amber-500/50' : 'bg-emerald-500'} shadow-[0_0_10px_rgba(16,185,129,0.2)]`} />
                            <p className="text-[7px] font-black uppercase mt-1 text-zinc-600">{isSaving ? 'Guardando' : isDirty ? 'Pendiente' : 'Sincro'}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowContextBuilder(true)} className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-all border border-emerald-500/20 flex items-center gap-2 group">
                        <FileText size={16} />
                        <span className="text-[9px] font-black uppercase hidden group-hover:inline animate-in fade-in slide-in-from-left-2">Context Builder</span>
                    </button>
                    <button onClick={generateAIPrompt} className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all border border-white/5"><Copy size={16} /></button>
                    <input
                        value={importJson}
                        onChange={(e) => setImportJson(e.target.value)}
                        placeholder="Pegar JSON..."
                        className="bg-black border border-zinc-800 rounded-xl px-4 py-2 text-[10px] text-white outline-none focus:border-emerald-500/50 w-32"
                    />
                    {importJson && (
                        <button onClick={handleImportJson} className="p-2 bg-emerald-500 text-black rounded-lg animate-in zoom-in"><Zap size={14} /></button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* TABS DE NAVEGACIÓN DE ADN */}
                    <div className="flex bg-zinc-900/50 p-1.5 rounded-[2rem] border border-zinc-800 backdrop-blur-md sticky top-4 z-40 shadow-2xl">
                        <button
                            onClick={() => setActiveTab('engineering')}
                            className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === 'engineering' ? 'bg-zinc-800 text-emerald-500 shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Cpu size={16} /> 1. Entender el Problema
                        </button>
                        <button
                            onClick={() => setActiveTab('stack')}
                            className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === 'stack' ? 'bg-zinc-800 text-blue-500 shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Layers size={16} /> 2. Herramientas y Lenguajes
                        </button>
                        <button
                            onClick={() => setActiveTab('blueprint')}
                            className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === 'blueprint' ? 'bg-zinc-800 text-purple-500 shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Zap size={16} /> 3. Reglas de Juego
                        </button>
                    </div>

                    <div className="min-h-[600px]">
                        {activeTab === 'engineering' && (
                            <section className="bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] p-12 space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="p-5 bg-emerald-500 rounded-[1.5rem] shadow-xl shadow-emerald-500/20"><Cpu className="text-zinc-950" size={32} /></div>
                                    <div>
                                        <h2 className="text-4xl font-black text-white italic uppercase leading-none">Contexto</h2>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Definición de ADN Técnico</p>
                                    </div>
                                </div>

                                {!adnTemplate ? (
                                    <div className="py-24 text-center space-y-6 border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-950/30">
                                        <Plus size={40} className="text-zinc-700 mx-auto" />
                                        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest italic">Selecciona un modelo para comenzar el análisis.</p>
                                        <button onClick={() => setShowAdnSelector(true)} className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:scale-105 transition-all shadow-xl">Elegir Modelo</button>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        <div className="flex justify-between items-center bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                                            <div>
                                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2">Modelo de Negocio Activo</p>
                                                <p className="text-2xl text-zinc-100 font-black italic uppercase tracking-tighter">{adnTemplate.nombre}</p>
                                            </div>
                                            <button onClick={() => setShowAdnSelector(true)} className="p-5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl hover:text-emerald-400 transition-all hover:rotate-180 duration-500"><RefreshCw size={24} /></button>
                                        </div>
                                        <div className="space-y-8">
                                            {(adnTemplate.configuracionJson || []).map((q: any, i: number) => {
                                                const uniqueKey = `${q.etiquetaSemantica || q.etiqueta_semantica}##${i}`;
                                                return (
                                                    <div key={i} className="space-y-4">
                                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">{q.pregunta}</label>
                                                        <textarea
                                                            value={adnData?.[uniqueKey] || ''}
                                                            onChange={e => {
                                                                setAdnData({ ...adnData, [uniqueKey]: e.target.value });
                                                                setIsDirty(true);
                                                            }}
                                                            rows={4}
                                                            placeholder={`Detalla aquí sobre ${q.etiquetaSemantica}...`}
                                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all resize-none font-medium shadow-inner"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button
                                            disabled={isSaving}
                                            onClick={updateAdn}
                                            className={`w-full py-6 font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] transition-all flex justify-center items-center gap-3 shadow-2xl ${isDirty ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-500 cursor-default'
                                                }`}
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" /> : isDirty ? 'Consolidar Cambios' : 'ADN Sincronizado'}
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'stack' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <StackBuilder projectId={projectId!} tenantId={tenantId!} />
                            </div>
                        )}

                        {activeTab === 'blueprint' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <ArchitectureBlueprint projectId={projectId!} />
                            </div>
                        )}
                    </div>
                </div>
                <ProjectStandardsAside
                    onNavigatePhase1={() => navigate(`/projects/${projectId}/phase-1-requirements`)}
                    progress={calculateProgress()}
                    engineeringDone={Object.keys(adnData || {}).length > 0}
                    stackCount={stackCount}
                    standardsCount={standardsCount}
                />
                <TemplatePickerModal isOpen={showAdnSelector} onClose={() => setShowAdnSelector(false)} type="adn" availableForms={availableForms} onSelect={handleAssignTemplate} />
                <PromptBuilderModal
                    isOpen={showContextBuilder}
                    onClose={() => setShowContextBuilder(false)}
                    projectName={projectInfo.nombre}
                    projectDescription={projectInfo.descripcion}
                    selectedStandards={projectStandards}
                />
            </div>
        </div>
    );
};
