import { useEffect, useState } from 'react';
import { X, Sparkles, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabase';
import type { Ticket } from '../agile/types';

export const PromptGeneratorModal = ({ ticket, onClose }: { ticket: Ticket, onClose: () => void }) => {
    const { tenantId } = useProject();
    const [prompt, setPrompt] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5032';

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch(`${API_BASE}/api/Kanban/tickets/${ticket.id}/prompt`, {
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        'X-Tenant-Id': tenantId || ''
                    }
                });
                
                if (!response.ok) throw new Error("Error al consultar el oráculo.");
                const data = await response.json();
                setPrompt(data.prompt);
            } catch (err: any) {
                setError(err.message || "Se nos lavó el mate al generar el prompt.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrompt();
    }, [ticket.id, tenantId, API_BASE]);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
                            <Sparkles className="text-zinc-900" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Magic Prompt</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Generado con ADN + BDD + Stack</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="animate-spin text-emerald-500" size={40} />
                            <p className="text-sm text-zinc-500 font-medium italic animate-pulse">Consultando al oráculo digital...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
                                <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-xs text-zinc-300 leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                    {prompt}
                                </div>
                                <button 
                                    onClick={handleCopy}
                                    className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-emerald-500 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all shadow-xl"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-500 text-center italic">
                                "Pegá esto en ChatGPT o Claude y mirá cómo el software se escribe solo."
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all"
                    >
                        Cerrar Panel
                    </button>
                </div>
            </div>
        </div>
    );
};
