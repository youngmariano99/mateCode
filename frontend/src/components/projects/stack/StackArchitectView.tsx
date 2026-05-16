import { ExternalLink, Trash2, Cpu } from 'lucide-react';
import type { Tech } from './types';
import { MAIN_CATEGORIES } from './types';

interface StackArchitectViewProps {
    projectStack: Tech[];
    onRemoveTech: (techId: string) => void;
    onUpdateJustification: (techId: string, justification: string) => void;
}

export const StackArchitectView = ({ projectStack, onRemoveTech, onUpdateJustification }: StackArchitectViewProps) => {
    // ... (normalize function)
    const normalize = (str: string) => {
        if (!str) return '';
        return str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2300}-\u{23FF}]/gu, '')
                  .trim()
                  .toLowerCase();
    };

    const classifiedIds = new Set<string>();

    return (
        <div className="space-y-12">
            {MAIN_CATEGORIES.map(cat => {
                const catNorm = normalize(cat);
                const techs = projectStack.filter(t => {
                    const tNorm = normalize(t.categoriaPrincipal);
                    const isMatch = tNorm === catNorm || 
                                   catNorm.includes(tNorm) || 
                                   tNorm.includes(catNorm) ||
                                   (tNorm === 'database' && catNorm === 'base de datos'); 
                    
                    if (isMatch) classifiedIds.add(t.id);
                    return isMatch;
                });

                if (techs.length === 0) return null;

                return (
                    <div key={cat} className="animate-in slide-in-from-left duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-zinc-800" />
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">{cat}</h4>
                            <div className="h-px flex-1 bg-zinc-800" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {techs.map(t => (
                                <TechCard 
                                    key={t.id} 
                                    t={t} 
                                    onRemove={() => onRemoveTech(t.id)} 
                                    onUpdateJustification={(just) => onUpdateJustification(t.id, just)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* SECCIÓN DE OTROS */}
            {projectStack.filter(t => !classifiedIds.has(t.id)).length > 0 && (
                <div className="animate-in slide-in-from-left duration-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-zinc-800" />
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.5em]">📦 Otros / Sin Clasificar</h4>
                        <div className="h-px flex-1 bg-zinc-800" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {projectStack.filter(t => !classifiedIds.has(t.id)).map(t => (
                            <TechCard 
                                key={t.id} 
                                t={t} 
                                onRemove={() => onRemoveTech(t.id)} 
                                onUpdateJustification={(just) => onUpdateJustification(t.id, just)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {projectStack.length === 0 && (
                <div className="py-32 text-center space-y-6">
                    <Cpu className="mx-auto text-zinc-800 animate-pulse" size={100} />
                    <p className="text-zinc-500 font-bold italic text-lg uppercase tracking-widest">Diseña el motor de tu solución.</p>
                </div>
            )}
        </div>
    );
};

const TechCard = ({ t, onRemove, onUpdateJustification }: { t: Tech, onRemove: () => void, onUpdateJustification: (just: string) => void }) => {
    const handleEditJustification = async () => {
        const { value: just } = await Swal.fire({
            title: '🤔 Justificación de la Herramienta',
            input: 'textarea',
            inputValue: t.justificacion || '',
            inputLabel: '¿Por qué elegimos esta tecnología?',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            showCancelButton: true
        });
        if (just !== undefined) onUpdateJustification(just);
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800/40 p-6 pl-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between group hover:border-emerald-500/20 transition-all gap-6">
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                <div className="flex items-center gap-4">
                    <div className="w-24 text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">{t.categoriaSecundaria}</div>
                    <div className="h-4 w-px bg-zinc-800 hidden md:block" />
                    <span className="text-xl text-white font-black italic uppercase tracking-tighter group-hover:text-emerald-500 transition-colors leading-none">{t.nombre}</span>
                </div>
                
                {/* JUSTIFICACIÓN DISPLAY */}
                <div 
                    onClick={handleEditJustification}
                    className="flex-1 bg-black/20 border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-white/10 transition-all"
                >
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Justificación:</p>
                    <p className="text-xs text-zinc-400 font-medium line-clamp-2 italic">
                        {t.justificacion || "Haz clic para añadir el por qué de esta elección..."}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4 pr-4">
                {t.urlDocumentacion && (
                    <a 
                        href={t.urlDocumentacion} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-blue-500 rounded-xl transition-all"
                    >
                        <ExternalLink size={18} />
                    </a>
                )}
                <button 
                    onClick={onRemove} 
                    className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-700 hover:text-red-500 rounded-xl transition-all"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};
