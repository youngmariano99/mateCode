import { useEffect, useState } from 'react';
import { X, Brain, Copy, Check, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import type { Ticket } from '../agile/types';
import Swal from 'sweetalert2';


export const GeneradorPromptTicketModal = ({ ticket, onClose }: { ticket: Ticket, onClose: () => void }) => {
    const { tenantId } = useProject();
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await api.get('/PromptLibrary', { params: { fase: 'Kanban' } });
                setTemplates(data);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleGenerate = async () => {
        if (!selectedTemplate) return;
        setIsGenerating(true);
        try {
            const data = await api.post('/PromptLibrary/generate-contextual', {
                templateId: selectedTemplate,
                projectId: ticket.proyectoId,
                ticketId: ticket.id
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                            <Brain className="text-zinc-950" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">AI Brain Oráculo</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Cerebro Contextual MateCode</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all text-xl">✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {!generatedPrompt ? (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    1. Selección de plantilla
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {loading ? (
                                        <div className="flex items-center gap-3 text-zinc-500 italic text-sm p-4"><Loader2 className="animate-spin" /> Cargando oráculos...</div>
                                    ) : templates.length === 0 ? (
                                        <div className="p-4 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-xs">No hay plantillas para Kanban. Creá una en la Bóveda.</div>
                                    ) : templates.map(t => (
                                        <button 
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t.id)}
                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                                                selectedTemplate === t.id 
                                                ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg' 
                                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                            }`}
                                        >
                                            <div>
                                                <div className="font-bold text-sm">{t.titulo}</div>
                                                <div className="text-[10px] opacity-60">{t.descripcion}</div>
                                            </div>
                                            <ChevronRight size={16} className={selectedTemplate === t.id ? 'text-emerald-500' : 'text-zinc-700'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={!selectedTemplate || isGenerating}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                                    !selectedTemplate || isGenerating 
                                    ? 'bg-zinc-800 text-zinc-500' 
                                    : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-xl shadow-emerald-500/10'
                                }`}
                            >
                                {isGenerating ? 'Inyectando Contexto...' : 'Generar Prompt Maestro ✨'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Prompt Contextualizado
                                    </label>
                                    <button onClick={() => setGeneratedPrompt("")} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase">← Cambiar Plantilla</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                    <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 font-mono text-[11px] text-zinc-300 leading-loose max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                                        {generatedPrompt}
                                    </div>
                                    <button 
                                        onClick={handleCopy}
                                        className="absolute top-4 right-4 p-3 bg-zinc-900/80 backdrop-blur hover:bg-emerald-500 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all shadow-2xl"
                                    >
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[10px] text-emerald-400/80 leading-relaxed italic text-center">
                                "Copiá este bloque y pegalo en tu IA preferida. ¡Contiene todo el ADN y las historias del proyecto!"
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                        Cerrar Oráculo
                    </button>
                </div>
            </div>
        </div>
    );
};
