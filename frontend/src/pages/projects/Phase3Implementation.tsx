import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BacklogHub } from '../../components/kanban/BacklogHub';
import { ActiveSprintBoard } from '../../components/kanban/ActiveSprintBoard';
import { api as apiClient } from '../../lib/apiClient';
import type { Sprint } from '../../components/agile/types';

export default function Phase3Implementation() {
  const { id: projectId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'backlog' | 'sprint'>('backlog');
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    if (projectId) {
      apiClient.get(`/api/projects/${projectId}/sprints`).then((res: any) => {
          const sprints: Sprint[] = res;
          const active = sprints.find(s => s.estado === 'Activo');
          setActiveSprint(active || null);
          if (active) {
            setActiveTab('sprint');
          }
      }).catch(e => console.warn("Error cargando sprints:", e));
    }
  }, [projectId]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Trinchera de Desarrollo</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
            Gestioná el Backlog inteligente y ejecutá Sprints con auditoría temporal implícita.
          </p>
        </div>
        <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg">
            <button 
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${activeTab === 'backlog' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                onClick={() => setActiveTab('backlog')}
            >
                1. Backlog & Triage
            </button>
            <button 
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${activeTab === 'sprint' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                onClick={() => setActiveTab('sprint')}
            >
                2. Sprint Activo
            </button>
        </div>
      </div>

      <div className="bg-zinc-950 -mx-4 md:-mx-8 px-4 md:px-8 py-6 flex-1 min-h-[75vh]">
         {activeTab === 'backlog' && (
            <BacklogHub 
                proyectoId={projectId || ""} 
                onSprintStarted={(sprint) => {
                    setActiveSprint(sprint);
                    setActiveTab('sprint');
                }} 
            />
         )}
         {activeTab === 'sprint' && activeSprint && (
            <ActiveSprintBoard 
                proyectoId={projectId || ""} 
                sprint={activeSprint} 
                onSprintClosed={() => {
                    setActiveSprint(null);
                    setActiveTab('backlog');
                }} 
            />
         )}
         {activeTab === 'sprint' && !activeSprint && (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-12 border border-dashed border-zinc-700 rounded-lg bg-zinc-900/50">
                <span className="text-4xl mb-4">🏝️</span>
                <p className="text-lg text-zinc-300">No hay un sprint activo actualmente.</p>
                <p className="text-sm mt-2">Ve a la pestaña de Backlog para planificar e iniciar uno nuevo.</p>
                <button 
                    onClick={() => setActiveTab('backlog')}
                    className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition border border-zinc-700"
                >
                    Ir al Backlog
                </button>
            </div>
         )}
      </div>
    </div>
  );
}
