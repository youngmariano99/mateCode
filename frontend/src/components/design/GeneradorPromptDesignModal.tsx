import { useEffect, useState } from 'react';
import { X, Brain, Copy, Check, Loader2, Zap, Settings2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const API_BASE = 'http://localhost:5241';

interface Props {
    projectId: string;
    diagramType: string;
    onClose: () => void;
}

export const GeneradorPromptDesignModal = ({ projectId, diagramType, onClose }: Props) => {
    const { tenantId } = useProject();
    const [template, setTemplate] = useState<any>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Switches de contexto locales (sobrescriben la plantilla)
    const [ctx, setCtx] = useState({ adn: true, bdd: true, stack: false });

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch(`${API_BASE}/api/PromptLibrary?fase=Fase 2`, {
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        'X-Tenant-Id': tenantId || ''
                    }
                });
                if (response.ok) {
                    const templates: any[] = await response.json();
                    // Buscar la plantilla que mejor encaja con el tipo de diagrama
                    const match = templates.find(t => {
                        const tags = typeof t.etiquetasJson === 'string' ? JSON.parse(t.etiquetasJson) : (t.etiquetasJson || []);
                        return t.titulo.toLowerCase().includes(diagramType.toLowerCase()) || 
                               tags.some((e: string) => e.toLowerCase().includes(diagramType.toLowerCase()));
                    }) || templates[0];
                    
                    setTemplate(match);
                    if (match) {
                        setCtx({ 
                            adn: match.inyectaAdn, 
                            bdd: match.inyectaBdd, 
                            stack: match.inyectaStack 
                        });
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [tenantId, diagramType]);

    const handleGenerate = async () => {
        if (!template) return;
        setIsGenerating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${API_BASE}/api/PromptLibrary/generate-contextual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                    'X-Tenant-Id': tenantId || ''
                },
                body: JSON.stringify({
                    templateId: template.id,
                    projectId: projectId,
                    overrideAdn: ctx.adn,
                    overrideBdd: ctx.bdd,
                    overrideStack: ctx.stack
                })
            });
            if (response.ok) {
                const data = await response.json();
                setGeneratedPrompt(data.prompt);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        Swal.fire({ icon: 'success', title: '¡Copiado!', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: '#18181b', color: '#fff' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header Dinámico */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20">
                            <Brain className="text-zinc-950" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">AI Design Oracle</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Generando Contexto para {diagramType}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all">✕</button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Panel Lateral: Configuración de Contexto */}
                    <div className="w-full md:w-72 bg-zinc-950/50 border-r border-zinc-800 p-6 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Settings2 size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Ajustar Contexto</span>
                            </div>
                            
                            <div className="space-y-3">
                                {[
                                    { id: 'adn', label: 'Inyectar ADN (Fase 0)', icon: '🧬' },
                                    { id: 'bdd', label: 'Historias/BDD (Fase 1)', icon: '📖' },
                                    { id: 'stack', label: 'Stack Técnico', icon: '🛠' }
                                ].map(item => (
                                    <label key={item.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${ctx[item.id as keyof typeof ctx] ? 'bg-emerald-500/5 border-emerald-500/30 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">{item.icon}</span>
                                            <span className="text-[10px] font-bold">{item.label}</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={ctx[item.id as keyof typeof ctx]} 
                                            onChange={(e) => setCtx({...ctx, [item.id]: e.target.checked})}
                                            className="w-4 h-4 rounded border-zinc-800 bg-transparent text-emerald-500 focus:ring-0" 
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                             <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                                "Podés activar o desactivar qué información querés que la IA sepa antes de generar el diagrama."
                             </p>
                        </div>
                    </div>

                    {/* Panel Central: Resultado / Generación */}
                    <div className="flex-1 p-8 overflow-y-auto flex flex-col">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="animate-spin text-emerald-500" size={40} />
                                <p className="text-zinc-500 text-sm italic">Cargando oráculo de diseño...</p>
                            </div>
                        ) : !generatedPrompt ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-3xl">🧩</div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold">¿Listo para la magia?</h4>
                                    <p className="text-zinc-500 text-sm max-w-md">Usaremos la plantilla <span className="text-emerald-400 font-bold">"{template?.titulo}"</span> de tu bóveda para generar esta instrucción.</p>
                                </div>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all flex items-center gap-3"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                                    {isGenerating ? 'Escribiendo...' : 'Generar Prompt Ahora'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                                    <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 font-mono text-[11px] text-zinc-300 leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap selection:bg-emerald-500/30">
                                        {generatedPrompt}
                                    </div>
                                    <button 
                                        onClick={handleCopy}
                                        className="absolute top-4 right-4 p-3 bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all shadow-xl"
                                    >
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <p className="text-[10px] text-zinc-500">Copiá este bloque y pegalo en Claude o ChatGPT.</p>
                                    <button onClick={() => setGeneratedPrompt("")} className="text-[10px] font-bold text-emerald-400 hover:underline">← Regenerar con otro contexto</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Cerrar Oráculo</button>
                </div>
            </div>
        </div>
    );
};
