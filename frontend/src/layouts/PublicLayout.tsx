import type { ReactNode } from 'react';

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 font-sans selection:bg-emerald-500/30 selection:text-emerald-500">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-md shadow-xl border border-zinc-200/60 dark:border-zinc-800">
        {/* Cabecera Tech */}
        <div className="text-center">
          <div className="inline-block p-3 rounded-md bg-emerald-500/10 mb-4">
             <span className="text-4xl">🧉</span>
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            MateCode
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
             "Tomate un mate, la IA te arma el code."
          </p>
        </div>
        
        {/* Contenido (Login / Registro) */}
        <div className="mt-8 transition-all duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};
