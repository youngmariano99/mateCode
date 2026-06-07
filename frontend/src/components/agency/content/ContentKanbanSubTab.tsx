import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface PostItem {
  id: string;
  titulo: string;
  formato: string;
  plataforma: string;
  gancho: string;
  tipVisual: string;
  desarrollo: string;
  cta: string;
  estado: string; // 'Idea' | 'Guionado' | 'Grabado' | 'Editado' | 'Programado' | 'No Publicado'
  fechaPublicacion?: string;
  checklistBatching: ChecklistItem[];
  checklistSeo: ChecklistItem[];
  progreso?: {
    guionado: boolean;
    grabado: boolean;
    editado: boolean;
    programado: boolean;
  };
}

interface ContentPlanWrapper {
  planId: string;
  post: PostItem;
}

interface ContentKanbanSubTabProps {
  posts: ContentPlanWrapper[];
  onUpdatePostStatus: (postId: string, planId: string, newStatus: string) => Promise<void>;
  onOpenPostDetails: (post: PostItem, planId: string) => void;
  startDate: string;
  endDate: string;
}

const KANBAN_STATUSES = [
  { id: 'Idea', label: 'Idea / Backlog', color: '#71717a', accent: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400' },
  { id: 'Guionado', label: 'Guionado', color: '#3b82f6', accent: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { id: 'Grabado', label: 'Grabado', color: '#eab308', accent: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-450' },
  { id: 'Editado', label: 'Editado', color: '#a855f7', accent: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  { id: 'Programado', label: 'Programado', color: '#10b981', accent: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450' },
  { id: 'No Publicado', label: 'No Publicado', color: '#ef4444', accent: 'bg-red-500/10 border-red-500/30 text-red-400' }
];

export const ContentKanbanSubTab: React.FC<ContentKanbanSubTabProps> = ({
  posts,
  onUpdatePostStatus,
  onOpenPostDetails,
  startDate,
  endDate
}) => {

  const handleDragStart = (e: React.DragEvent, postId: string, planId: string) => {
    e.dataTransfer.setData('text/postId', postId);
    e.dataTransfer.setData('text/planId', planId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/postId');
    const planId = e.dataTransfer.getData('text/planId');
    if (!postId || !planId) return;

    await onUpdatePostStatus(postId, planId, targetStatus);
  };

  const getDayOfWeek = (dateStr?: string) => {
    if (!dateStr) return '';
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return days[d.getDay()];
    }
    return '';
  };

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-[500px]">
      {/* Rango Info */}
      <div className="flex justify-between items-center bg-zinc-900/35 border border-zinc-850 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-emerald-450" />
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
            Mostrando Producción de la Semana:
          </span>
          <span className="text-xs text-white font-extrabold bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-850">
            {startDate.split('-').reverse().slice(0, 2).reverse().join('/')} al {endDate.split('-').reverse().slice(0, 2).reverse().join('/')}
          </span>
        </div>
        <span className="text-[10px] text-zinc-550 font-medium">
          Arrastra las tarjetas para cambiar su fase de producción
        </span>
      </div>

      {/* Columnas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1 overflow-x-auto pb-4">
        {KANBAN_STATUSES.map(col => {
          const colPosts = posts.filter(p => p.post.estado === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-zinc-950/45 border border-zinc-900 rounded-3xl p-3 flex flex-col space-y-3 min-h-[350px] transition-all hover:border-zinc-850"
            >
              {/* Header Columna */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider truncate">
                    {col.label}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-zinc-550 bg-zinc-900 px-2 py-0.5 rounded-full shrink-0">
                  {colPosts.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
                {colPosts.map(({ planId, post }) => {
                  // Calcular avance de checklist
                  const totalItems = (post.checklistBatching?.length || 0) + (post.checklistSeo?.length || 0);
                  const checkedItems = 
                    (post.checklistBatching?.filter(i => i.checked).length || 0) + 
                    (post.checklistSeo?.filter(i => i.checked).length || 0);
                  
                  const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
                  const day = getDayOfWeek(post.fechaPublicacion);

                  return (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, post.id, planId)}
                      onClick={() => onOpenPostDetails(post, planId)}
                      className="bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700/80 p-3.5 rounded-2xl cursor-grab active:cursor-grabbing transition-colors space-y-2.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] group relative overflow-hidden"
                    >
                      {/* Borde superior del color de columna */}
                      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: col.color }} />

                      {/* Header Card */}
                      <div className="flex justify-between items-start gap-1.5 pt-1">
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-zinc-950/80 border border-zinc-800 rounded-md text-[8px] font-black uppercase text-zinc-400">
                            {post.plataforma}
                          </span>
                          <span className="px-1.5 py-0.5 bg-zinc-950/80 border border-zinc-800 rounded-md text-[8px] font-black uppercase text-zinc-400">
                            {post.formato}
                          </span>
                        </div>
                        {post.fechaPublicacion && (
                          <span className="text-[8px] text-emerald-400 font-black uppercase bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded shrink-0">
                            {day} {post.fechaPublicacion.split('-').reverse().slice(0, 2).reverse().join('/')}
                          </span>
                        )}
                      </div>

                      {/* Titulo */}
                      <h5 className="text-xs font-bold text-white group-hover:text-emerald-450 transition-colors line-clamp-2 leading-snug">
                        {post.titulo}
                      </h5>

                      {/* Barra de Progreso */}
                      {totalItems > 0 && (
                        <div className="space-y-1 pt-1.5 border-t border-zinc-905">
                          <div className="flex justify-between items-center text-[8px] font-bold text-zinc-500">
                            <span>Pasos de Producción:</span>
                            <span className={pct === 100 ? "text-emerald-400" : "text-zinc-400"}>
                              {checkedItems}/{totalItems} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden border border-zinc-900">
                            <div 
                              className="bg-emerald-500 h-full transition-all duration-300" 
                              style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : col.color }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {colPosts.length === 0 && (
                  <div className="h-full flex items-center justify-center py-10 opacity-20 text-center">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      Vacío
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
