import { useEffect, useRef, useState } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { GripVertical } from 'lucide-react';
import type { Story, Epic } from './types';

export const StoryCard = ({
  story,
  onClick,
  isActive
}: {
  story: Story;
  onClick: () => void;
  isActive?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({ id: story.id }),
      onGenerateDragPreview: () => { },
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [story.id]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`group relative p-4 bg-white dark:bg-zinc-950 border rounded-md shadow-sm cursor-pointer transition-all duration-200 ${isActive
          ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-emerald-500/10'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
        } ${isDragging ? 'opacity-30 scale-95 ring-2 ring-emerald-500/50' : 'opacity-100'}`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="shrink-0 text-zinc-300 group-hover:text-emerald-500 transition-colors mt-0.5" size={14} />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 leading-tight">
          {story.title}
        </p>
      </div>

      {isActive && (
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};
