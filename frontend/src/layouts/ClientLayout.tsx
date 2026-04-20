import type { ReactNode } from 'react';
import { Coffee, ShieldCheck } from 'lucide-react';

export const ClientLayout = ({ children, clientName }: { children: ReactNode, clientName?: string }) => {
    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-500/20">
            {/* Header Minimalista y Profesional */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg">
                            <Coffee className="text-white" size={20} />
                        </div>
                        <div>
                            <span className="text-lg font-black tracking-tighter uppercase">MateCode Portal</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                                <ShieldCheck size={12} />
                                Conexión Segura
                            </div>
                        </div>
                    </div>
                    
                    {clientName && (
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">Bienvenido/a</p>
                            <p className="text-sm font-black text-zinc-800 tracking-tight">{clientName}</p>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {children}
            </main>

            <footer className="py-12 border-t border-zinc-200">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="text-xs text-zinc-400 font-medium tracking-tight">
                        Este es un portal de seguimiento exclusivo. Desarrollado con ❤️ por el equipo de **MateCode**.
                    </p>
                </div>
            </footer>
        </div>
    );
};
