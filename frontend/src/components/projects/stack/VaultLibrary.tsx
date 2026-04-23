import { Layers, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import type { Tech, Template } from './types';

interface VaultLibraryProps {
    templates: Template[];
    catalog: Tech[];
    activeTemplateId: string | null;
    onLoadTemplate: (templateId: string) => void;
}

export const VaultLibrary = ({ templates, catalog, activeTemplateId, onLoadTemplate }: VaultLibraryProps) => {
    
    // Función auxiliar para normalizar los IDs (pueden venir como string o array)
    const getTechIds = (temp: Template): string[] => {
        try {
            if (Array.isArray(temp.tecnologiasIdsJson)) return temp.tecnologiasIdsJson;
            if (typeof temp.tecnologiasIdsJson === 'string') return JSON.parse(temp.tecnologiasIdsJson);
            return [];
        } catch (e) {
            return [];
        }
    };

    return (
        <div className="bg-zinc-950 border border-zinc-900 rounded-[4rem] p-12 lg:p-16">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                        <Layers className="text-emerald-500" size={32} /> La Bóveda <span className="text-zinc-700">/ Stacks Privados</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2 px-1">Selecciona una base estructural para instanciar el proyecto</p>
                </div>
            </header>

            <div className="space-y-4">
                {templates.map(temp => {
                    const ids = getTechIds(temp);
                    const techsInTemplate = catalog.filter(t => 
                        ids.some((id: string) => id.toLowerCase() === t.id.toLowerCase())
                    );
                     
                    const isActive = activeTemplateId === temp.id;

                    return (
                        <div key={temp.id} className="group relative">
                            <button 
                                onClick={() => onLoadTemplate(temp.id)}
                                className={`w-full p-6 lg:p-8 rounded-[2.5rem] border-2 text-left transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${isActive ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-zinc-900/30 border-zinc-800/50 hover:border-emerald-500/30 hover:bg-zinc-900'}`}
                            >
                                {/* Info Principal */}
                                <div className="flex items-center gap-6 lg:w-1/3">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-emerald-500 text-black' : 'bg-zinc-950 text-zinc-700 group-hover:text-emerald-500'}`}>
                                        <Cpu size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white italic uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">{temp.nombre}</h4>
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{techsInTemplate.length} Componentes</span>
                                    </div>
                                </div>

                                {/* Listado de Tecnologías (Fila) */}
                                <div className="flex-1 flex flex-wrap gap-2 items-center">
                                    {techsInTemplate.map(tech => (
                                        <div key={tech.id} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/50 border border-zinc-800/50 rounded-xl">
                                            <span className="text-[14px]">{tech.categoriaPrincipal?.split(' ')[0]}</span>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{tech.nombre}</span>
                                        </div>
                                    ))}
                                    {techsInTemplate.length === 0 && (
                                        <span className="text-[10px] text-zinc-700 italic">Sin componentes definidos</span>
                                    )}
                                </div>

                                {/* Acción */}
                                <div className="flex items-center gap-4 lg:pl-10">
                                    {isActive ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 animate-in zoom-in">
                                            <CheckCircle2 size={14} /> Activo
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    );
                })}

                {templates.length === 0 && (
                    <div className="py-20 text-center bg-zinc-900/10 border-2 border-dashed border-zinc-900 rounded-[3rem]">
                        <p className="text-zinc-700 font-bold italic uppercase tracking-widest text-xs">La bóveda de este tenant está vacía.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
