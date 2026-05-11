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
  const [projectInfo, setProjectInfo] = useState({ nombre: '', descripcion: '' });
  const [importJson, setImportJson] = useState('');

  useEffect(() => {
    const init = async () => {
        try {
            const project = await api.get(`/Project/${projectId}`);
            setProjectInfo({ nombre: project.nombre, descripcion: project.descripcion });
            setAdnData(project.contextoJson?.adn?.data || {});
            if (project.contextoJson?.adn?.plantillaId) fetchTemplate(project.contextoJson.adn.plantillaId);
            const forms = await api.get(`/FormLibrary`);
            setAvailableForms(forms);
        } catch (err) { console.error("Error init:", err); }
    };
    init();
    fetchStatus();
  }, [tenantId, projectId]);

  const { updateTechStack } = useProjectBlueprintStore();

  const fetchStatus = async () => {
    try {
        const [stack, standards] = await Promise.all([
            api.get(`/Stack/project/${projectId}`),
            api.get(`/Project/${projectId}/standards`)
        ]);
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
    const projectName = "Proyecto"; 

    if (activeTab === 'engineering') {
        const questions = (adnTemplate?.configuracionJson || []).map((q: any, i: number) => `- ${q.pregunta} (REF_ID: ${q.etiquetaSemantica || q.etiqueta_semantica}##${i})`).join('\n');
        prompt = `Actúa como Product Manager Senior. Para el proyecto "${projectName}", responde este cuestionario técnico.\n\nPREGUNTAS:\n${questions}\n\nREGLA CRÍTICA: Responde con un JSON donde cada clave sea el REF_ID exacto (ej. tag##index) y el valor sea tu respuesta.\n\nJSON ESPERADO: {"etiqueta##indice": "respuesta"}`;
    } else if (activeTab === 'stack') {
        const context = JSON.stringify(adnData);
        prompt = `Actúa como Arquitecto de Software. Basado en este contexto del problema:\n${context}\n\nSugiere el STACK TECNOLÓGICO ideal (Front, Back, DB, Infra). Explica el porqué.\n\nRESPONDE ÚNICAMENTE CON UN JSON: {"plataforma": "...", "backend": "...", "frontend": "...", "bdd": "...", "infra": "..."}`;
    } else {
        const fullCtx = JSON.stringify({ context: adnData, stack: stackCount });
        prompt = `Actúa como Experto en Calidad. Basado en este proyecto:\n${fullCtx}\n\nDefine las 10 Reglas de Juego y Estándares de Calidad obligatorios.\n\nRESPONDE ÚNICAMENTE CON UN JSON: {"auth": "...", "rbac": "...", "estandares": "...", "legal": "..."}`;
    }

    navigator.clipboard.writeText(prompt);
    Swal.fire({ title: '🚀 Prompt Granular Copiado', text: 'Listo para inyección individual.', icon: 'success', background: '#18181b', color: '#fff' });
  };

  const handleImportJson = async () => {
    try {
        const data = JSON.parse(importJson);
        if (activeTab === 'engineering') {
            // Unimos con lo que ya existe para no borrar si el JSON es parcial
            setAdnData({ ...adnData, ...data });
            Swal.fire({ title: 'ADN Inyectado', icon: 'success', background: '#18181b', color: '#fff' });
        } else {
            await Swal.fire({ title: 'Sugerencias de IA', text: 'La IA sugiere usar estos datos. Cópialos y aplícalos en el constructor.', icon: 'info', background: '#18181b', color: '#fff' });
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
        Swal.fire({ icon: 'success', title: 'ADN Consolidado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
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
            <div className="px-4">
                <p className="text-[9px] font-black text-emerald-500 uppercase">Asistente IA</p>
                <p className="text-[10px] text-zinc-500 font-bold">Cascada Nivel 0{activeTab === 'engineering' ? 1 : activeTab === 'stack' ? 2 : 3}</p>
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
                                                    onChange={e => setAdnData({ ...adnData, [uniqueKey]: e.target.value })} 
                                                    rows={4} 
                                                    placeholder={`Detalla aquí sobre ${q.etiquetaSemantica}...`}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all resize-none font-medium shadow-inner" 
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <button disabled={isSaving} onClick={updateAdn} className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] transition-all flex justify-center items-center gap-3 shadow-2xl shadow-emerald-500/20">{isSaving ? <Loader2 className="animate-spin" /> : 'Consolidar Entendimiento'}</button>
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
