import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { 
  X, Box, Sparkles, MapPin, ZoomIn, ZoomOut
} from 'lucide-react';
import { ActiveSprintBoard } from '../kanban/ActiveSprintBoard';
import { UniversalErdWorkspace } from '../design/UniversalErdWorkspace';
import { MapaHistoriasBoard } from '../agile/MapaHistoriasBoard';

// --- THEME ---
const THEME = {
  bg: "#0B0F1A",
  grid: "rgba(30, 41, 59, 0.2)",
  wall: "#1E293B",
  wallStroke: "#334155",
  text: "#94A3B8",
  colors: {
    reception: "#CBD5E1", 
    library:   "#A855F7", 
    team:      "#EC4899", 
    vault:     "#10B981", 
    dna:       "#84CC16", 
    strategy:  "#EAB308", 
    arch:      "#22D3EE", 
    devhub:    "#EF4444", 
    server:    "#3B82F6",
  }
};

// --- FURNITURE COMPONENTS ---
const Furniture = {
  Desk: ({ x, y, w, h, color }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={w} height={h} rx="2" fill="rgba(30, 41, 59, 0.4)" stroke={THEME.wall} strokeWidth="1" />
      <rect x={w*0.1} y={h*0.2} width={w*0.8} height={2} fill={color} opacity="0.3" />
      <circle cx={w/2} cy={h + 8} r="6" fill="#0F172A" stroke={THEME.wall} />
    </g>
  ),
  Server: ({ x, y, color }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect width="20" height="35" rx="1" fill="#020617" stroke={THEME.wall} />
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx="5" cy={5+i*6} r="1.2" fill={color} opacity={Math.random() > 0.5 ? 1 : 0.2} />
      ))}
    </g>
  )
};

// --- USER AVATAR ---
const UserAvatar = ({ x, y, name, initial, color }: any) => (
  <motion.g transform={`translate(${x}, ${y})`}>
    <circle r="12" fill={color} opacity="0.15"><animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite" /></circle>
    <circle r="8" fill="#FFF" stroke={color} strokeWidth="1.5" />
    <text dy="3" textAnchor="middle" fill="#000" className="text-[7px] font-black">{initial}</text>
    <g transform="translate(12, 0)">
       <rect width="45" height="12" x="0" y="-6" rx="3" fill="rgba(0,0,0,0.8)" />
       <text x="4" y="2" className="text-[6px] font-bold fill-white uppercase tracking-widest">{name}</text>
    </g>
  </motion.g>
);

// --- ARCHITECTURAL ROOM (PORTAL) ---
const IntegratedRoom = ({ config, isActive, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = THEME.colors[config.id as keyof typeof THEME.colors] || THEME.text;

  return (
    <g 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      {/* Floor */}
      <rect 
        x={config.x} y={config.y} width={config.w} height={config.h} 
        fill={isActive ? `${color}15` : "transparent"} 
        className="transition-colors duration-500" 
      />
      
      {/* Glow for Active Room */}
      {isActive && (
        <rect 
          x={config.x} y={config.y} width={config.w} height={config.h} 
          fill={`url(#glow-${config.id})`} 
          className="pointer-events-none" 
        />
      )}

      {/* Internal Furniture */}
      <g transform={`translate(${config.x}, ${config.y})`} opacity={isActive || isHovered ? 1 : 0.6} className="transition-opacity duration-500">
        {config.content}
      </g>

      {/* Room Title */}
      <g transform={`translate(${config.x + 10}, ${config.y + 20})`}>
        <text className="text-[8px] font-black uppercase tracking-[0.2em]" fill={isActive || isHovered ? "#FFF" : THEME.text}>{config.title}</text>
        <rect y="6" width="15" height="1.5" fill={color} opacity={isActive || isHovered ? 1 : 0.3} />
      </g>
    </g>
  );
};

export const WorkspaceMap: React.FC = () => {
  const { activeRoom, setActiveRoom } = useWorkspaceStore();
  const [zoom, setZoom] = useState(1);

  const ROOMS = useMemo(() => [
    // --- TOP WING (Horizontal Row, Sharing Walls) ---
    { id: 'reception', x: 40, y: 40, w: 200, h: 240, title: "RECEPCIÓN & CRM", content: <Furniture.Desk x={120} y={60} w={50} h={30} color={THEME.colors.reception} /> },
    { id: 'library',   x: 240, y: 40, w: 200, h: 240, title: "BIBLIOTECA IA", content: <rect x={20} y={60} width={10} height={120} fill={THEME.colors.library} opacity="0.2" /> },
    { id: 'team',      x: 440, y: 40, w: 200, h: 240, title: "SALA DE EQUIPO", content: <circle cx={100} cy={100} r="30" fill="none" stroke={THEME.wall} strokeWidth="1" /> },
    { id: 'vault',     x: 640, y: 40, w: 200, h: 240, title: "LA BÓVEDA", content: <rect x={150} y={60} width={20} height={20} fill={THEME.colors.vault} opacity="0.2" /> },

    // --- BOTTOM WING (Horizontal Row) ---
    { id: 'phase00', x: 40, y: 360, w: 200, h: 240, title: "LAB ADN", content: <circle cx={100} cy={120} r="10" fill={THEME.colors.dna} opacity="0.2" /> },
    { id: 'phase01', x: 240, y: 360, w: 200, h: 240, title: "ESTRATEGIA", content: <rect x={40} y={80} width={120} height={60} rx="4" fill="rgba(30, 41, 59, 0.4)" /> },
    { id: 'phase02', x: 440, y: 360, w: 200, h: 240, title: "ARQUITECTURA", content: <path d="M 60 100 L 140 100" stroke={THEME.colors.arch} strokeWidth="1" strokeDasharray="4,4" /> },
    { id: 'phase04', x: 640, y: 360, w: 200, h: 240, title: "QA LAB", content: <rect x={60} y={80} width={80} height={80} fill="none" stroke={THEME.colors.devhub} strokeWidth="1" strokeDasharray="2,2" /> },

    // --- RIGHT WING ---
    { id: 'phase03', x: 840, y: 40, w: 320, h: 400, title: "DEVHUB MANDO", content: <g transform="translate(40, 100)">{Array.from({length:3}).map((_,i)=><Furniture.Desk key={i} x={0} y={i*60} w={60} h={30} color={THEME.colors.devhub} />)}</g> },
    { id: 'server',   x: 840, y: 440, w: 320, h: 160, title: "DATA CENTER", content: <g transform="translate(40, 40)">{Array.from({length:6}).map((_,i)=><Furniture.Server key={i} x={i*40} y={0} color={THEME.colors.server} />)}</g> }
  ], []);

  return (
    <div 
      className="relative w-full h-full bg-[#0B0F1A] overflow-hidden flex items-center justify-center font-sans"
      onWheel={(e) => setZoom(prev => Math.min(Math.max(0.5, prev - e.deltaY * 0.001), 3))}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(${THEME.grid} 1px, transparent 1px), linear-gradient(90deg, ${THEME.grid} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <motion.div 
        className="relative cursor-grab active:cursor-grabbing" 
        drag dragMomentum={false} 
        dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }} 
        animate={{ scale: zoom }} 
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        <svg width="1200" height="650" viewBox="0 0 1200 650" className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
          <defs>
            {ROOMS.map(r => (
              <radialGradient key={r.id} id={`glow-${r.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={THEME.colors[r.id as keyof typeof THEME.colors]} stopOpacity="0.15" />
                <stop offset="100%" stopColor={THEME.colors[r.id as keyof typeof THEME.colors]} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* 1. FLOOR PLAN SKELETON (Integrated Walls) */}
          <g fill="none" stroke={THEME.wallStroke} strokeWidth="4" strokeLinecap="square">
            {/* Top Wing Perimeter & Shared Walls */}
            <path d="M 40 40 L 840 40 L 840 280 L 40 280 Z" /> {/* Border */}
            <path d="M 240 40 L 240 280 M 440 40 L 440 280 M 640 40 L 640 280" /> {/* Shared Verticals */}
            
            {/* Bottom Wing Perimeter & Shared Walls */}
            <path d="M 40 360 L 840 360 L 840 600 L 40 600 Z" /> {/* Border */}
            <path d="M 240 360 L 240 600 M 440 360 L 440 600 M 640 360 L 640 600" /> {/* Shared Verticals */}

            {/* Right Wing (DevHub) */}
            <path d="M 840 40 L 1160 40 L 1160 600 L 840 600" />
            <path d="M 840 440 L 1160 440" /> {/* Shared Horizontal */}

            {/* 2. DOORS / OPENINGS (Gaps in Walls toward the Corridor) */}
            {/* Top Row Doors (facing down) */}
            <g stroke={THEME.bg} strokeWidth="6">
               <line x1="120" y1="280" x2="160" y2="280" />
               <line x1="320" y1="280" x2="360" y2="280" />
               <line x1="520" y1="280" x2="560" y2="280" />
               <line x1="720" y1="280" x2="760" y2="280" />
            </g>
            {/* Bottom Row Doors (facing up) */}
            <g stroke={THEME.bg} strokeWidth="6">
               <line x1="120" y1="360" x2="160" y2="360" />
               <line x1="320" y1="360" x2="360" y2="360" />
               <line x1="520" y1="360" x2="560" y2="360" />
               <line x1="720" y1="360" x2="760" y2="360" />
            </g>
            {/* Right Wing Door (facing left) */}
            <line x1="840" y1="180" x2="840" y2="220" stroke={THEME.bg} strokeWidth="6" />
          </g>

          {/* 3. INTERACTIVE LAYERS (Behind Walls) */}
          {ROOMS.map(room => (
            <IntegratedRoom key={room.id} config={room} isActive={activeRoom === room.id} onClick={() => setActiveRoom(room.id as any)} />
          ))}

          {/* 4. CENTRAL CORRIDOR (Visual Hint) */}
          <rect x="40" y="280" width="800" height="80" fill="rgba(30, 41, 59, 0.05)" />
          <text x="440" y="325" className="text-[10px] font-black fill-white/5 uppercase tracking-[1em]">Corredor de Mando Central</text>

          {/* 5. LIVE USERS */}
          <UserAvatar x={140} y={140} name="Mariano" initial="M" color={THEME.colors.arch} />
          <UserAvatar x={950} y={200} name="Dev Bot" initial="D" color={THEME.colors.devhub} />
        </svg>
      </motion.div>

      {/* NAVIGATION UI */}
      <div className="absolute bottom-10 left-10 flex items-center gap-6 z-50">
         <div className="bg-[#161B26] p-4 rounded-[2rem] border border-white/5 flex items-center gap-6 shadow-2xl">
            <div className="flex items-center gap-3 pl-2">
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><MapPin size={20} /></div>
               <div>
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">SISTEMA SPATIAL</div>
                  <div className="text-xs font-black text-white uppercase tracking-wider">BLUEPRINT INTEGRADO</div>
               </div>
            </div>
            <div className="h-8 w-[1px] bg-white/5" />
            <div className="flex items-center gap-2">
               <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ZoomIn size={18} /></button>
               <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ZoomOut size={18} /></button>
            </div>
         </div>
      </div>

      <UILayer />
    </div>
  );
};


function UILayer() {
  const activeRoom = useWorkspaceStore(state => state.activeRoom);
  const setActiveRoom = useWorkspaceStore(state => state.setActiveRoom);
  const activeProjectId = useWorkspaceStore(state => state.activeProjectId);

  if (activeRoom === 'idle') return null;

  const renderModule = () => {
    switch (activeRoom) {
      case 'phase03': // DevHub
        return (
          <ActiveSprintBoard 
            proyectoId={activeProjectId || 'default'} 
            sprint={{ 
              id: 'current', 
              nombre: 'Sprint de Lanzamiento', 
              objetivo: 'Finalizar Spatial OS Phase 3', 
              fechaInicio: '', 
              fechaFin: '', 
              estado: 'Activo',
              proyectoId: activeProjectId || 'default'
            }} 
            onSprintClosed={() => setActiveRoom('idle')}
          />
        );
      case 'phase02': // Arquitectura
        return (
          <UniversalErdWorkspace 
            initialCode={JSON.stringify({
              project_name: 'Arquitectura de Sistema',
              tables: [],
              relationships: []
            })} 
            onCodeChange={() => {}} 
          />
        );
      case 'phase01': // Estrategia
        return (
          <MapaHistoriasBoard 
            projectId={activeProjectId || 'default'}
            onReset={() => {}}
            initialData={{
              proyecto: "Plan Estratégico",
              personas: [{ id: '1', nombre: 'Product Owner' }],
              releases: [{ id: 'r1', nombre: 'MVP', descripcion: 'Versión inicial' }],
              epics: [{ id: 'e1', nombre: 'Core', color: '#10b981', features: [] }]
            }}
          />
        );
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-zinc-950/50">
            <Sparkles size={100} className="text-emerald-500 mb-10 animate-pulse" />
            <h3 className="text-4xl font-black text-white uppercase tracking-[0.4em] mb-6">Módulo {activeRoom.toUpperCase()}</h3>
            <p className="text-emerald-500/60 max-w-md text-xl font-bold leading-relaxed uppercase tracking-widest">
              En construcción. Conectando con API .NET 8...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-300">
      <div className="absolute inset-0 bg-[#0B0F1A]/95 backdrop-blur-2xl" onClick={() => setActiveRoom('idle')} />
      
      <div className="relative w-[95vw] h-[95vh] bg-[#0A0F1A] border border-white/10 rounded-[3rem] shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-zinc-900/20">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
              <Box size={24} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{activeRoom}</h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Sincronización de Datos Activa</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActiveRoom('idle')} 
            className="w-12 h-12 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-zinc-400 transition-all border border-white/5"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenedor del Módulo Inyectado */}
        <div className="flex-1 overflow-auto bg-zinc-950/20">
            {renderModule()}
        </div>
      </div>
    </div>
  );
}
