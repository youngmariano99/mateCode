import { useEffect, useRef } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { HistoriaCard } from './HistoriaCard';
import { Inbox } from 'lucide-react';
import type { Historia, Epica } from './types';

export const EpicaColumn = ({ 
  epica, 
  onHistoriaClick, 
  selectedHistoriaId 
}: { 
  epica: Epica; 
  onHistoriaClick: (h: Historia) => void;
  selectedHistoriaId?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      getData: () => ({ id: epica.id }),
    });
  }, [epica.id]);

  return (
    <div 
      ref={ref}
      className="flex flex-col w-80 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shrink-0"
    >
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-tight flex items-center justify-between">
          {epica.titulo}
          <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full text-zinc-500">
            {epica.historias.length}
          </span>
        </h3>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-none min-h-[100px]">
        {epica.historias.length > 0 ? (
          epica.historias.map((h) => (
            <HistoriaCard
              key={h.id}
              historia={h}
              onClick={() => onHistoriaClick(h)}
              isActive={selectedHistoriaId === h.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-400">
            <Inbox size={24} className="mb-2 opacity-50" />
            <span className="text-[10px] font-medium">Sin historias</span>
          </div>
        )}
      </div>
    </div>
  );
};
