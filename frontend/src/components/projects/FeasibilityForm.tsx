import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { Cpu, Layers, Zap, Loader2, Save, Plus, RefreshCw } from 'lucide-react';
import { TemplatePickerModal } from '../shared/TemplatePickerModal';
import { ProjectStandardsAside } from './ProjectStandardsAside';
import { StackBuilder } from './StackBuilder';
import ArchitectureBlueprint from '../../pages/projects/components/ArchitectureBlueprint';

export const FeasibilityForm = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { tenantId } = useProject();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [availableForms, setAvailableForms] = useState<any[]>([]);
  const [adnTemplate, setAdnTemplate] = useState<any>(null);
  const [adnData, setAdnData] = useState<any>(null);
  const [showAdnSelector, setShowAdnSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'engineering' | 'stack' | 'blueprint'>('engineering');
  const [stackCount, setStackCount] = useState(0);
  const [standardsCount, setStandardsCount] = useState(0);

  useEffect(() => {
    const init = async () => {
        try {
            const project = await api.get(`/Project/${projectId}`);
            setAdnData(project.contextoJson?.adn?.data || {});
            if (project.contextoJson?.adn?.plantillaId) fetchTemplate(project.contextoJson.adn.plantillaId);
            const forms = await api.get(`/FormLibrary`);
            setAvailableForms(forms);
        } catch (err) { console.error("Error init:", err); }
    };
    init();
    fetchStatus();
  }, [tenantId, projectId]);

  const fetchStatus = async () => {
    try {
        const [stack, standards] = await Promise.all([
            api.get(`/Stack/project/${projectId}`),
            api.get(`/Project/${projectId}/standards`)
        ]);
        setStackCount(stack.length);
        setStandardsCount(standards.length);
    } catch (err) { console.error("Error status:", err); }
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

  const handleBrainstorming = async () => {
    const { value: idea } = await Swal.fire({ title: '💡 Brainstorming IA', input: 'textarea', showCancelButton: true, background: '#18181b', color: '#fff' });
    if (idea) {
      setIsBrainstorming(true);
      try {
        const res = await api.post(`/FormLibrary/generate-brainstorming`, { 
            idea, 
            formularioId: adnTemplate?.id || availableForms.find(f => (f.tipo || f.Tipo)?.toLowerCase() === 'idea_propia')?.id 
        });
        const { prompt } = res;
        await Swal.fire({ title: '🧠 Oráculo', html: `<textarea id="ai-prompt" class="w-full h-64 p-3 bg-zinc-950 text-emerald-400 text-xs font-mono border border-zinc-800 rounded-lg">${prompt}</textarea>`, confirmButtonText: 'Copiar', background: '#18181b', color: '#fff', preConfirm: () => navigator.clipboard.writeText((document.getElementById('ai-prompt') as HTMLTextAreaElement).value) });
        const { value: jsonResult } = await Swal.fire({ title: 'Pegar JSON', input: 'textarea', background: '#18181b', color: '#fff' });
        if (jsonResult) setAdnData(JSON.parse(jsonResult));
      } finally { setIsBrainstorming(false); }
    }
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
        <div><h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">ADN Hub <span className="text-emerald-500">Fase 0</span></h1><p className="text-zinc-500 font-medium mt-2">Definición de ingeniería y procesos técnicos del proyecto.</p></div>
        <button onClick={handleBrainstorming} disabled={isBrainstorming} className="px-8 py-4 bg-emerald-500 text-zinc-950 font-black rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">{isBrainstorming ? <Loader2 className="animate-spin" /> : <Zap size={20} />}<span>Brainstorming IA</span></button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
            {/* TABS DE NAVEGACIÓN DE ADN */}
            <div className="flex bg-zinc-900/50 p-1.5 rounded-[2rem] border border-zinc-800 backdrop-blur-md sticky top-4 z-40 shadow-2xl">
                <button 
                    onClick={() => setActiveTab('engineering')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase transition-all ${activeTab === 'engineering' ? 'bg-zinc-800 text-emerald-500 shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Cpu size={18} /> 01. Ingeniería
                </button>
                <button 
                    onClick={() => setActiveTab('stack')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase transition-all ${activeTab === 'stack' ? 'bg-zinc-800 text-emerald-500 shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Layers size={18} /> 02. Stack
                </button>
                <button 
                    onClick={() => setActiveTab('blueprint')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase transition-all ${activeTab === 'blueprint' ? 'bg-zinc-800 text-emerald-500 shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Zap size={18} /> 03. Blueprint
                </button>
            </div>

            <div className="min-h-[600px]">
                {activeTab === 'engineering' && (
                    <section className="bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] p-10 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-4"><div className="p-4 bg-emerald-500 rounded-3xl"><Cpu className="text-zinc-950" size={28} /></div><div><h2 className="text-3xl font-black text-white italic uppercase">ADN Interno</h2><p className="text-zinc-500 text-xs font-bold uppercase">Estructura Técnica</p></div></div>
                        {!adnTemplate ? (
                            <div className="py-20 text-center space-y-6 border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-950/30">
                                <Plus size={32} className="text-zinc-700 mx-auto" /><p className="text-zinc-500 text-sm italic">Asigna un modelo de ingeniería para comenzar.</p>
                                <button onClick={() => setShowAdnSelector(true)} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-emerald-500/10">Asignar Modelo ADN</button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-zinc-950 p-6 rounded-[2rem] border border-emerald-500/10 shadow-lg">
                                    <div><p className="text-[10px] text-emerald-500 font-black uppercase mb-1">Modelo Activo</p><p className="text-lg text-zinc-100 font-black italic uppercase">{adnTemplate.nombre}</p></div>
                                    <button onClick={() => setShowAdnSelector(true)} className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl hover:text-emerald-400 transition-all"><RefreshCw size={20} /></button>
                                </div>
                                <div className="space-y-6">
                                    {(adnTemplate.configuracionJson || []).map((q: any, i: number) => (
                                        <div key={i} className="space-y-3">
                                            <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">{i+1}. {q.pregunta}</label>
                                            {(q.tipoInput || q.tipo_input) === 'textarea' ? (
                                                <textarea value={adnData?.[q.etiquetaSemantica || q.etiqueta_semantica] || ''} onChange={e => setAdnData({ ...adnData, [q.etiquetaSemantica || q.etiqueta_semantica]: e.target.value })} rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-sm text-zinc-300 outline-none focus:border-emerald-500/50 transition-all resize-none font-medium" />
                                            ) : (
                                                <input value={adnData?.[q.etiquetaSemantica || q.etiqueta_semantica] || ''} onChange={e => setAdnData({ ...adnData, [q.etiquetaSemantica || q.etiqueta_semantica]: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-sm text-zinc-300 outline-none focus:border-emerald-500/50 transition-all font-medium" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button disabled={isSaving} onClick={updateAdn} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-sm rounded-2xl transition-all flex justify-center items-center gap-3 shadow-lg shadow-emerald-500/10">{isSaving ? <Loader2 className="animate-spin" /> : 'Consolidar Ingeniería ADN'}</button>
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
      </div>
    </div>
  );
};
