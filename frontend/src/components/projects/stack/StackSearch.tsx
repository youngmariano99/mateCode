import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import type { Tech } from './types';

interface StackSearchProps {
    catalog: Tech[];
    projectStack: Tech[];
    onAddTech: (techId: string) => void;
    onCreateOnTheFly: () => void;
}

export const StackSearch = ({ catalog, projectStack, onAddTech, onCreateOnTheFly }: StackSearchProps) => {
    const [search, setSearch] = useState('');

    const filteredCatalog = catalog.filter(t => 
        ((t.nombre?.toLowerCase() ?? "").includes(search.toLowerCase()) || 
         (t.categoriaPrincipal?.toLowerCase() ?? "").includes(search.toLowerCase()) || 
         (t.categoriaSecundaria?.toLowerCase() ?? "").includes(search.toLowerCase())) &&
        !projectStack.some(p => p.id === t.id)
    );

    return (
        <div className="relative z-[100] mb-12">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-600" size={24} />
            <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, capa o tipo..." 
                className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-[2.5rem] p-8 pl-20 text-lg text-white outline-none focus:border-emerald-500/30 transition-all shadow-2xl"
            />
            {search && (
                <div className="absolute top-[110%] left-0 w-full bg-zinc-950 border-2 border-zinc-800 rounded-[2.5rem] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.8)] max-h-[500px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-4 duration-300 z-[101]">
                    {filteredCatalog.length > 0 ? (
                        filteredCatalog.map(t => (
                            <button key={t.id} onClick={() => { onAddTech(t.id); setSearch(''); }} className="w-full p-6 flex justify-between items-center hover:bg-zinc-900 rounded-[2rem] transition-all group/item text-left border border-transparent hover:border-emerald-500/10">
                                <div className="flex items-center gap-6">
                                    <div className="text-3xl grayscale group-hover/item:grayscale-0 transition-all">{t.categoriaPrincipal?.split(' ')[0]}</div>
                                    <div>
                                        <span className="text-white font-black block text-xl italic uppercase tracking-tighter">{t.nombre}</span>
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{t.categoriaPrincipal} • {t.categoriaSecundaria}</span>
                                    </div>
                                </div>
                                <Plus size={20} className="text-zinc-800 group-hover/item:text-emerald-500 transition-colors" />
                            </button>
                        ))
                    ) : (
                        <p className="text-center py-6 text-zinc-600 italic text-sm">No hay coincidencias en el catálogo.</p>
                    )}
                    <button onClick={onCreateOnTheFly} className="w-full p-6 border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 text-zinc-500 hover:text-emerald-500 rounded-[2rem] transition-all mt-4 flex flex-col items-center gap-2">
                        <Plus size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest">¿Falta algo? Crea una nueva herramienta</span>
                    </button>
                </div>
            )}
        </div>
    );
};
