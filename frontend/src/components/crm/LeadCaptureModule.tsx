import React, { useState, useEffect } from 'react';
import { Rocket, Copy, RefreshCw } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { TemplatePickerModal } from '../shared/TemplatePickerModal';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

export const LeadCaptureModule = () => {
    const { tenantId } = useProject();
    const [template, setTemplate] = useState<any>(null);
    const [availableForms, setAvailableForms] = useState<any[]>([]);
    const [showSelector, setShowSelector] = useState(false);
    const [loading, setLoading] = useState(true);

    const publicLink = `${window.location.origin}/public-form/${tenantId}`;

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // 1. Cargar todas las plantillas para el selector
                const resForms = await fetch(`${API_BASE}/api/FormLibrary`, {
                    headers: { 
                        'Authorization': `Bearer ${session?.access_token}`,
                        'X-Tenant-Id': tenantId || '' 
                    }
                });
                if (resForms.ok) setAvailableForms(await resForms.json());

                // 2. Cargar la plantilla actualmente asignada
                const resCurrent = await fetch(`${API_BASE}/api/Public/form/${tenantId}?tipo=lead`);
                if (resCurrent.ok) setTemplate(await resCurrent.json());
            } finally {
                setLoading(false);
            }
        };
        if (tenantId) load();
    }, [tenantId]);

    const handleSelectTemplate = async (id: string) => {
        const selected = availableForms.find(f => f.id === id);
        setTemplate(selected);
        setShowSelector(false);
        Swal.fire({ icon: 'success', title: 'Plantilla BANT Activada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    };

    if (loading) return <div className="h-20 animate-pulse bg-zinc-900 rounded-3xl" />;

    return (
        <section className="bg-zinc-900 border-2 border-zinc-800 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Rocket size={150} className="text-blue-500" />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl"><Rocket className="text-zinc-950" size={20} /></div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Lead Magic Link</h2>
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Captura automatizada de requerimientos externos</p>
                </div>

                <div className="flex items-center gap-3">
                    {template && (
                        <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <span className="text-[10px] text-zinc-500 font-black uppercase block">Modelo Activo</span>
                            <span className="text-xs text-blue-400 font-bold">{template.nombre}</span>
                        </div>
                    )}
                    <button onClick={() => setShowSelector(true)} className="p-3 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"><RefreshCw size={20} /></button>
                </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-3xl flex items-center gap-4 group/link">
                <input readOnly value={publicLink} className="flex-1 bg-transparent border-none text-zinc-400 text-xs font-mono outline-none px-2" />
                <button onClick={() => { navigator.clipboard.writeText(publicLink); Swal.fire({ icon: 'success', title: 'Copiado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 }); }} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] rounded-2xl transition-all shadow-lg">Copy Link</button>
            </div>

            <TemplatePickerModal isOpen={showSelector} onClose={() => setShowSelector(false)} type="lead" availableForms={availableForms} onSelect={(id) => handleSelectTemplate(id)} />
        </section>
    );
};
