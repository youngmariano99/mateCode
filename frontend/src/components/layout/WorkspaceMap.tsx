import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { 
  X, Box, Sparkles, MapPin, ZoomIn, ZoomOut, Siren, ShieldAlert
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ActiveSprintBoard } from '../kanban/ActiveSprintBoard';
import { DiagramWorkspace } from '../design/DiagramWorkspace';
import { MapaHistoriasBoard } from '../agile/MapaHistoriasBoard';
import { ProjectSelectorRequired } from '../shared/ProjectSelectorRequired';
import { CrmWorkspace } from '../crm/CrmWorkspace';
import { LibraryWorkspace } from '../vault/LibraryWorkspace';
import { TeamWorkspace } from '../team/TeamWorkspace';
import { FeasibilityForm } from '../projects/FeasibilityForm';
import { TestingChecklist } from '../testing/TestingChecklist';
import { SynchronousMeetingRoom } from '../devhub/SynchronousMeetingRoom';
import { DevHubWorkspace } from '../devhub/DevHubWorkspace';
import { usePresence } from '../../hooks/usePresence';

// --- THEME ---
const THEME = {
  bg: "#0B0F1A",
  wall: "#1E293B",
  door: "#334155",
  text: "#64748B",
  colors: {
    reception: "#10B981",
    library: "#3B82F6",
    team: "#F59E0B",
    vault: "#8B5CF6",
    devhub: "#EF4444",
    arch: "#EC4899",
    strategy: "#06B6D4"
  }
};

const ROOMS = [
  { id: 'reception', x: 40, y: 40, w: 200, h: 240, title: 'Recepción & CRM', color: THEME.colors.reception },
  { id: 'library', x: 240, y: 40, w: 200, h: 240, title: 'Bóveda de Conocimiento', color: THEME.colors.library },
  { id: 'team', x: 440, y: 40, w: 200, h: 240, title: 'Sala de Colaboración', color: THEME.colors.team },
  { id: 'vault', x: 640, y: 40, w: 200, h: 240, title: 'Caja Fuerte de Activos', color: THEME.colors.vault },
  
  { id: 'phase00', x: 40, y: 360, w: 200, h: 240, title: 'Lab ADN (Fase 0)', color: THEME.colors.arch },
  { id: 'phase01', x: 240, y: 360, w: 200, h: 240, title: 'Estrategia (Fase 1)', color: THEME.colors.strategy },
  { id: 'phase02', x: 440, y: 360, w: 200, h: 240, title: 'Arquitectura (Fase 2)', color: THEME.colors.arch },
  { id: 'phase04', x: 640, y: 360, w: 200, h: 240, title: 'QA Lab (Fase 4)', color: THEME.colors.devhub },
  { id: 'phase05', x: 840, y: 360, w: 180, h: 240, title: 'Lanzamiento (Fase 5)', color: THEME.colors.team },
  
  { id: 'phase03', x: 840, y: 40, w: 320, h: 240, title: 'DevHub (Fase 3)', color: THEME.colors.devhub },
  { id: 'server', x: 840, y: 280, w: 320, h: 80, title: 'Server Room', color: '#111827' },
];

const getRoomCoords = (roomId: string) => {
    const coords: Record<string, { x: number, y: number }> = {
      reception: { x: 140, y: 160 },
      library: { x: 340, y: 160 },
      team: { x: 540, y: 160 },
      vault: { x: 740, y: 160 },
      phase00: { x: 140, y: 480 },
      phase01: { x: 340, y: 480 },
      phase02: { x: 540, y: 480 },
      phase04: { x: 740, y: 480 },
      phase05: { x: 930, y: 480 },
      phase03: { x: 1000, y: 160 },
      server: { x: 1000, y: 320 },
      reunion: { x: 440, y: 320 },
      idle: { x: 440, y: 320 }
    };
    return coords[roomId] || coords.idle;
};

export const WorkspaceMap: React.FC = () => {
  const { activeRoom, setActiveRoom, activeProjectId } = useWorkspaceStore();
  const [zoom, setZoom] = useState(1);
  const { presences, emergencyMeeting, callEmergencyMeeting } = usePresence();

  const handleCallEmergency = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<span style="color: #ef4444; font-family: Inter, sans-serif; font-weight: 900; text-transform: uppercase;">Convocar Reunión de Guerra</span>',
      html: `
        <div style="text-align: left; padding: 10px;">
            <label style="color: #64748b; font-[8px] font-black uppercase tracking-widest block mb-2">Tema Principal</label>
            <input id="swal-input1" class="swal2-input" style="margin: 0; width: 100%; background: #09090b; border: 1px solid #27272a; color: white; border-radius: 12px; font-size: 14px;" placeholder="Ej: Bug crítico en Login">
            
            <label style="color: #64748b; font-[8px] font-black uppercase tracking-widest block mt-4 mb-2">Contexto (Opcional)</label>
            <textarea id="swal-input2" class="swal2-textarea" style="margin: 0; width: 100%; background: #09090b; border: 1px solid #27272a; color: white; border-radius: 12px; font-size: 13px; height: 100px;" placeholder="Describe el problema o los puntos a tratar..."></textarea>
        </div>
      `,
      background: '#18181b',
      color: '#fff',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'INICIAR TRANSMISIÓN',
      confirmButtonColor: '#ef4444',
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLTextAreaElement).value
        ]
      },
      customClass: {
          popup: 'rounded-[30px] border border-white/5 shadow-2xl',
          confirmButton: 'rounded-xl px-8 font-black uppercase tracking-widest text-[10px]'
      }
    });

    if (formValues && formValues[0] && activeProjectId) {
      const [topic, description] = formValues;
      const success = await callEmergencyMeeting(topic, activeProjectId, description);
      if (success) {
          setActiveRoom('reunion');
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0B0F1A] overflow-hidden flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20" style={{ 
        backgroundImage: `radial-gradient(${THEME.wall} 1px, transparent 1px)`, 
        backgroundSize: '40px 40px' 
      }} />

      <motion.div 
        animate={{ scale: zoom }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative w-[1200px] h-[800px] bg-[#0B0F1A] rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-[12px] border-[#1E293B] overflow-hidden"
      >
        <svg viewBox="0 0 1200 800" className="w-full h-full select-none">
          {/* Walls & Layout */}
          <g fill="none" stroke={THEME.wall} strokeWidth="2">
            <rect x="20" y="20" width="1160" height="760" rx="40" strokeWidth="4" />
            <line x1="20" y1="280" x2="840" y2="280" />
            <line x1="840" y1="20" x2="840" y2="780" />
          </g>

          {/* Interactive Rooms */}
          {ROOMS.map(room => (
            <IntegratedRoom key={room.id} config={room} isActive={activeRoom === room.id} onClick={() => setActiveRoom(room.id as any)} />
          ))}

          {/* User Avatars */}
          {Object.values(presences).map((user: any, idx: number) => {
            const coords = getRoomCoords(user.zonaActual);
            return (
              <UserAvatar 
                key={user.userId} 
                x={coords.x + (idx * 5)} 
                y={coords.y + (idx * 2)} 
                name={user.nombre} 
                initial={user.nombre.charAt(0)} 
                color={user.zonaActual.startsWith('phase') ? THEME.colors.devhub : THEME.colors.arch} 
              />
            );
          })}
        </svg>
      </motion.div>

      {/* Control Bar */}
      <div className="absolute bottom-10 left-10 flex items-center gap-6 z-50">
          <div className="bg-[#161B26]/80 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
             <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <MapPin size={20} />
                </div>
                <div>
                   <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">SISTEMA SPATIAL</div>
                   <div className="text-xs font-black text-white uppercase tracking-wider">MAPA VERCEL 1.0</div>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-white/5" />
             <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ZoomIn size={18} /></button>
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ZoomOut size={18} /></button>
             </div>
             <div className="h-8 w-[1px] bg-white/5" />
             <button 
                onClick={handleCallEmergency}
                className="group relative flex items-center gap-3 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-500/20 transition-all active:scale-95 overflow-hidden"
             >
                <div className="absolute inset-0 bg-red-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Siren size={20} className="animate-pulse relative" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] relative">CONVOCAR REUNIÓN</span>
             </button>
          </div>
      </div>

      <UILayer emergencyMeeting={emergencyMeeting} />
    </div>
  );
};

// --- SUB-COMPONENTS (Dentro del mismo archivo para preservar scope) ---

const IntegratedRoom = ({ config, isActive, onClick }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const color = config.color || THEME.colors.arch;

    return (
      <g 
        className="cursor-pointer transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {(isActive || isHovered) && (
          <rect
            x={config.x - 4} y={config.y - 4} width={config.w + 8} height={config.h + 8}
            fill={color} opacity="0.15" rx="12" className="animate-pulse"
          />
        )}
        <rect
          x={config.x} y={config.y} width={config.w} height={config.h}
          fill={isActive || isHovered ? "rgba(255,255,255,0.05)" : "transparent"}
          stroke={isActive || isHovered ? color : "rgba(255,255,255,0.05)"}
          strokeWidth={isActive || isHovered ? 2 : 1} rx="8"
        />
        <g transform={`translate(${config.x + 10}, ${config.y + 20})`}>
          <text className="text-[8px] font-black uppercase tracking-[0.2em]" fill={isActive || isHovered ? "#FFF" : THEME.text}>{config.title}</text>
          <rect y="6" width="15" height="1.5" fill={color} opacity={isActive || isHovered ? 1 : 0.3} />
        </g>
      </g>
    );
};

const UserAvatar = ({ x, y, name, initial, color }: any) => (
    <motion.g initial={false} animate={{ x, y }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
      <circle r="18" fill="rgba(0,0,0,0.5)" filter="blur(4px)" cy="4" />
      <circle r="15" fill={color} stroke="#FFF" strokeWidth="2" />
      <text dy=".3em" textAnchor="middle" className="text-[10px] font-black fill-white">{initial}</text>
      <g transform="translate(0, -25)">
        <rect x="-30" y="-12" width="60" height="14" rx="7" fill="rgba(11, 15, 26, 0.8)" className="backdrop-blur-md" />
        <text textAnchor="middle" className="text-[8px] font-bold fill-white/80 uppercase tracking-widest">{name}</text>
      </g>
    </motion.g>
);

const UILayer = ({ emergencyMeeting }: { emergencyMeeting: any }) => {
  const { activeRoom, setActiveRoom, activeProjectId } = useWorkspaceStore();

  const renderModule = () => {
    if (activeRoom === 'reception') return <CrmWorkspace />;
    if (activeRoom === 'library') return <LibraryWorkspace />;
    if (activeRoom === 'team') return <TeamWorkspace />;
    if (!activeProjectId) return <ProjectSelectorRequired />;

    switch (activeRoom) {
      case 'phase00': return <FeasibilityForm />;
      case 'phase01': return <MapaHistoriasBoard onReset={() => {}} />;
      case 'phase02': return <DiagramWorkspace />;
      case 'phase03': return <DevHubWorkspace />;
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
            <div className="absolute inset-0 bg-[#0B0F1A]/95 backdrop-blur-2xl" onClick={() => setActiveRoom('idle')} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full h-full max-w-[95vw] max-h-[90vh] bg-[#0A0F1A] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-zinc-900/20">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20"><Box size={24} className="text-emerald-400" /></div>
                  <div><h2 className="text-2xl font-black text-white uppercase tracking-tighter">{activeRoom}</h2></div>
                </div>
                <button onClick={() => setActiveRoom('idle')} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-zinc-400 border border-white/5"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-auto">{renderModule()}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RE-ENTRY BUTTON (PREMIUM STYLE) */}
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
