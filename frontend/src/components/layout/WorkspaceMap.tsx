import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { 
  ZoomIn, ZoomOut, Siren, Maximize2, MousePointer2, Plus, Minus,
  Database, Code2, Users, Lock, Kanban, Sparkles, Box, X, ShieldAlert
} from 'lucide-react';
import Swal from 'sweetalert2';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// New Spatial Components
import { Map2D, type MapUser } from '../spatial/Map2D';
import { ROOMS as BLUEPRINT_ROOMS } from '../spatial/rooms';
import { DynamicWorkspace, type WorkspaceViewMode } from '../spatial/DynamicWorkspace';
import { FloatingScratchpad } from '../spatial/FloatingScratchpad';

// Existing Logic Imports
import { usePresence } from '../../hooks/usePresence';
import { CrmWorkspace } from '../crm/CrmWorkspace';
import { LibraryWorkspace } from '../vault/LibraryWorkspace';
import { TeamWorkspace } from '../team/TeamWorkspace';
import { FeasibilityForm } from '../projects/FeasibilityForm';
import { MapaHistoriasBoard } from '../agile/MapaHistoriasBoard';
import { DiagramWorkspace } from '../design/DiagramWorkspace';
import { DevHubWorkspace } from '../devhub/DevHubWorkspace';
import { SynchronousMeetingRoom } from '../devhub/SynchronousMeetingRoom';
import { TestingChecklist } from '../testing/TestingChecklist';
import { ProjectSelectorRequired } from '../shared/ProjectSelectorRequired';

/**
 * Normalización de IDs entre el Blueprint y el Backend de MateCode.
 */
const ROOM_ID_MAP: Record<string, string> = {
  phase00: 'dna-lab',
  phase01: 'strategy',
  phase02: 'architecture',
  phase03: 'devhub',
  phase04: 'phase04',
};

const REVERSE_ROOM_ID_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ROOM_ID_MAP).map(([k, v]) => [v, k])
);

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

export const WorkspaceMap: React.FC = () => {
  const { activeRoom, setActiveRoom, activeProjectId } = useWorkspaceStore();
  const { presences, emergencyMeeting, callEmergencyMeeting } = usePresence();
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceViewMode>("windowed");

  // Mapeo de metadata de la sala activa para el Workspace
  const activeBlueprintId = ROOM_ID_MAP[activeRoom] || activeRoom;
  const activeRoomMeta = BLUEPRINT_ROOMS.find(r => r.id === activeBlueprintId);

  // SCENE HIDING: Ocultar el mapa cuando el workspace está maximizado
  const isMaximized = activeRoom !== 'idle' && workspaceMode === 'maximized';

  // Transformar presencias 3D a formato compatible con Map2D
  const mapUsers: MapUser[] = Object.values(presences).map((user: any, idx: number) => {
    const blueprintId = ROOM_ID_MAP[user.zonaActual] || user.zonaActual;
    const room = BLUEPRINT_ROOMS.find(r => r.id === blueprintId);
    
    const offsetX = (idx % 3 - 1) * 25;
    const offsetY = (Math.floor(idx / 3) % 3 - 1) * 25;

    return {
      id: user.userId,
      name: user.nombre,
      x: room ? room.x + room.width / 2 + offsetX : 800,
      y: room ? room.y + room.height / 2 + offsetY : 500,
      color: room ? room.accent : '#10B981',
      live: true,
      activity: user.zonaActual === 'idle' ? 'En el pasillo' : `Trabajando en ${room?.name || user.zonaActual}`
    };
  });

  const handleCallEmergency = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<span style="color: #ef4444; font-family: Inter, sans-serif; font-weight: 900; text-transform: uppercase;">Convocar Reunión de Guerra</span>',
      html: `
        <div style="text-align: left; padding: 10px;">
            <label style="color: #64748b; font-[8px] font-black uppercase tracking-widest block mb-2">Tema Principal</label>
            <input id="swal-input1" class="swal2-input" style="margin: 0; width: 100%; background: #09090b; border: 1px solid #27272a; color: white; border-radius: 12px; font-size: 14px;" placeholder="Ej: Bug crítico en Login">
            <label style="color: #64748b; font-[8px] font-black uppercase tracking-widest block mt-4 mb-2">Contexto (Opcional)</label>
            <textarea id="swal-input2" class="swal2-textarea" style="margin: 0; width: 100%; background: #09090b; border: 1px solid #27272a; color: white; border-radius: 12px; font-size: 13px; height: 100px;" placeholder="Describe el problema..."></textarea>
        </div>
      `,
      background: '#18181b',
      color: '#fff',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'INICIAR TRANSMISIÓN',
      confirmButtonColor: '#ef4444',
      preConfirm: () => [
        (document.getElementById('swal-input1') as HTMLInputElement).value,
        (document.getElementById('swal-input2') as HTMLTextAreaElement).value
      ]
    });

    if (formValues && formValues[0] && activeProjectId) {
      const success = await callEmergencyMeeting(formValues[0], activeProjectId, formValues[1]);
      if (success) setActiveRoom('reunion');
    }
  };

  const presenceCount = Object.keys(presences).length;

  const renderModule = () => {
    if (activeRoom === 'reception') return <CrmWorkspace />;
    if (activeRoom === 'library') return <LibraryWorkspace />;
    if (activeRoom === 'team') return <TeamWorkspace />;
    if (!activeProjectId && activeRoom !== 'idle') return <ProjectSelectorRequired />;

    switch (activeRoom) {
      case 'phase00': return <FeasibilityForm />;
      case 'phase01': return <MapaHistoriasBoard onReset={() => {}} />;
      case 'phase02': return <DiagramWorkspace />;
      case 'phase03': return <DevHubWorkspace />;
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
    <div className="relative w-full h-full bg-slate-900 text-slate-200 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 z-50">
        <div>
          <h1 className="text-sm tracking-[0.4em] text-slate-400 font-medium">SPATIAL OS · BLUEPRINT</h1>
          <p className="text-xs text-slate-500 mt-1 tracking-wider">COMPLEX 01 — TOP-DOWN ARCHITECTURAL VIEW</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-widest">LIVE · {presenceCount} PRESENT</span>
        </div>
      </header>

      {/* Main Map Content - HIDDEN when workspace is maximized */}
      <main className={`flex-1 p-6 bg-slate-900 transition-opacity duration-300 ${isMaximized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="relative w-full h-full rounded-lg border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
          <TransformWrapper initialScale={1} centerOnInit minScale={0.4} maxScale={4} limitToBounds={false}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="w-full h-full">
                  <Map2D users={mapUsers} onRoomClick={(room) => setActiveRoom((REVERSE_ROOM_ID_MAP[room.id] || room.id) as any)} />
                </TransformComponent>
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button onClick={() => zoomIn()} className="w-9 h-9 grid place-items-center rounded-md border border-slate-700/80 bg-slate-950/85 text-slate-300 hover:text-white transition-all"><Plus size={18} /></button>
                  <button onClick={() => zoomOut()} className="w-9 h-9 grid place-items-center rounded-md border border-slate-700/80 bg-slate-950/85 text-slate-300 hover:text-white transition-all"><Minus size={18} /></button>
                  <button onClick={() => resetTransform()} className="w-9 h-9 grid place-items-center rounded-md border border-slate-700/80 bg-slate-950/85 text-slate-300 hover:text-white transition-all"><Maximize2 size={18} /></button>
                </div>
              </>
            )}
          </TransformWrapper>
        </div>
      </main>

      {/* Emergency Button */}
      {!isMaximized && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
          <button onClick={handleCallEmergency} className="flex items-center gap-3 px-8 py-3 bg-red-600/90 hover:bg-red-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl border border-red-400/20">
            <Siren size={18} className="animate-pulse" /> CONVOCAR REUNIÓN DE GUERRA
          </button>
        </div>
      )}

      {/* Dynamic Workspace Integration */}
      <DynamicWorkspace
        isOpen={activeRoom !== 'idle'}
        onClose={() => setActiveRoom('idle')}
        title={activeRoomMeta?.name ?? activeRoom}
        subtitle={activeRoomMeta?.subtitle}
        activeRoom={activeRoomMeta ? { id: activeRoomMeta.id, name: activeRoomMeta.name, accent: activeRoomMeta.accent } : null}
        onViewModeChange={setWorkspaceMode}
        quickSwitch={QUICK_SWITCH_ITEMS}
        onQuickSwitch={(id) => setActiveRoom(id as any)}
      >
        {renderModule()}
      </DynamicWorkspace>

      <FloatingScratchpad />

      {/* Emergency Meeting Alert */}
      {emergencyMeeting && activeRoom !== 'reunion' && (
        <div className="absolute bottom-10 right-10 z-[200] animate-in slide-in-from-right-10 duration-500">
            <button onClick={() => setActiveRoom('reunion')} className="group relative flex items-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-3xl shadow-2xl border border-emerald-400/30 overflow-hidden">
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
    </div>
  );
};
