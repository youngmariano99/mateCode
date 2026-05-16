import { useState } from 'react';
import { X, Trash2, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import type { Tech } from './types';

interface CatalogModalProps {
    catalog: Tech[];
    onDeleteTech: (techId: string) => void;
    onBulkDelete: (techIds: string[]) => void;
    onClose: () => void;
}

export const CatalogModal = ({ catalog, onDeleteTech, onBulkDelete, onClose }: CatalogModalProps) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        
        const { isConfirmed } = await Swal.fire({
            title: `¿Eliminar ${selectedIds.length} tecnologías?`,
            text: "Se ocultarán del catálogo global. Los proyectos que ya las usan no se verán afectados.",
            icon: 'warning',
            showCancelButton: true,
            background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444'
        });

        if (isConfirmed) {
            onBulkDelete(selectedIds);
            setSelectedIds([]);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
            <div className="relative w-full max-w-5xl bg-zinc-900 border-2 border-zinc-800 rounded-[4rem] p-12 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
                <header className="flex justify-between items-center mb-10">
                     <div className="flex items-center gap-8">
                        <div>
                            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Directorio <span className="text-emerald-500">Maestro</span></h3>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">Gestión de Diccionario Técnico</p>
                        </div>
                        {selectedIds.length > 0 && (
                            <button 
                                onClick={handleBulkDelete}
                                className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 animate-in fade-in slide-in-from-left-4"
                            >
                                <Trash2 size={16} /> Eliminar Seleccionados ({selectedIds.length})
                            </button>
                        )}
                     </div>
                     <button onClick={onClose} className="p-4 hover:bg-zinc-800 rounded-2xl text-zinc-600 transition-all"><X size={28} /></button>
                </header>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
                    {catalog.map(t => (
                        <div 
                            key={t.id} 
                            onClick={() => toggleSelection(t.id)}
                            className={`bg-zinc-950/40 border p-6 rounded-[2.5rem] flex justify-between items-center hover:border-emerald-500/20 transition-all group cursor-pointer ${
                                selectedIds.includes(t.id) ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800/60'
                            }`}
                        >
                             <div className="flex items-center gap-8">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedIds.includes(t.id) ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-zinc-800'
                                }`}>
                                    {selectedIds.includes(t.id) && <Check size={16} strokeWidth={4} />}
                                </div>
                                <div className="text-4xl shadow-inner">{t.categoriaPrincipal?.split(' ')[0]}</div>
                                <div>
                                    <h5 className="font-black text-white text-xl uppercase italic tracking-tighter leading-none">{t.nombre}</h5>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.categoriaPrincipal}</span>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-md">{t.categoriaSecundaria}</span>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteTech(t.id); }}
                                    className="p-3 bg-zinc-900 text-zinc-700 hover:text-red-500 transition-all rounded-xl border border-zinc-800"
                                    title="Eliminar del Catálogo"
                                >
                                    <Trash2 size={18} />
                                </button>
                             </div>
                        </div>
                    ))}
                    {catalog.length === 0 && (
                        <div className="py-12 text-center text-zinc-600 italic">No hay tecnologías registradas.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
