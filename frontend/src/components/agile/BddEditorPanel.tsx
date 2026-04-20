import { useState } from 'react';
import { X, Send, BookOpen, Quote } from 'lucide-react';
import type { Historia } from './types';

export const BddEditorPanel = ({ 
  historia, 
  onClose, 
  onSave 
}: { 
  historia: Historia; 
  onClose: () => void;
  onSave: (bdd: string) => Promise<void>;
}) => {
  const [bdd, setBdd] = useState(historia.criteriosBdd || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(bdd);
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <BookOpen className="text-emerald-500" size={20} />
          Refinamiento BDD
        </h2>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Quote className="text-emerald-500 shrink-0" size={18} />
            <p className="text-[11px] text-emerald-400 font-medium italic">
              "Che, para que la IA programe esto sin errores, tratá de ser bien específico con los escenarios Given/When/Then. ¡Un BDD bien escrito es medio ticket ganado!"
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contenido de la Historia</label>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold">Gherkin Syntax</span>
          </div>
          
          <textarea
            value={bdd}
            onChange={(e) => setBdd(e.target.value)}
            className="w-full h-96 bg-zinc-950 border border-zinc-800 rounded-xl p-5 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none resize-none"
            placeholder="Ej: Given que el usuario está en el login... When ingresa credenciales válidas... Then es redirigido al dashboard."
          />
        </div>
      </div>

      <div className="p-6 border-t border-zinc-800 bg-zinc-950/50">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
        >
          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          {saving ? 'Guardando...' : 'Guardar y Refinar'}
        </button>
      </div>
    </div>
  );
};
