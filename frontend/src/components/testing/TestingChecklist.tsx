import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/apiClient';
import { Check, X, ClipboardCheck, ArrowRight, Loader2, Bug } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabase';
import type { Historia } from '../agile/types';

import { useWorkspaceStore } from '../../store/useWorkspaceStore';

interface TestItem extends Historia {
  resultado: 'Pendiente' | 'Pasó' | 'Falló';
}

export const TestingChecklist = () => {
    const { id: paramProjectId } = useParams<{ id: string }>();
    const { projectId: contextProjectId, tenantId } = useProject();
    const activeProjectId = useWorkspaceStore(state => state.activeProjectId);
    
    // Prioridad: Store (Spatial) > Context > Params
    const projectId = activeProjectId || paramProjectId || contextProjectId;
    
    const [items, setItems] = useState<TestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportingBug, setReportingBug] = useState<string | null>(null);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                // Usamos el endpoint de Agile para traer historias de este proyecto
                const data = await api.get(`/Agile/projects/${projectId}/stories`);

                setItems(Array.isArray(data) ? data.map((h: any) => ({ ...h, resultado: 'Pendiente' })) : []);
            } catch (err) {
                console.error("Error cargando QA", err);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchStories();
    }, [projectId, tenantId]);

    const handleResult = async (id: string, result: 'Pasó' | 'Falló') => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, resultado: result } : item));
        
        if (result === 'Falló') {
            const item = items.find(i => i.id === id);
            if (!item) return;

            setReportingBug(id);
            try {
                await api.post('/Kanban/testing/report-bug', {
                    ProyectoId: projectId,
                    HistoriaId: id,
                    Descripcion: `Falla en QA de historia: ${item.titulo}. Verificar criterios BDD.`
                });

                alert("🛠️ Bug reportado automáticamente al tablero Kanban.");
            } catch (err) {
                alert("⚠️ Se nos lavó el mate. No pudimos reportar el Bug al Kanban.");
            } finally {
                setReportingBug(null);
            }
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <ClipboardCheck className="text-emerald-500" />
                        QA Checklist
                    </h2>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Validación técnica contra BDD</p>
                </div>
                <div className="flex gap-4">
                     <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-zinc-400">PASÓ: {items.filter(i => i.resultado === 'Pasó').length}</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-bold text-zinc-400">FALLÓ: {items.filter(i => i.resultado === 'Falló').length}</span>
                     </div>
                </div>
            </div>

            <div className="grid gap-4">
                {items.length > 0 ? items.map((item) => (
                    <div key={item.id} className="glass-card group hover:border-zinc-700 transition-all overflow-hidden">
                        <div className="flex items-center gap-6 p-6">
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-zinc-200">{item.titulo}</h3>
                                {item.criteriosBdd && (
                                    <p className="text-[11px] text-zinc-500 mt-2 font-mono italic leading-relaxed">
                                        {item.criteriosBdd}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleResult(item.id, 'Pasó')}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                        item.resultado === 'Pasó' ? 'bg-emerald-500 text-zinc-900' : 'bg-zinc-800 text-zinc-500 hover:text-emerald-500'
                                    }`}
                                >
                                    <Check size={20} />
                                </button>
                                <button
                                    disabled={reportingBug === item.id}
                                    onClick={() => handleResult(item.id, 'Falló')}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                        item.resultado === 'Falló' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-red-500'
                                    }`}
                                >
                                    {reportingBug === item.id ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-[2rem]">
                        <Bug className="mx-auto text-zinc-700 mb-4" size={40} />
                        <h4 className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Sin historias para testear</h4>
                        <p className="text-zinc-600 text-[10px] mt-2 max-w-xs mx-auto italic">
                            Parece que no hay Historias de Usuario definidas en la Fase 1. El QA Checklist se genera automáticamente a partir de ellas.
                        </p>
                    </div>
                )}
            </div>

            {items.length > 0 && items.filter(i => i.resultado !== 'Pendiente').length === items.length && (
                <div className="mt-12 p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 text-zinc-900">
                        <Check size={32} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase italic">Testing Finalizado</h3>
                        <p className="text-xs text-zinc-400 font-medium">Ciclo de calidad completo para este sprint. Ya podés pasar al deploy.</p>
                    </div>
                    <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-lg transition-all flex items-center gap-2">
                        Continuar a Cosecha
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};
