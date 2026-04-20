import React from 'react';
import { ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';

interface Phase {
  id: string;
  label: string;
  path: string;
}

const PHASES: Phase[] = [
  { id: '0', label: 'ADN', path: 'phase-0-feasibility' },
  { id: '1', label: 'Requisitos', path: 'phase-1-requirements' },
  { id: '2', label: 'Diseño', path: 'phase-2-design' },
  { id: '3', label: 'Trinchera', path: 'phase-3-implementation' },
  { id: '4', label: 'Testing', path: 'phase-4-testing' },
  { id: '5', label: 'Cosecha', path: 'phase-5-deploy' },
];

export const FocusLayout = ({ children, phaseTitle }: { children: React.ReactNode, phaseTitle: string }) => {
  const location = useLocation();
  const { id: projectId } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-500 grayscale-[0.2]">
      {/* Topbar Progresivo y Stepper */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 shadow-sm sticky top-0 z-50">
        <div className="h-14 px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
            <Link 
                to="/app/projects" 
                className="flex items-center gap-2 text-[10px] font-black text-zinc-400 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]"
            >
                <ArrowLeft size={14} strokeWidth={3} />
                Volver
            </Link>
            <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-800"></span>
            <div className="flex items-center gap-2">
                <Zap size={14} className="text-emerald-500" fill="currentColor" />
                <h2 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
                Fase: {phaseTitle}
                </h2>
            </div>
            </div>

            <div className="text-[10px] font-mono text-zinc-500 tracking-widest hidden lg:block">
                // MATECODE_SESSION: {projectId?.substring(0, 8)}...
            </div>
        </div>

        {/* --- PHASE STEPPER (ESTILO LINEAR / VERCEL) --- */}
        <nav className="flex justify-center border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-x-auto no-scrollbar">
            <div className="flex items-center px-4">
                {PHASES.map((phase, index) => {
                    const isActive = location.pathname.includes(phase.path);
                    const isCompleted = PHASES.slice(0, index).some(p => location.pathname.includes(p.path)) || !isActive && PHASES.indexOf(PHASES.find(p => location.pathname.includes(p.id)) || PHASES[0]) > index;
                    // Simplificamos la lógica de completado para el prototipo visual
                    
                    return (
                        <React.Fragment key={phase.id}>
                            <Link
                                to={`/projects/${projectId}/${phase.path}`}
                                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all duration-300 relative group ${
                                    isActive 
                                    ? 'border-emerald-500 text-emerald-500' 
                                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                <span className={`text-[10px] font-black ${isActive ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                                    0{phase.id}
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                                    {phase.label}
                                </span>
                                {isActive && (
                                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl block" />
                                )}
                            </Link>
                            {index < PHASES.length - 1 && (
                                <div className="w-4 flex items-center justify-center">
                                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </nav>
      </header>

      {/* Workspace Area con Grid de fondo */}
      <main className="flex-1 overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#18181b_1.5px,transparent_1.5px)] [background-size:32px_32px]">
        <div className="max-w-7xl mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {children}
        </div>
      </main>
    </div>
  );
};
