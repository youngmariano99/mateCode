import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { api as apiClient } from '../../lib/apiClient';
import { ChevronDown, User, Zap, LogOut, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Project {
  id: string;
  nombre: string;
}

interface Workspace {
  id: string;
  nombre: string;
}

interface Invitation {
  workspaceId: string;
  workspaceNombre: string;
  rolInvitado: string;
}

export const WorkspaceTopBar: React.FC = () => {
  const { activeProjectId, setActiveProjectId, workspaceId, setWorkspaceId } = useWorkspaceStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInvites, setShowInvites] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Cargar Espacios de Trabajo e Invitaciones
  const fetchWorkspacesData = async () => {
    try {
      const [wsData, invitesData] = await Promise.all([
        apiClient.get('/Workspace'),
        apiClient.get('/Workspace/invitations')
      ]);
      setWorkspaces(wsData as Workspace[]);
      setInvitations(invitesData as Invitation[]);

      const savedWs = localStorage.getItem('mc_current_tenant');
      const workspacesList = wsData as Workspace[];

      if (workspacesList.length > 0) {
        // Si hay un espacio guardado y sigue siendo válido, lo usamos
        if (savedWs && workspacesList.some(w => w.id === savedWs)) {
            setWorkspaceId(savedWs);
        } else {
            setWorkspaceId(workspacesList[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading workspaces", error);
    }
  };

  useEffect(() => {
    fetchWorkspacesData();
  }, []);

  const [isTenantReady, setIsTenantReady] = useState(false);

  // Sincronizar con LocalStorage para que el apiClient tenga el Header correcto
  useEffect(() => {
    if (workspaceId && workspaceId !== 'undefined' && workspaceId !== 'null' && workspaceId.length > 10) {
        setIsTenantReady(false); // Bloqueamos peticiones mientras cambiamos
        localStorage.setItem('mc_current_tenant', workspaceId);
        setProjects([]);
        // Damos un respiro al sistema para asegurar el guardado
        setTimeout(() => setIsTenantReady(true), 50);
    } else {
        setIsTenantReady(false);
    }
  }, [workspaceId]);

  // Cargar Proyectos del Espacio Seleccionado
  useEffect(() => {
    const fetchProjects = async () => {
      if (!workspaceId || !isTenantReady) return;

      try {
        const data = await apiClient.get('/Project');
        const projectsData = data as Project[];
        setProjects(projectsData);
        
        if (projectsData.length > 0 && !activeProjectId) {
          setActiveProjectId(projectsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching projects", error);
        setProjects([]);
      }
    };

    if (isTenantReady) {
        fetchProjects();
    }
  }, [workspaceId, isTenantReady, setActiveProjectId, activeProjectId]);

  const handleAcceptInvite = async (wId: string) => {
    try {
        await apiClient.post(`/Workspace/accept/${wId}`, {});
        fetchWorkspacesData();
        setShowInvites(false);
    } catch (e) { console.error(e); }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#0B0F1A]/90 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 z-[100] shadow-2xl">
      {/* Lado Izquierdo: Logo & Workspace Selector */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-lg group hover:scale-105 transition-all">
                <Zap size={20} className="text-emerald-400 fill-emerald-400/20" />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-black tracking-[0.2em] text-white uppercase italic leading-none">MateCode</span>
                <span className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-[0.3em]">Spatial OS</span>
            </div>
        </div>

        <div className="h-8 w-px bg-white/10 mx-2" />

        {/* SELECTOR DE ESPACIO DE TRABAJO */}
        <div className="relative group">
            <select
                value={workspaceId || ''}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-zinc-300 uppercase tracking-widest focus:outline-none focus:border-emerald-500/40 hover:bg-white/10 transition-all cursor-pointer min-w-[180px] appearance-none"
            >
                {workspaces.map(ws => <option key={ws.id} value={ws.id} className="bg-zinc-950">{ws.nombre}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Centro: Selector de Proyecto Activo */}
      <div className="flex-1 max-w-sm">
        <div className="relative group">
          <select
            value={activeProjectId || ''}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-6 py-2.5 text-xs font-black text-emerald-500 appearance-none focus:outline-none focus:border-emerald-500/50 hover:bg-emerald-500/10 transition-all cursor-pointer uppercase tracking-widest text-center"
          >
            {projects.length > 0 ? (
              projects.map((p) => <option key={p.id} value={p.id} className="bg-zinc-950 text-white">{p.nombre}</option>)
            ) : (
              <option>Cargando Proyectos...</option>
            )}
          </select>
        </div>
      </div>

      {/* Lado Derecho: Invitaciones, Avatar & Logout */}
      <div className="flex items-center gap-6">
        
        {/* BOTÓN DE INVITACIONES */}
        <div className="relative">
            <button 
                onClick={() => setShowInvites(!showInvites)}
                className={`p-2.5 rounded-xl border transition-all relative ${invitations.length > 0 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse' : 'bg-white/5 border-white/10 text-zinc-500'}`}
            >
                <Mail size={20} />
                {invitations.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[#0B0F1A]">
                        {invitations.length}
                    </span>
                )}
            </button>

            {/* POPUP DE INVITACIONES */}
            {showInvites && (
                <div className="absolute top-full right-0 mt-4 w-72 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-2 z-[200]">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Invitaciones Pendientes</h4>
                    {invitations.length === 0 ? (
                        <p className="text-[9px] text-zinc-600 uppercase text-center py-4">No tenés solicitudes</p>
                    ) : (
                        <div className="space-y-3">
                            {invitations.map(inv => (
                                <div key={inv.workspaceId} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs font-bold text-white mb-1">{inv.workspaceNombre}</p>
                                    <p className="text-[8px] text-zinc-500 uppercase mb-3">Rol: {inv.rolInvitado}</p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleAcceptInvite(inv.workspaceId)}
                                            className="flex-1 py-1.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg hover:bg-blue-500 transition-all"
                                        >Aceptar</button>
                                        <button className="flex-1 py-1.5 bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase rounded-lg">Ignorar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black text-white uppercase tracking-widest">{user?.email?.split('@')[0] || 'Arquitecto'}</div>
                <div className="text-[8px] text-emerald-500/70 font-bold uppercase tracking-widest">Master Key</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-white shadow-xl">
                <User size={20} />
            </div>
            <button 
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
            >
                <LogOut size={18} />
            </button>
        </div>
      </div>
    </header>
  );
};
