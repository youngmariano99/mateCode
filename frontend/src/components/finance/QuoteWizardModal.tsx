import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Download, Wallet, Building2, CheckCircle2 } from 'lucide-react';
import { useFinanceCalculator } from '../../hooks/useFinanceCalculator';

interface QuoteWizardModalProps {
    onClose: () => void;
}

export const QuoteWizardModal = ({ onClose }: QuoteWizardModalProps) => {
    const [step, setStep] = useState(1);
    const { 
        items, 
        total, 
        advancePayment, 
        advancePercent, 
        setAdvancePercent, 
        toggleItem, 
        updatePrice 
    } = useFinanceCalculator([
        { id: '1', title: 'Módulo de Autenticación y Seguridad', price: 1200, enabled: true },
        { id: '2', title: 'Panel de Administración CRM', price: 2500, enabled: true },
        { id: '3', title: 'Integración de Pagos (Stripe)', price: 800, enabled: false },
    ]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                             <Wallet className="text-emerald-500" />
                             Generador de Presupuesto
                        </h2>
                        <p className="text-xs text-zinc-500 font-medium">Paso {step} de 3</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                <Building2 size={16} className="text-emerald-500" />
                                Selección de Perfil de Marca
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 bg-emerald-500/10 border-2 border-emerald-500 rounded-xl text-left transition-all">
                                    <p className="font-bold text-white">AppyStudios</p>
                                    <p className="text-[10px] text-emerald-400 uppercase font-black">Agencia Principal</p>
                                </button>
                                <button className="p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl text-left hover:border-zinc-700 transition-all opacity-50">
                                    <p className="font-bold text-zinc-400">Freelance Personal</p>
                                    <p className="text-[10px] text-zinc-500 uppercase font-black">Monotributo</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
                                <p className="text-xs text-zinc-400 italic">
                                    "Te pasé los tickets técnicos a idioma cliente para que no se maree. Pegale una leída y ajustá los precios."
                                </p>
                            </div>
                            <div className="space-y-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-3 bg-zinc-950 border border-zinc-800 rounded-lg group">
                                        <input 
                                            type="checkbox" 
                                            checked={item.enabled}
                                            onChange={() => toggleItem(item.id)}
                                            className="w-4 h-4 accent-emerald-500"
                                        />
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${item.enabled ? 'text-zinc-200' : 'text-zinc-600 line-through'}`}>
                                                {item.title}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-zinc-500 font-bold">$</span>
                                            <input 
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                                                className="w-20 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-right text-emerald-400 font-bold"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Anticipo Solicitado</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="range" 
                                            min="0" max="100" step="10"
                                            value={advancePercent}
                                            onChange={(e) => setAdvancePercent(Number(e.target.value))}
                                            className="flex-1 accent-emerald-500"
                                        />
                                        <span className="text-xl font-black text-white">{advancePercent}%</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 italic">
                                        "Si ponés un anticipo del {advancePercent}%, son <span className="text-emerald-500 font-bold">${advancePayment}</span>. ¡Asegurá el arranque!"
                                    </p>
                                </div>
                                <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase">Total Presupuestado</p>
                                    <p className="text-5xl font-black text-white tracking-tighter">${total}</p>
                                    <CheckCircle2 className="mt-4 text-emerald-500 opacity-50" size={32} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                    <button 
                        disabled={step === 1}
                        onClick={() => setStep(s => s - 1)}
                        className="px-6 py-2 text-zinc-400 font-bold hover:text-white disabled:opacity-0 transition-all flex items-center gap-2"
                    >
                        <ChevronLeft size={18} /> Anterior
                    </button>
                    
                    {step < 3 ? (
                        <button 
                            onClick={() => setStep(s => s + 1)}
                            className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-black rounded-lg transition-all flex items-center gap-2"
                        >
                            Siguiente <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 group">
                            <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                            Emitir y Descargar PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
