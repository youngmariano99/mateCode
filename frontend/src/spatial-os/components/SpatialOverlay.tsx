import React from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { DynamicWorkspace, type WorkspaceViewMode } from '../../components/spatial/DynamicWorkspace';
import { ROOMS } from '../manifest';

// Workspace Imports
import { DiagramWorkspace } from '../../components/design/DiagramWorkspace';
import { MapaHistoriasBoard } from '../../components/agile/MapaHistoriasBoard';
import { ProjectSelectorRequired } from '../../components/shared/ProjectSelectorRequired';
import { CrmWorkspace } from '../../components/crm/CrmWorkspace';
import { LibraryWorkspace } from '../../components/vault/LibraryWorkspace';
import { TeamWorkspace } from '../../components/team/TeamWorkspace';
import { FeasibilityForm } from '../../components/projects/FeasibilityForm';
import { TestingChecklist } from '../../components/testing/TestingChecklist';
import { SynchronousMeetingRoom } from '../../components/devhub/SynchronousMeetingRoom';
import { DevHubWorkspace } from '../../components/devhub/DevHubWorkspace';
import { ShieldAlert, Sparkles, Users, Database, Lock, Kanban, Code2, Box } from 'lucide-react';

interface SpatialOverlayProps {
  emergencyMeeting?: any;
  onViewModeChange?: (mode: WorkspaceViewMode) => void;
}

const QUICK_SWITCH_ITEMS = [
  { id: 'reception', label: '00 · Recepción & CRM', icon: Users },
  { id: 'phase00', label: '01 · Análisis (Ph00)', icon: Box },
  { id: 'phase01', label: '02 · Estrategia (Ph01)', icon: Kanban },
  { id: 'phase02', label: '03 · Arquitectura (Ph02)', icon: Code2 },
  { id: 'phase03', label: '04 · Desarrollo (Ph03)', icon: Code2 },
  { id: 'phase04', label: '05 · Testing (Ph04)', icon: ShieldAlert },
  { id: 'library', label: 'Bóveda Conocimiento', icon: Database },
  { id: 'team', label: 'Colaboración', icon: Users },
  { id: 'vault', label: 'Caja Fuerte', icon: Lock },
];

export const SpatialOverlay: React.FC<SpatialOverlayProps> = ({ 
  emergencyMeeting,
  onViewModeChange 
}) => {
  const { activeRoom, setActiveRoom, activeProjectId } = useWorkspaceStore();
  const roomMeta = ROOMS.find(r => r.id === activeRoom);

  const renderModule = () => {
    if (activeRoom === 'reception') return <CrmWorkspace />;
    if (activeRoom === 'library') return <LibraryWorkspace />;
    if (activeRoom === 'team') return <TeamWorkspace />;
    if (!activeProjectId && activeRoom !== 'idle') return <ProjectSelectorRequired />;

    switch (activeRoom) {
      case 'phase00': 
      case 'dna-lab': return <FeasibilityForm />;
      case 'phase01':
      case 'strategy': return <MapaHistoriasBoard onReset={() => {}} />;
      case 'phase02':
      case 'architecture': return <DiagramWorkspace />;
      case 'phase03':
      case 'devhub': return <DevHubWorkspace />;
      case 'reunion': return <SynchronousMeetingRoom />;
      case 'phase04': return <TestingChecklist />;
      default: return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-zinc-950/50 h-full">
          <Sparkles size={100} className="text-emerald-500 mb-10 animate-pulse" />
          <h3 className="text-4xl font-black text-white uppercase tracking-[0.4em] mb-6">Módulo {activeRoom.toUpperCase()}</h3>
          <p className="text-emerald-500/60 max-w-md text-xl font-bold leading-relaxed uppercase tracking-widest">En construcción...</p>
        </div>
      );
    }
  };

  return (
    <>
      <DynamicWorkspace
        isOpen={activeRoom !== 'idle'}
        onClose={() => setActiveRoom('idle')}
        title={roomMeta?.name ?? activeRoom}
        subtitle={roomMeta?.subtitle}
        activeRoom={roomMeta ? {
          id: roomMeta.id,
          name: roomMeta.name,
          accent: roomMeta.accent
        } : null}
        onViewModeChange={onViewModeChange}
        quickSwitch={QUICK_SWITCH_ITEMS}
        onQuickSwitch={(id) => setActiveRoom(id as any)}
      >
        {renderModule()}
      </DynamicWorkspace>

      {/* Emergency Re-entry Button */}
      {emergencyMeeting && activeRoom !== 'reunion' && (
        <div className="absolute bottom-10 right-10 z-[200] animate-in slide-in-from-right-10 duration-500">
            <button
                onClick={() => setActiveRoom('reunion')}
                className="group relative flex items-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 border border-emerald-400/30 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 text-emerald-100">Sesión en Curso</span>
                    <span className="text-xl font-black uppercase tracking-tighter italic">Volver a la Reunión</span>
                </div>
                <div className="ml-4 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <ShieldAlert size={24} />
                </div>
            </button>
        </div>
      )}
    </>
  );
};
