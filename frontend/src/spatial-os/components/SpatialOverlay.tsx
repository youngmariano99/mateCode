/**
 * SpatialOverlay.tsx
 * ---------------------------------------------------------------------------
 *  Global overlay system for Spatial Workspaces. 
 *  This component listens to the global WorkspaceStore and renders the 
 *  appropriate module (Kanban, Diagrams, CRM, etc.) in a premium modal.
 * 
 *  This is shared logic between the 2D Map and the 3D Spatial OS.
 * ---------------------------------------------------------------------------
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Sparkles, ShieldAlert } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

// Workspace Imports
import { ActiveSprintBoard } from '../../components/kanban/ActiveSprintBoard';
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

interface SpatialOverlayProps {
  emergencyMeeting?: any;
}

export const SpatialOverlay: React.FC<SpatialOverlayProps> = ({ emergencyMeeting }) => {
  const { activeRoom, setActiveRoom, activeProjectId } = useWorkspaceStore();

  const renderModule = () => {
    // Rooms that don't require a selected project
    if (activeRoom === 'reception') return <CrmWorkspace />;
    if (activeRoom === 'library') return <LibraryWorkspace />;
    if (activeRoom === 'team') return <TeamWorkspace />;
    
    // Rooms that REQUIRE a project
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
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-zinc-950/50">
          <Sparkles size={100} className="text-emerald-500 mb-10 animate-pulse" />
          <h3 className="text-4xl font-black text-white uppercase tracking-[0.4em] mb-6">Módulo {activeRoom.toUpperCase()}</h3>
          <p className="text-emerald-500/60 max-w-md text-xl font-bold leading-relaxed uppercase tracking-widest">En construcción...</p>
        </div>
      );
    }
  };

  return (
    <>
      <AnimatePresence>
        {activeRoom !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] flex items-center justify-center p-8"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0B0F1A]/95 backdrop-blur-2xl" onClick={() => setActiveRoom('idle')} />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full h-full max-w-[95vw] max-h-[90vh] bg-[#0A0F1A] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-zinc-900/20">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                    <Box size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                      {activeRoom === 'reunion' ? 'Sala de Guerra' : `Módulo: ${activeRoom}`}
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveRoom('idle')} 
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-zinc-400 border border-white/5 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-auto bg-[#05070a]">
                {renderModule()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Re-entry Button */}
      {emergencyMeeting && activeRoom !== 'reunion' && (
        <div className="absolute bottom-10 right-10 z-[200] animate-in slide-in-from-right-10 duration-500">
            <button
                onClick={() => setActiveRoom('reunion')}
                className="group relative flex items-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 border border-emerald-400/30 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 text-emerald-100">Sesión en Curso</span>
                    <span className="text-xl font-black uppercase tracking-tighter italic">Volver a la Reunión</span>
                </div>
                <div className="ml-4 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform border border-white/10">
                    <ShieldAlert size={24} />
                </div>
            </button>
        </div>
      )}
    </>
  );
};
