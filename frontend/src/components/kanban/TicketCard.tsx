import { useEffect, useRef, useState } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Sparkles, MessageSquare, Clock, AlertTriangle, Brain } from 'lucide-react';
import type { Ticket } from '../agile/types';
import { GeneradorPromptTicketModal } from './GeneradorPromptTicketModal';

export const TicketCard = ({ ticket, index }: { ticket: Ticket, index: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isPromptOpen, setIsPromptOpen] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        return draggable({
            element: el,
            getInitialData: () => ({ id: ticket.id, index }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
    }, [ticket.id, index]);

    return (
        <>
            <div
                ref={ref}
                className={`group relative p-4 bg-zinc-900 border rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-20 scale-95 ring-2 ring-emerald-500/50' : 'opacity-100 hover:border-zinc-600 shadow-md'
                    } ${ticket.tipo === 'Bug' ? 'border-l-4 border-l-red-500' : ticket.tipo === 'DeudaTécnica' ? 'border-l-4 border-l-amber-500' : 'border-zinc-800'}`}
            >
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${ticket.tipo === 'Bug' ? 'bg-red-500/10 text-red-500' :
                            ticket.tipo === 'DeudaTécnica' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-emerald-500/10 text-emerald-500'
                            }`}>
                            {ticket.tipo}
                        </span>
                        <div className="flex gap-1">
                            <Clock size={12} className="text-zinc-600" />
                        </div>
                    </div>

                    <h4 className="text-sm font-semibold text-zinc-100 leading-tight">
                        {ticket.titulo}
                    </h4>

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <MessageSquare size={14} className="group-hover:text-emerald-500 transition-colors" />
                            <span className="text-[10px] font-bold">2</span>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); setIsPromptOpen(true); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all"
                        >
                            <Brain size={12} />
                            AI Brain
                        </button>
                    </div>
                </div>

                {isDragging && (
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-xl animate-pulse" />
                )}
            </div>

            {isPromptOpen && (
                <GeneradorPromptTicketModal
                    ticket={ticket}
                    onClose={() => setIsPromptOpen(false)}
                />
            )}
        </>
    );
};
