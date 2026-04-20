import { useParams } from 'react-router-dom';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';

export default function Phase3Implementation() {
  const { id: projectId } = useParams<{ id: string }>();

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Desarrollo Dinámico</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
            Acá es donde el ADN, la Arquitectura y los Requisitos explotan. Movete veloz, el Drag & Drop no penaliza y los prompts salen con magia lista.
          </p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-sm shadow-sm transition">
             Iniciar Sprint
           </button>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900/50 -mx-4 md:-mx-8 px-4 md:px-8 py-6 min-h-[70vh]">
         {/* Inyectamos el Tablero Kanban con LexoRank implícito */}
         <KanbanBoard projectId={projectId || ""} />
      </div>
    </>
  );
}
