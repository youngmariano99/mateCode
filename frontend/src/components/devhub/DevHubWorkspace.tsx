import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ListTodo, Zap, BrainCircuit, Rocket } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { ActiveSprintBoard } from '../kanban/ActiveSprintBoard';
import { BacklogHub } from '../kanban/BacklogHub';

export const DevHubWorkspace: React.FC = () => {
    const { activeProjectId, setActiveRoom } = useWorkspaceStore();
    const [activeTab, setActiveTab] = useState<'kanban' | 'backlog'>('kanban');

    if (!activeProjectId) return null;

    const tabs = [
        { id: 'kanban', label: 'Tablero de Sprint', icon: LayoutGrid, color: 'emerald' },
        { id: 'backlog', label: 'Product Backlog', icon: ListTodo, color: 'blue' }
    ] as const;

    return (
        <div className="flex flex-col h-full bg-[#07090F]/95 backdrop-blur-xl overflow-hidden">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-black/40">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                            <Rocket size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tighter leading-none">DevHub</h2>
                            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1">Fase 03 • Operaciones</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/5 mx-2" />

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                                    ${activeTab === tab.id 
                                        ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-900/20 scale-105` 
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                                `}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sincronizado</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'kanban' ? (
                        <motion.div
                            key="kanban"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <ActiveSprintBoard onSprintClosed={() => setActiveRoom('idle')} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="backlog"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <BacklogHub 
                                proyectoId={activeProjectId} 
                                onSprintStarted={() => setActiveTab('kanban')} 
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
