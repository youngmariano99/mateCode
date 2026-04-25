import React from 'react';
import { 
    Coffee, Code, Monitor, Users, Zap, AlertTriangle, 
    Layers, Terminal, Activity, ShieldAlert, Microscope, 
    Globe, Layout, PenTool, DoorOpen
} from 'lucide-react';

interface UserPresence {
    userId: string;
    nombre: string;
    zonaActual: string;
    actividadActual?: { tipo: string, id: string, titulo: string, especialidad?: string };
    globoDialogo?: { texto: string, tipo: 'info' | 'accion' | 'alerta', expiraEn: number };
}

interface VirtualOfficeMapProps {
    users: UserPresence[];
    activeBoards?: { id: string, nombre: string, sala: number }[];
    onJoinBoard?: (boardId: string) => void;
}

export const VirtualOfficeMap: React.FC<VirtualOfficeMapProps> = ({ users, activeBoards = [], onJoinBoard }) => {
    
    // Configuración de Zonas Reales (Grilla 12x12)
    const zones = [
        // 🧠 ÁREA DE FOCO (Top)
        { id: 'focus_frontend', name: 'Frontend Lab', Icon: Layout, iconColor: "text-purple-400", grid: "col-start-1 col-span-3 row-start-1 row-span-3", color: "border-purple-500/20 bg-purple-500/5" },
        { id: 'focus_backend', name: 'Server Room', Icon: Terminal, iconColor: "text-blue-400", grid: "col-start-4 col-span-3 row-start-1 row-span-3", color: "border-blue-500/20 bg-blue-500/5" },
        { id: 'focus_qa', name: 'Quarantine (QA)', Icon: Microscope, iconColor: "text-yellow-500", grid: "col-start-7 col-span-3 row-start-1 row-span-3", color: "border-yellow-500/20 bg-yellow-500/5" },
        { id: 'focus_devops', name: 'Command Center', Icon: Globe, iconColor: "text-emerald-400", grid: "col-start-10 col-span-3 row-start-1 row-span-3", color: "border-emerald-500/20 bg-emerald-500/5" },

        // ☕ ÁREA SOCIAL (Middle)
        { id: 'pasillo', name: 'Cafetería', Icon: Coffee, iconColor: "text-zinc-500", grid: "col-start-2 col-span-4 row-start-5 row-span-3", color: "border-zinc-800/50 bg-zinc-900/40" },
        { id: 'kanban_wall', name: 'Tablero Kanban', Icon: Layers, iconColor: "text-zinc-500", grid: "col-start-7 col-span-4 row-start-5 row-span-3", color: "border-zinc-800/50 bg-zinc-900/40" },

        // ⚔️ ÁREA COLABORATIVA (Bottom)
        { id: 'observatory', name: 'El Observatorio', Icon: Activity, iconColor: "text-cyan-400", grid: "col-start-1 col-span-3 row-start-9 row-span-4", color: "border-cyan-500/20 bg-cyan-500/5" },
        { id: 'reunion', name: 'Sala de Guerra', Icon: ShieldAlert, iconColor: "text-red-500", grid: "col-start-5 col-span-4 row-start-9 row-span-4", color: "border-red-500/20 bg-red-500/5 shadow-[0_0_50px_-12px_rgba(239,68,68,0.1)]" },
        
        // Pizarras
        { id: 'pizarra_1', name: 'Pizarra 1', Icon: PenTool, iconColor: "text-zinc-600", grid: "col-start-10 col-span-3 row-start-9 row-span-1", color: "border-zinc-800 bg-zinc-950/50" },
        { id: 'pizarra_2', name: 'Pizarra 2', Icon: PenTool, iconColor: "text-zinc-600", grid: "col-start-10 col-span-3 row-start-10 row-span-1", color: "border-zinc-800 bg-zinc-950/50" },
        { id: 'pizarra_3', name: 'Pizarra 3', Icon: PenTool, iconColor: "text-zinc-600", grid: "col-start-10 col-span-3 row-start-11 row-span-1", color: "border-zinc-800 bg-zinc-950/50" },
    ];

    const getPositionForUser = (user: UserPresence, index: number) => {
        const offset = (index % 5) * 20 - 40;
        const baseZone = zones.find(z => z.id === user.zonaActual) || zones[4]; // Default cafeteria
        
        // Convertimos el grid string a porcentajes aproximados
        // Simplificación: usaremos el ID para retornar presets de posición
        switch (user.zonaActual) {
            case 'focus_frontend': return { top: '12%', left: '12%', transform: `translate(${offset}px, ${offset}px)` };
            case 'focus_backend': return { top: '12%', left: '37%', transform: `translate(${offset}px, ${offset}px)` };
            case 'focus_qa': return { top: '12%', left: '62%', transform: `translate(${offset}px, ${offset}px)` };
            case 'focus_devops': return { top: '12%', left: '87%', transform: `translate(${offset}px, ${offset}px)` };
            case 'pasillo': return { top: '50%', left: '30%', transform: `translate(${offset}px, ${offset}px)` };
            case 'kanban_wall': return { top: '50%', left: '70%', transform: `translate(${offset}px, ${offset}px)` };
            case 'observatory': return { top: '85%', left: '12%', transform: `translate(${offset}px, ${offset}px)` };
            case 'reunion': return { top: '85%', left: '50%', transform: `translate(-50%, -50%) translate(${offset}px, ${offset}px)` };
            case 'pizarra_1': return { top: '75%', left: '87%', transform: `translate(${offset}px, 0)` };
            case 'pizarra_2': return { top: '83%', left: '87%', transform: `translate(${offset}px, 0)` };
            case 'pizarra_3': return { top: '91%', left: '87%', transform: `translate(${offset}px, 0)` };
            default: return { top: '50%', left: '30%', transform: `translate(${offset}px, ${offset}px)` };
        }
    };

    return (
        <div className="relative w-full h-full bg-zinc-950 overflow-hidden select-none font-sans">
            {/* Background Blueprint Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            {/* Ambient Lighting */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full"></div>

            {/* Zonas Grid */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 p-6 gap-4">
                
                {zones.map(zone => {
                    const isOccupiedBoard = activeBoards.find(b => `pizarra_${b.sala}` === zone.id);
                    return (
                        <div 
                            key={zone.id} 
                            className={`${zone.grid} ${zone.color} border rounded-2xl flex flex-col items-center justify-center gap-2 relative transition-all duration-700 overflow-hidden group`}
                        >
                            {/* Visual Decorations based on ID */}
                            {zone.id === 'focus_backend' && (
                                <div className="absolute bottom-2 right-2 flex gap-1 opacity-20">
                                    <div className="w-1 h-3 bg-blue-500 animate-pulse"></div>
                                    <div className="w-1 h-3 bg-blue-400 animate-pulse delay-75"></div>
                                    <div className="w-1 h-3 bg-blue-300 animate-pulse delay-150"></div>
                                </div>
                            )}
                            {zone.id === 'focus_qa' && (
                                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(234,179,8,0.05)_10px,rgba(234,179,8,0.05)_20px)]"></div>
                            )}
                            {zone.id === 'reunion' && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-500/10 rounded-full blur-2xl animate-pulse"></div>
                            )}

                            <div className="p-2 bg-zinc-950/80 rounded-lg border border-zinc-800 shadow-xl z-10">
                                <zone.Icon size={24} className={zone.iconColor} />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 z-10">{zone.name}</span>

                            {/* Board Overlay */}
                            {isOccupiedBoard && (
                                <div className="absolute inset-0 bg-emerald-500/10 flex flex-col items-center justify-center gap-2 animate-in fade-in duration-500 z-20">
                                    <div className="text-[7px] font-bold text-emerald-400 uppercase bg-zinc-950 px-2 py-1 rounded border border-emerald-500/30">Pizarra Activa</div>
                                    <button 
                                        onClick={() => onJoinBoard?.(isOccupiedBoard.id)}
                                        className="text-[9px] font-black text-white bg-emerald-600 px-3 py-1 rounded-full shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 transition-all flex items-center gap-1"
                                    >
                                        <DoorOpen size={10} /> ENTRAR
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Etiquetas de Áreas */}
                <div className="col-start-1 col-span-12 row-start-4 flex items-center justify-center">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                    <span className="px-6 text-[9px] font-black text-zinc-600 uppercase tracking-[1em]">Área de Foco</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 via-zinc-800 to-transparent"></div>
                </div>
                <div className="col-start-1 col-span-12 row-start-8 flex items-center justify-center">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                    <span className="px-6 text-[9px] font-black text-zinc-600 uppercase tracking-[1em]">Área Colaborativa</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 via-zinc-800 to-transparent"></div>
                </div>
            </div>

            {/* Avatares */}
            {users.map((user, i) => {
                const pos = getPositionForUser(user, i);
                return (
                    <div 
                        key={user.userId}
                        className="absolute transition-all duration-1000 ease-in-out z-50 flex flex-col items-center"
                        style={pos}
                    >
                        {/* Globo de Diálogo */}
                        {user.globoDialogo && (
                            <div className="mb-4 animate-bounce-subtle">
                                <div className={`relative px-4 py-2 rounded-2xl text-[10px] font-bold shadow-2xl border ${
                                    user.globoDialogo.tipo === 'alerta' ? 'bg-red-600 text-white border-red-400' :
                                    user.globoDialogo.tipo === 'accion' ? 'bg-emerald-600 text-white border-emerald-400' :
                                    'bg-zinc-800 text-zinc-100 border-zinc-600'
                                }`}>
                                    {user.globoDialogo.texto}
                                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45 border-r border-b ${
                                        user.globoDialogo.tipo === 'alerta' ? 'bg-red-600 border-red-400' :
                                        user.globoDialogo.tipo === 'accion' ? 'bg-emerald-600 border-emerald-400' :
                                        'bg-zinc-800 border-zinc-600'
                                    }`}></div>
                                </div>
                            </div>
                        )}

                        <div className="group relative">
                            {/* Avatar Circle */}
                            <div className={`w-14 h-14 rounded-full border-[4px] border-zinc-950 shadow-2xl flex items-center justify-center text-lg font-black transition-all group-hover:scale-110 ${
                                user.zonaActual === 'reunion' ? 'bg-red-600 text-white animate-pulse' : 
                                user.zonaActual.includes('focus') ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' :
                                'bg-zinc-800 text-zinc-400'
                            }`}>
                                {user.nombre.substring(0, 2).toUpperCase()}
                            </div>
                            
                            {/* Status Info Bubble */}
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[60]">
                                <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-[9px] flex flex-col items-center shadow-2xl">
                                    <span className="font-black text-white uppercase tracking-widest">{user.nombre}</span>
                                    {user.actividadActual && (
                                        <span className="text-emerald-400 font-bold mt-1 flex items-center gap-1">
                                            <Zap size={8} /> {user.actividadActual.titulo}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
