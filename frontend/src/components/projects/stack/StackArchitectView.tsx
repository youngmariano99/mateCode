import { ExternalLink, Trash2, Cpu } from 'lucide-react';
import type { Tech } from './types';
import { MAIN_CATEGORIES } from './types';

interface StackArchitectViewProps {
    projectStack: Tech[];
    onRemoveTech: (techId: string) => void;
}

export const StackArchitectView = ({ projectStack, onRemoveTech }: StackArchitectViewProps) => {
    // Función de normalización para comparaciones robustas
    const normalize = (str: string) => {
        if (!str) return '';
        // Eliminar emojis y dejar solo texto en minúsculas
        return str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2300}-\u{23FF}]/gu, '')
                  .trim()
                  .toLowerCase();
    };

    // Tecnologías ya clasificadas para evitar duplicados en 'Otros'
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
                                   (tNorm === 'database' && catNorm === 'base de datos'); // Alias común
                    
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
                        
                        <div className="grid grid-cols-1 gap-2">
                            {techs.map(t => (
                                <TechCard key={t.id} t={t} onRemove={() => onRemoveTech(t.id)} />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* SECCIÓN DE OTROS (CUALQUIER COSA QUE NO HAYA ENTRADO EN LAS CATEGORÍAS) */}
            {projectStack.filter(t => !classifiedIds.has(t.id)).length > 0 && (
                <div className="animate-in slide-in-from-left duration-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-zinc-800" />
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.5em]">📦 Otros / Sin Clasificar</h4>
                        <div className="h-px flex-1 bg-zinc-800" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {projectStack.filter(t => !classifiedIds.has(t.id)).map(t => (
                            <TechCard key={t.id} t={t} onRemove={() => onRemoveTech(t.id)} />
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

// Sub-componente para evitar repetición
const TechCard = ({ t, onRemove }: { t: Tech, onRemove: () => void }) => (
    <div className="bg-zinc-950 border border-zinc-800/40 p-4 pl-8 rounded-2xl flex items-center justify-between group hover:border-emerald-500/20 transition-all">
        <div className="flex items-center gap-10">
            <div className="w-24 text-[10px] font-black text-zinc-600 uppercase tracking-widest">{t.categoriaSecundaria}</div>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-lg text-white font-black italic uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">{t.nombre}</span>
        </div>
        
        <div className="flex items-center gap-4 pr-4">
            {t.urlDocumentacion && (
                <a 
                    href={t.urlDocumentacion} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 text-zinc-700 hover:text-blue-500 transition-all"
                >
                    <ExternalLink size={18} />
                </a>
            )}
            <button 
                onClick={onRemove} 
                className="p-3 text-zinc-800 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={18} />
            </button>
        </div>
    </div>
);
