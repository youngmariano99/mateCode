import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProject } from '../../context/ProjectContext';
import Swal from 'sweetalert2';
import { Cpu, Layers, Zap, Loader2, Save, Plus, RefreshCw } from 'lucide-react';
import { TemplatePickerModal } from '../shared/TemplatePickerModal';
import { ProjectStandardsAside } from './ProjectStandardsAside';
import { StackBuilder } from './StackBuilder';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

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

  useEffect(() => {
    const init = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const projRes = await fetch(`${API_BASE}/api/Project/${projectId}`, { headers: { 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId || '' } });
            if (projRes.ok) {
                const project = await projRes.json();
                setAdnData(project.contextoJson?.adn?.data || {});
                if (project.contextoJson?.adn?.plantillaId) fetchTemplate(project.contextoJson.adn.plantillaId);
            }
            const res = await fetch(`${API_BASE}/api/FormLibrary`, { headers: { 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId || '' } });
            if (res.ok) setAvailableForms(await res.json());
        } catch (err) { console.error("Error init:", err); }
    };
    init();
  }, [tenantId, projectId]);

  const fetchTemplate = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${API_BASE}/api/FormLibrary/${id}`, { headers: { 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId || '' } });
    if (res.ok) setAdnTemplate(await res.json());
  };

  const handleAssignTemplate = async (templateId: string) => {
    if (Object.keys(adnData || {}).length > 0) {
        const result = await Swal.fire({ title: '¿Cambiar ADN?', text: 'Ya existen datos de ingeniería. ¿Deseas cambiar el modelo?', icon: 'warning', showCancelButton: true, background: '#18181b', color: '#fff' });
        if (!result.isConfirmed) return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    const projRes = await fetch(`${API_BASE}/api/Project/${projectId}`, { headers: { 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId || '' } });
    const project = await projRes.json();
    const ctx = project.contextoJson || {};
    ctx.adn = { ...ctx.adn, plantillaId: templateId };

    await fetch(`${API_BASE}/api/Project/${projectId}/feasibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId || '' },
        body: JSON.stringify(ctx),
    });
    fetchTemplate(templateId);
    setShowAdnSelector(false);
  };

  const handleBrainstorming = async () => {
    const { value: idea } = await Swal.fire({ title: '💡 Brainstorming IA', input: 'textarea', showCancelButton: true, background: '#18181b', color: '#fff' });
    if (idea) {
      setIsBrainstorming(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_BASE}/api/FormLibrary/generate-brainstorming`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId || '' },
          body: JSON.stringify({ idea, formularioId: adnTemplate?.id || availableForms.find(f => (f.tipo || f.Tipo)?.toLowerCase() === 'idea_propia')?.id })
        });
        if (res.ok) {
          const { prompt } = await res.json();
          await Swal.fire({ title: '🧠 Oráculo', html: `<textarea id="ai-prompt" class="w-full h-64 p-3 bg-zinc-950 text-emerald-400 text-xs font-mono border border-zinc-800 rounded-lg">${prompt}</textarea>`, confirmButtonText: 'Copiar', background: '#18181b', color: '#fff', preConfirm: () => navigator.clipboard.writeText((document.getElementById('ai-prompt') as HTMLTextAreaElement).value) });
          const { value: jsonResult } = await Swal.fire({ title: 'Pegar JSON', input: 'textarea', background: '#18181b', color: '#fff' });
          if (jsonResult) setAdnData(JSON.parse(jsonResult));
        }
      } finally { setIsBrainstorming(false); }
    }
  };

  const updateAdn = async () => {
    setIsSaving(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const projRes = await fetch(`${API_BASE}/api/Project/${projectId}`, { headers: { 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId || '' } });
        const ctx = (await projRes.json()).contextoJson || {};
        ctx.adn = { ...ctx.adn, data: adnData };
        await fetch(`${API_BASE}/api/Project/${projectId}/feasibility`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId || '' }, body: JSON.stringify(ctx) });
        Swal.fire({ icon: 'success', title: 'ADN Consolidado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div><h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">ADN Hub <span className="text-emerald-500">Fase 0</span></h1><p className="text-zinc-500 font-medium mt-2">Definición de ingeniería y procesos técnicos del proyecto.</p></div>
        <button onClick={handleBrainstorming} disabled={isBrainstorming} className="px-8 py-4 bg-emerald-500 text-zinc-950 font-black rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">{isBrainstorming ? <Loader2 className="animate-spin" /> : <Zap size={20} />}<span>Brainstorming IA</span></button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
            <section className="bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] p-10 space-y-8 min-h-[350px]">
                <div className="flex items-center gap-4"><div className="p-4 bg-emerald-500 rounded-3xl"><Cpu className="text-zinc-950" size={28} /></div><div><h2 className="text-3xl font-black text-white italic uppercase">ADN Interno</h2><p className="text-zinc-500 text-xs font-bold uppercase">Estructura Técnica</p></div></div>
                {!adnTemplate ? (
                    <div className="py-12 text-center space-y-6 border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-950/30">
                        <Plus size={32} className="text-zinc-700 mx-auto" /><p className="text-zinc-500 text-sm italic">Asigna un modelo de ingeniería.</p>
                        <button onClick={() => setShowAdnSelector(true)} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all">Asignar Modelo ADN</button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
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
                        <button disabled={isSaving} onClick={updateAdn} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-sm rounded-2xl transition-all flex justify-center items-center gap-3">{isSaving ? <Loader2 className="animate-spin" /> : 'Consolidar Ingeniería ADN'}</button>
                    </div>
                )}
            </section>

            {/* SECCIÓN DEL STACK TECNOLÓGICO */}
            <StackBuilder projectId={projectId!} tenantId={tenantId!} />
        </div>
        <ProjectStandardsAside onNavigatePhase1={() => navigate(`/projects/${projectId}/phase-1-requirements`)} />
        <TemplatePickerModal isOpen={showAdnSelector} onClose={() => setShowAdnSelector(false)} type="adn" availableForms={availableForms} onSelect={handleAssignTemplate} />
      </div>
    </div>
  );
};
