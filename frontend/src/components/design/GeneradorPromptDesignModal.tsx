import { useEffect, useState } from 'react';
import { X, Brain, Copy, Check, Loader2, Zap, Shield, Database, LayoutList, FileJson, AlertCircle } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';

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

    // Bloques Editables
    const [persona, setPersona] = useState("");
    const [tarea, setTarea] = useState("");

    // Switches de Contexto
    const [ctx, setCtx] = useState({ 
        adn: true, 
        stack: true, 
        bdd: true, 
        blueprint: false 
    });

    // Estado de los datos del proyecto (para alertas)
    const [dataStatus, setDataStatus] = useState({
        adn: false,
        stack: false,
        bdd: false,
        blueprint: false
    });

    useEffect(() => {
        const fetchEverything = async () => {
            try {
                // 1. Cargar Plantillas
                const templates: any[] = await api.get('/PromptLibrary', { params: { fase: 'Fase 2' } });
                
                // Prioridad: 
                // 1. Coincidencia exacta por tipoDiagrama (ERD, SITEMAP, etc.)
                // 2. Coincidencia por título
                // 3. Primera plantilla de la lista
                const match = templates.find(t => t.tipoDiagrama?.toUpperCase() === diagramType.toUpperCase()) || 
                             templates.find(t => t.titulo.toLowerCase().includes(diagramType.toLowerCase())) || 
                             templates[0];
                
                setTemplate(match);
                if (match) {
                    // Cargamos los bloques de la plantilla maestra
                    setPersona(match.bloquePersona || "Actúa como un Arquitecto de Software Senior y Experto en Diagramación.");
                    setTarea(match.bloqueTarea || "Generar el diseño técnico detallado basándote en el contexto anterior.");
                    
                    // Sincronizamos los switches con las preferencias de la plantilla
                    setCtx({ 
                        adn: match.inyectaAdn, 
                        stack: match.inyectaStack, 
                        bdd: match.inyectaBdd,
                        blueprint: match.inyectaBlueprint || false
                    });
                }

                // 2. Verificar estado de datos del proyecto (ADN, Stack, etc.)
                const project: any = await api.get(`/Project/${projectId}`);
                const stack: any[] = await api.get(`/Project/${projectId}/stack`);
                const stories: any[] = await api.get(`/Agile/Project/${projectId}/stories`);
                const standards: any[] = await api.get(`/Standard/Project/${projectId}`);

                // Refinamos la validación de ADN
                const adnValido = project.contextoJson && 
                                 typeof project.contextoJson === 'object' && 
                                 Object.keys(project.contextoJson).length > 0 &&
                                 JSON.stringify(project.contextoJson) !== "{}";

                setDataStatus({
                    adn: adnValido,
                    stack: stack && stack.length > 0,
                    bdd: stories && stories.length > 0,
                    blueprint: standards && standards.length > 0
                });

            } finally {
                setLoading(false);
            }
        };
        fetchEverything();
    }, [diagramType, projectId]);

    const handleGenerate = async () => {
        if (!template) return;
        setIsGenerating(true);
        try {
            const data = await api.post('/PromptLibrary/generate-contextual', {
                templateId: template.id,
                projectId: projectId,
                overrideAdn: ctx.adn,
                overrideBdd: ctx.bdd,
                overrideStack: ctx.stack,
                overridePersona: persona,
                overrideTarea: tarea
            });
            setGeneratedPrompt(data.prompt);
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

    const ContextSwitch = ({ id, label, icon: Icon, active, missing }: { id: string, label: string, icon: any, active: boolean, missing: boolean }) => (
        <button 
            onClick={() => setCtx(prev => ({ ...prev, [id]: !active }))}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                active 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 opacity-60 hover:opacity-100'
            }`}
        >
            <div className={`p-2 rounded-lg ${active ? 'bg-emerald-500/20' : 'bg-zinc-800'}`}>
                <Icon size={16} />
            </div>
            <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-left">{label}</span>
                {active && missing && (
                    <span className="text-[8px] text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                        <AlertCircle size={8} /> Falta Data
                    </span>
                )}
            </div>
            {/* Toggle Estilo iOS */}
            <div className={`ml-auto w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-xl">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-5xl rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                
                {/* Header Premium */}
                <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/20">
                            <Brain className="text-zinc-950" size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">AI Design Oracle</h3>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-full uppercase border border-emerald-500/20">Prompt Assembler</span>
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Engine v2.0 Modular</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-hidden flex lg:flex-row flex-col">
                    
                    {/* Panel de Configuración (Izquierda) */}
                    <div className="lg:w-1/2 p-8 overflow-y-auto space-y-8 border-r border-zinc-800 bg-zinc-900/30 custom-scrollbar">
                        
                        {/* Bloque 1: Persona */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Shield className="text-emerald-500" size={16} />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Identidad (Persona)</h4>
                            </div>
                            <textarea 
                                value={persona}
                                onChange={(e) => setPersona(e.target.value)}
                                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:border-emerald-500/50 outline-none transition-all resize-none font-medium leading-relaxed"
                                placeholder="Actúa como un..."
                            />
                        </div>

                        {/* Bloque 2: Contexto (Switches) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Database className="text-emerald-500" size={16} />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Inyección de Contexto</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <ContextSwitch id="adn" label="ADN Estratégico" icon={Zap} active={ctx.adn} missing={!dataStatus.adn} />
                                <ContextSwitch id="stack" label="Stack Tecnológico" icon={LayoutList} active={ctx.stack} missing={!dataStatus.stack} />
                                <ContextSwitch id="bdd" label="Historias / BDD" icon={Check} active={ctx.bdd} missing={!dataStatus.bdd} />
                                <ContextSwitch id="blueprint" label="Blueprint (Estándares)" icon={FileJson} active={ctx.blueprint} missing={!dataStatus.blueprint} />
                            </div>
                        </div>

                        {/* Bloque 3: Tarea */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Zap className="text-emerald-500" size={16} />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Objetivo Táctico (Tarea)</h4>
                            </div>
                            <textarea 
                                value={tarea}
                                onChange={(e) => setTarea(e.target.value)}
                                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:border-emerald-500/50 outline-none transition-all resize-none font-medium leading-relaxed"
                                placeholder="Analizá el contexto y generá..."
                            />
                        </div>

                        {/* Bloque 4: Formato (Locked) */}
                        <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-800 rounded-lg">
                                    <FileJson className="text-zinc-500" size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Salida Estricta</p>
                                    <p className="text-xs font-black text-emerald-500 uppercase">{diagramType} JSON Protocol</p>
                                </div>
                            </div>
                            <div className="p-1 bg-emerald-500/20 text-emerald-500 rounded-md">
                                <Check size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Panel de Resultado (Derecha) */}
                    <div className="lg:w-1/2 p-8 flex flex-col bg-zinc-950/50 min-h-0 overflow-hidden">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="animate-spin text-emerald-500" size={48} />
                                <p className="text-zinc-500 text-sm font-medium animate-pulse">Sincronizando oráculo...</p>
                            </div>
                        ) : !generatedPrompt ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center px-6">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-3xl"></div>
                                    <div className="relative w-32 h-32 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-6xl shadow-2xl">⚡</div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-2xl font-black text-white tracking-tighter">¿Listo para el ensamblaje?</h4>
                                    <p className="text-zinc-500 text-sm leading-relaxed">Combinaremos tus bloques editables con el contexto real del proyecto para generar una instrucción de diseño infalible.</p>
                                </div>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="group relative px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-widest rounded-[2rem] shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all flex items-center gap-4 active:scale-95 disabled:opacity-50"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="group-hover:scale-125 transition-transform" />}
                                    <span>{isGenerating ? 'Orquestando...' : 'Ensamblar Prompt'}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0 space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 overflow-hidden">
                                <div className="flex items-center justify-between flex-shrink-0">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Prompt Final Ensamblado</h4>
                                    <button onClick={() => setGeneratedPrompt("")} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase transition-colors italic">← Re-ajustar Bloques</button>
                                </div>
                                <div className="relative group flex-1 min-h-0">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                    <div className="relative h-full bg-zinc-950 border border-zinc-800/50 rounded-3xl p-8 font-mono text-[11px] text-zinc-300 leading-relaxed overflow-y-auto whitespace-pre-wrap selection:bg-emerald-500/30 custom-scrollbar">
                                        {generatedPrompt}
                                    </div>
                                    <button 
                                        onClick={handleCopy}
                                        className="absolute top-6 right-6 p-4 bg-emerald-500 text-zinc-950 rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all"
                                        title="Copiar al Portapapeles"
                                    >
                                        {copied ? <Check size={24} /> : <Copy size={24} />}
                                    </button>
                                </div>
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex-shrink-0">
                                    <p className="text-[10px] text-emerald-500/70 text-center font-medium italic">
                                        💡 Tip: Pegá este prompt en Claude 3.5 Sonnet o GPT-4 para obtener resultados óptimos.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
