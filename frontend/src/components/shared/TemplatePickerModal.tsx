import React from 'react';
import { X, Layers, Plus } from 'lucide-react';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lead' | 'adn';
  availableForms: any[];
  onSelect: (id: string, type: 'lead' | 'adn') => void;
}

export const TemplatePickerModal = ({ isOpen, onClose, type, availableForms, onSelect }: TemplatePickerModalProps) => {
  if (!isOpen) return null;
  const filtered = availableForms.filter(f => (f.tipo || f.Tipo || '').toLowerCase() === (type === 'lead' ? 'lead' : 'idea_propia'));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Bóveda de Estructuras</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Seleccionar para {type === 'lead' ? 'Leads' : 'Ingeniería'}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white rounded-2xl transition-all"><X size={20} /></button>
        </div>
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {filtered.length > 0 ? (
                filtered.map(f => (
                    <button key={f.id} onClick={() => onSelect(f.id, type)} className="w-full p-6 bg-zinc-950 border border-zinc-800 rounded-3xl text-left hover:border-emerald-500 transition-all group flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all"><Layers size={20} /></div>
                            <div>
                                <span className="block text-zinc-100 font-black text-lg group-hover:text-white">{f.nombre}</span>
                                <span className="block text-[10px] text-zinc-600 uppercase font-black mt-1">{(f.configuracionJson || []).length} campos</span>
                            </div>
                        </div>
                        <Plus size={24} className="text-zinc-800 group-hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0" />
                    </button>
                ))
            ) : (
                <div className="py-16 text-center space-y-4">
                    <Layers className="text-zinc-800 mx-auto" size={64} />
                    <p className="text-zinc-500 italic">No hay plantillas de tipo {type} en la Bóveda.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
