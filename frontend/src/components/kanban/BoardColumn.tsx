import { useRef, useEffect } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { TicketCard } from './TicketCard';
import type { Ticket } from './KanbanBoard';

export const BoardColumn = ({ column, tickets, onOpenPrompt }: { column: any, tickets: Ticket[], onOpenPrompt: (t: Ticket) => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      getData: () => ({ columnId: column.id }),
      onDragEnter: () => el.classList.add('bg-indigo-50', 'dark:bg-indigo-900/20'),
      onDragLeave: () => el.classList.remove('bg-indigo-50', 'dark:bg-indigo-900/20'),
      onDrop: () => el.classList.remove('bg-indigo-50', 'dark:bg-indigo-900/20')
    });
  }, [column.id]);

  return (
    <div 
      ref={ref}
      className="w-80 shrink-0 flex flex-col bg-slate-200/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-2 transition-colors"
    >
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{column.title}</h3>
        <span className="bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
           {tickets.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-[150px]">
        {tickets.map(t => (
           <TicketCard key={t.id} ticket={t} onOpenPrompt={() => onOpenPrompt(t)} />
        ))}
        {tickets.length === 0 && (
           <div className="h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md flex justify-center items-center">
             <span className="text-xs text-slate-400 font-medium">Arrastrá tickets acá</span>
           </div>
        )}
      </div>
    </div>
  );
};
