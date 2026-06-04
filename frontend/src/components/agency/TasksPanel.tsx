import React, { useState } from 'react';
import type { Member } from '../../store/useAgencyStore';
import { KanbanBoardSubTab } from './KanbanBoardSubTab';
import { ColumnsConfigSubTab } from './ColumnsConfigSubTab';
import { WeeklyReportsSubTab } from './WeeklyReportsSubTab';

interface TasksPanelProps {
  agencyMembers: Member[];
}

export const TasksPanel: React.FC<TasksPanelProps> = ({ agencyMembers }) => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'columns' | 'reports'>('kanban');

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-zinc-800/80 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Tareas Operativas</h1>
          <p className="text-zinc-500 text-xs mt-1">Tablero de actividades dinámico, configuraciones e informes de rendimiento semanal.</p>
        </div>
        
        {/* Tab Selector */}
        <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/60 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'kanban' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Tablero Kanban
          </button>
          <button
            onClick={() => setActiveTab('columns')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'columns' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Configurar Columnas
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Informes Semanales
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeTab === 'kanban' && <KanbanBoardSubTab agencyMembers={agencyMembers} />}
        {activeTab === 'columns' && <ColumnsConfigSubTab />}
        {activeTab === 'reports' && <WeeklyReportsSubTab />}
      </div>
    </div>
  );
};
