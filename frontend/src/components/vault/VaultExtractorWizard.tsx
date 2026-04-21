import { useState } from 'react';
import { Package, ShieldCheck, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabase';

export const VaultExtractorWizard = ({ onComplete }: { onComplete: () => void }) => {
    const { projectId, tenantId } = useProject();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selections, setSelections] = useState({
        stack: true,
        diseno: true,
        presupuesto: false
    });
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

    const handleCosecha = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Si el usuario eligió el stack, lo persistimos en la Bóveda
            if (selections.stack) {
                const response = await fetch(`${API_BASE}/api/Finance/vault/stack`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`,
                        'X-Tenant-Id': tenantId || ''
                    },
                    body: JSON.stringify({
                        Nombre: `Stack Reutilizable - Proyecto ${projectId?.substring(0, 6)}`,
                        PayloadTecnico: {
                            selections,
                            cosechadoEn: new Date().toISOString(),
                            projectId
                        }
                    })
                });

                if (!response.ok) throw new Error();
            }

            setStep(3);
        } catch (err) {
            alert("⚠️ Se nos lavó el mate. No pudimos guardar los activos en la Bóveda.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Cabecera del Wizard */}
            <div className="p-8 bg-zinc-800/50 border-b border-zinc-800 text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-zinc-900 mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                    <Package size={32} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Cosecha de Conocimiento</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Fase 5 - Extracción a la Bóveda</p>
            </div>

            <div className="p-10 space-y-8">
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                            ¡Felicitaciones por llegar al deploy! 🎉 Seleccioná qué partes de este proyecto querés guardar en tu **Bóveda Personal**.
                        </p>
                        
                        <div className="space-y-3">
                            {[
                                { id: 'stack', label: 'Stack Tecnológico (Framework, BD, etc)', icon: <ShieldCheck size={16} /> },
                                { id: 'diseno', label: 'Diagrama de Arquitectura (DBML)', icon: <Sparkles size={16} /> },
                                { id: 'presupuesto', label: 'Plantilla de Cotización', icon: <Package size={16} /> }
                            ].map((item) => (
                                <label key={item.id} className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition-all">
                                    <input 
                                        type="checkbox" 
                                        checked={(selections as any)[item.id]} 
                                        onChange={() => setSelections(prev => ({ ...prev, [item.id]: !(prev as any)[item.id] }))}
                                        className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-tight">
                                        <span className="text-emerald-500">{item.icon}</span>
                                        {item.label}
                                    </div>
                                </label>
                            ))}
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 group"
                        >
                            Confirmar Selección
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 text-center py-6 animate-in zoom-in-95">
                        {loading ? (
                            <div className="space-y-4">
                                <Loader2 className="animate-spin text-emerald-500 mx-auto" size={40} />
                                <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest animate-pulse">Guardando en la Bóveda Electrónica...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm text-zinc-400 font-medium">
                                    Se empaquetará la configuración técnica como un activo reutilizable. ¿Estás listo para la cosecha?
                                </p>
                                <button 
                                    onClick={handleCosecha}
                                    className="w-full py-4 bg-emerald-500 text-zinc-900 font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-emerald-500/20"
                                >
                                    ¡Ejecutar Cosecha Exponencial!
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-6 space-y-6 animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                            <Check size={40} />
                        </div>
                        <div className="space-y-2">
                             <h3 className="text-xl font-black text-white uppercase">¡Cosecha Exitosa!</h3>
                             <p className="text-xs text-zinc-500 font-medium italic">"En el próximo proyecto, esto va a ser soplar y hacer botellas."</p>
                        </div>
                        <button 
                            onClick={onComplete}
                            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest text-xs rounded-xl"
                        >
                            Finalizar Proyecto 🧉
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
