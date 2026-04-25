import React, { useState, useEffect } from 'react';
import { api as apiClient } from '../../lib/apiClient';
import { Search, Link as LinkIcon, Database, Bug, FileText } from 'lucide-react';

interface OracleResult {
    id: string;
    titulo: string;
    tipo: 'ticket' | 'bug' | 'decision' | 'documento';
    score: number;
}

interface RelationPickerProps {
    onSelect: (id: string, titulo: string, tipo: string) => void;
    onCancel: () => void;
}

export const RelationPicker: React.FC<RelationPickerProps> = ({ onSelect, onCancel }) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<OracleResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (search.length < 3) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            apiClient.get(`/api/oracle/search?query=${encodeURIComponent(search)}`)
                .then(res => {
                    setResults((res as OracleResult[]) || []);
                })
                .catch(e => console.error("Oracle search error", e))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'ticket': return <Database size={14} className="text-blue-400" />;
            case 'bug': return <Bug size={14} className="text-red-400" />;
            case 'decision': return <FileText size={14} className="text-emerald-400" />;
            default: return <LinkIcon size={14} className="text-zinc-400" />;
        }
    };

    return (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-col gap-3 mt-2 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Search size={12} /> Sugerencias del Oráculo
                </span>
                <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300 transition-colors">✕</button>
            </div>
            
            <div className="relative">
                <input 
                    type="text" 
                    autoFocus
                    placeholder="Buscar en tickets, bugs, decisiones..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none placeholder:text-zinc-700 transition-all"
                />
                {loading && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                    </div>
                )}
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {search.length < 3 ? (
                    <div className="text-center text-zinc-600 text-[11px] py-6 italic">Escribe al menos 3 caracteres para consultar al Oráculo...</div>
                ) : loading ? (
                    null
                ) : results.length === 0 ? (
                    <div className="text-center text-zinc-600 text-[11px] py-6">No se encontraron referencias históricas relevantes.</div>
                ) : (
                    results.map(res => (
                        <button 
                            key={res.id}
                            onClick={() => onSelect(res.id, res.titulo, res.tipo)}
                            className="w-full text-left p-3 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/50 rounded-lg flex items-center gap-3 group transition-all"
                        >
                            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                                {getIcon(res.tipo)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-zinc-300 group-hover:text-white truncate font-medium">{res.titulo}</div>
                                <div className="text-[10px] uppercase text-zinc-600 font-bold tracking-tight">{res.tipo}</div>
                            </div>
                            <div className="text-[10px] text-zinc-700 font-mono">
                                Match: {(res.score * 10).toFixed(0)}%
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};
