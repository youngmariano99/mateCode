import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, Briefcase, Users, Target, FileText, Calendar, CalendarDays, Key, Video,
  DollarSign, ShieldAlert, ArrowLeft, Shield, Layout, Search, Plus, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../lib/apiClient';
import { useAgencyStore } from '../../store/useAgencyStore';
import type { Member } from '../../store/useAgencyStore';

// Modulos satélite
import { StructurePanel } from '../../components/agency/StructurePanel';
import { CrmPanel } from '../../components/agency/CrmPanel';
import { GoalsPanel } from '../../components/agency/GoalsPanel';
import { ResourcesPanel } from '../../components/agency/ResourcesPanel';
import { TasksPanel } from '../../components/agency/TasksPanel';
import { SecretsPanel } from '../../components/agency/SecretsPanel';
import { ContentPanel } from '../../components/agency/ContentPanel';
import { FinancePanel } from '../../components/agency/FinancePanel';
import { AuditPanel } from '../../components/agency/AuditPanel';
import { CalendarPanel } from '../../components/agency/CalendarPanel';
import { DynamicWorkspace, type WorkspaceViewMode } from '../../components/spatial/DynamicWorkspace';

const AGENCY_TABS = [
  { id: 'structure', label: 'Estructura & Equipo', desc: 'Estructura & Equipo', icon: Briefcase, top: '6%', left: '6%', w: '26%', h: '24%' },
  { id: 'crm', label: 'Clientes & Leads', desc: 'Clientes & CRM', icon: Users, top: '6%', left: '37%', w: '26%', h: '24%' },
  { id: 'goals', label: 'Objetivos Cruzados', desc: 'Muro OKR', icon: Target, top: '6%', left: '68%', w: '26%', h: '24%' },
  { id: 'resources', label: 'Recursos Vault', desc: 'Biblioteca Prompts', icon: FileText, top: '36%', left: '6%', w: '26%', h: '24%' },
  { id: 'tasks', label: 'Tareas Operativas', desc: 'Tablero Kanban', icon: Calendar, top: '36%', left: '37%', w: '26%', h: '24%' },
  { id: 'secrets', label: 'Accesos Cifrados', desc: 'Accesos Cifrados', icon: Key, top: '36%', left: '68%', w: '26%', h: '24%' },
  { id: 'content', label: 'Planificador Contenido', desc: 'Plan de Contenido', icon: Video, top: '66%', left: '6%', w: '26%', h: '24%' },
  { id: 'finance', label: 'Finanzas Dashboard', desc: 'Finanzas Corporativas', icon: DollarSign, top: '66%', left: '37%', w: '26%', h: '24%' },
  { id: 'audit', label: 'Logs de Auditoría', desc: 'Logs de Seguridad', icon: ShieldAlert, top: '66%', left: '68%', w: '26%', h: '24%' },
  { id: 'calendar', label: 'Calendario Operativo', desc: 'Calendario Operativo', icon: CalendarDays, top: '0%', left: '0%', w: '0%', h: '0%', hideImmersiveMap: true },
];

export const AgencyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeAgency,
    currentAgencyId,
    fetchMembers,
    inviteMember,
    updateMemberPermissions,
    getAgencyWorkspaces,
    getAgencyWorkspacesWithProjects
  } = useAgencyStore();

  const [activeTab, setActiveTab] = useState<string>('structure');
  const [dashboardMode, setDashboardMode] = useState<'standard' | 'immersive'>('immersive');
  const [activeModalTab, setActiveModalTab] = useState<string | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceViewMode>('windowed');
  const [agencyWorkspaces, setAgencyWorkspaces] = useState<any[]>([]);
  const [agencyMembers, setAgencyMembers] = useState<Member[]>([]);
  const [workspacesWithProjects, setWorkspacesWithProjects] = useState<any[]>([]);

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'structure':
        return (
          <StructurePanel
            activeAgency={activeAgency}
            agencyWorkspaces={agencyWorkspaces}
            agencyMembers={agencyMembers}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            onOpenPermModal={handleOpenPermModal}
          />
        );
      case 'crm':
        return <CrmPanel />;
      case 'goals':
        return <GoalsPanel agencyMembers={agencyMembers} />;
      case 'resources':
        return <ResourcesPanel />;
      case 'tasks':
        return <TasksPanel agencyMembers={agencyMembers} />;
      case 'secrets':
        return <SecretsPanel />;
      case 'content':
        return <ContentPanel agencyMembers={agencyMembers} />;
      case 'finance':
        return <FinancePanel agencyWorkspaces={agencyWorkspaces} />;
      case 'audit':
        return <AuditPanel />;
      case 'calendar':
        return <CalendarPanel agencyMembers={agencyMembers} />;
      default:
        return null;
    }
  };

  // Modals / forms states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Form Fields State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRol, setInviteRol] = useState('Colaborador');
  const [inviteRoleTag, setInviteRoleTag] = useState('');
  const [inviteModules, setInviteModules] = useState({ crm: 'write', secrets: 'none', finances: 'none', tasks: 'read' });
  const [inviteWorkspaces, setInviteWorkspaces] = useState<Record<string, boolean>>({});
  const [inviteProjects, setInviteProjects] = useState<Record<string, boolean>>({});

  const [inviteSearchTerm, setInviteSearchTerm] = useState('');
  const [inviteSearchResults, setInviteSearchResults] = useState<any[]>([]);
  const [isInviteSearching, setIsInviteSearching] = useState(false);

  // Edit Perms State
  const [editRol, setEditRol] = useState('Colaborador');
  const [editRoleTag, setEditRoleTag] = useState('');
  const [editModules, setEditModules] = useState({ crm: 'write', secrets: 'none', finances: 'none', tasks: 'read' });
  const [editWorkspaces, setEditWorkspaces] = useState<Record<string, boolean>>({});
  const [editProjects, setEditProjects] = useState<Record<string, boolean>>({});

  const handleSearchUsers = async (query: string) => {
    setInviteSearchTerm(query);
    if (query.length < 3) {
      setInviteSearchResults([]);
      return;
    }
    setIsInviteSearching(true);
    try {
      const results = await api.get(`/Team/search?q=${query}`);
      setInviteSearchResults(results as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviteSearching(false);
    }
  };

  useEffect(() => {
    if (!currentAgencyId) {
      navigate('/workspace-selector');
      return;
    }
    loadData();
  }, [currentAgencyId]);

  const loadData = async () => {
    if (!currentAgencyId) return;
    try {
      const wss = await getAgencyWorkspaces(currentAgencyId);
      setAgencyWorkspaces(wss);
      const mems = await fetchMembers(currentAgencyId);
      setAgencyMembers(mems);
      const wssWithProj = await getAgencyWorkspacesWithProjects(currentAgencyId);
      setWorkspacesWithProjects(wssWithProj);
    } catch (e) {
      console.error("Error al cargar la estructura del dashboard", e);
    }
  };

  const handleInviteWorkspaceChange = (wsId: string, checked: boolean) => {
    setInviteWorkspaces(prev => ({ ...prev, [wsId]: checked }));
    if (!checked) {
      const ws = workspacesWithProjects.find(w => w.id === wsId);
      if (ws && ws.projects) {
        setInviteProjects(prev => {
          const next = { ...prev };
          ws.projects.forEach((p: any) => {
            next[p.id] = false;
          });
          return next;
        });
      }
    }
  };

  const handleEditWorkspaceChange = (wsId: string, checked: boolean) => {
    setEditWorkspaces(prev => ({ ...prev, [wsId]: checked }));
    if (!checked) {
      const ws = workspacesWithProjects.find(w => w.id === wsId);
      if (ws && ws.projects) {
        setEditProjects(prev => {
          const next = { ...prev };
          ws.projects.forEach((p: any) => {
            next[p.id] = false;
          });
          return next;
        });
      }
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgencyId) return;
    const permissionsObj = {
      modules: inviteModules,
      roleTag: inviteRoleTag,
      workspaces: inviteWorkspaces,
      projects: inviteProjects
    };
    try {
      const ok = await inviteMember(currentAgencyId, inviteEmail, inviteRol, permissionsObj);
      if (ok) {
        Swal.fire({ title: 'Éxito', text: 'Invitación enviada con éxito.', icon: 'success', background: '#09090b', color: '#f4f4f5' });
        setIsInviteModalOpen(false);
        setInviteEmail('');
        setInviteSearchTerm('');
        setInviteSearchResults([]);
        setInviteRol('Colaborador');
        setInviteRoleTag('');
        setInviteModules({ crm: 'write', secrets: 'none', finances: 'none', tasks: 'read' });
        setInviteWorkspaces({});
        setInviteProjects({});
        await loadData();
      } else {
        Swal.fire({ title: 'Aviso', text: 'No se pudo enviar la invitación. Asegúrate de que el email corresponda a un usuario registrado.', icon: 'warning', background: '#09090b', color: '#f4f4f5' });
      }
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleOpenPermModal = (member: Member) => {
    setSelectedMember(member);
    let parsedPerms: any = {};
    if (member.permisos_json) {
      parsedPerms = typeof member.permisos_json === 'string' 
        ? JSON.parse(member.permisos_json) 
        : member.permisos_json;
    }
    const defaultModules = { crm: 'none', secrets: 'none', finances: 'none', tasks: 'none' };
    const modules = { ...defaultModules, ...(parsedPerms.modules || {}) };

    setEditRol(member.rol);
    setEditRoleTag(parsedPerms.roleTag || '');
    setEditModules(modules);
    setEditWorkspaces(parsedPerms.workspaces || {});
    setEditProjects(parsedPerms.projects || {});
    setIsPermModalOpen(true);
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgencyId || !selectedMember) return;
    const permissionsObj = {
      modules: editModules,
      roleTag: editRoleTag,
      workspaces: editWorkspaces,
      projects: editProjects
    };
    try {
      const ok = await updateMemberPermissions(currentAgencyId, selectedMember.usuario_id, editRol, permissionsObj);
      if (ok) {
        Swal.fire({ title: 'Permisos Guardados', icon: 'success', background: '#09090b', color: '#f4f4f5' });
        setIsPermModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans overflow-hidden w-full relative">
      {/* SIDEBAR */}
      {dashboardMode === 'standard' && (
        <div className="w-72 bg-zinc-900/60 border-r border-zinc-800/80 backdrop-blur-xl flex flex-col justify-between p-6 z-20">
          <div>
            <div className="flex items-center gap-3 pb-6 border-b border-zinc-800/80 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black font-black">
                <Building size={20} />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight text-white leading-tight">{activeAgency?.nombre}</h2>
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{activeAgency?.tipo === 'personal' ? 'Personal Space' : 'Corporate Agency'}</span>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5">
              {AGENCY_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3.5 ${activeTab === tab.id
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'border border-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                      }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-zinc-800/80 flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveModalTab(null);
                setDashboardMode('immersive');
              }}
              className="w-full py-2.5 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Layout size={14} />
              <span>Vista Inmersiva</span>
            </button>
            <button
              onClick={() => navigate('/workspace-selector?view=workspaces')}
              className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Layout size={14} />
              <span>Espacios de Trabajo</span>
            </button>
            <button
              onClick={() => navigate('/workspace-selector')}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Cambiar Empresa</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className={`flex-1 bg-zinc-950 relative z-10 flex flex-col h-screen ${dashboardMode === 'standard' ? 'p-10 overflow-y-auto' : 'p-6 overflow-hidden'}`}>
        <div className="absolute top-[-10%] right-[-10%] w-[35%] h-[35%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[10%] w-[35%] h-[35%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex-1 flex flex-col h-full">
          {dashboardMode === 'immersive' ? (
            <div className={`flex-1 flex flex-col items-center justify-between relative w-full h-full transition-all duration-500 ${activeModalTab !== null && workspaceMode === 'maximized' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
              {/* Header flotante */}
              <div className="w-full max-w-6xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between z-20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-black font-black">
                    <Building size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm tracking-tight text-white leading-tight">{activeAgency?.nombre}</h2>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{activeAgency?.tipo === 'personal' ? 'Espacio Personal' : 'Agencia Corporativa'}</span>
                  </div>
                </div>

                <div className="text-center hidden md:block">
                  <h1 className="text-lg font-black text-white tracking-tight uppercase italic flex items-center gap-2">
                    Oficina <span className="text-sky-400">MateCode</span> Argentina
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('calendar');
                      setActiveModalTab('calendar');
                    }}
                    className="py-2 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <CalendarDays size={14} />
                    <span>Calendario</span>
                  </button>
                  <button
                    onClick={() => setDashboardMode('standard')}
                    className="py-2 px-4 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Layout size={14} />
                    <span>Vista Estándar</span>
                  </button>
                  <button
                    onClick={() => navigate('/workspace-selector?view=workspaces')}
                    className="py-2 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Briefcase size={14} />
                    <span>Espacios</span>
                  </button>
                  <button
                    onClick={() => navigate('/workspace-selector')}
                    className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <ArrowLeft size={14} />
                    <span>Cambiar Empresa</span>
                  </button>
                </div>
              </div>

              {/* Contenedor del Mapa Inmersivo */}
              <div className="relative w-full max-w-6xl aspect-[16/10] border border-zinc-800/80 rounded-[2rem] overflow-hidden shadow-2xl bg-zinc-950/80 backdrop-blur-sm z-10 flex-1 my-4 flex items-center justify-center">
                <img
                  src="/agenciaInterfaz.png"
                  alt="Oficina MateCode"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 select-none pointer-events-none"
                />

                {/* Hotspots */}
                {AGENCY_TABS.filter(spot => !spot.hideImmersiveMap).map(spot => {
                  const Icon = spot.icon;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => {
                        setActiveTab(spot.id);
                        setActiveModalTab(spot.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: spot.top,
                        left: spot.left,
                        width: spot.w,
                        height: spot.h
                      }}
                      className="group border border-white/5 hover:border-sky-500/50 bg-zinc-950/20 hover:bg-sky-500/10 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-3 text-center backdrop-blur-[0.5px] hover:backdrop-blur-[3px] hover:shadow-[0_0_25px_rgba(14,165,233,0.15)] cursor-pointer"
                    >
                      <div className="p-2 bg-zinc-900/80 border border-zinc-800 group-hover:border-sky-400/30 group-hover:bg-sky-500 group-hover:text-black rounded-xl transition-all mb-1 text-zinc-400">
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-wider group-hover:text-sky-300 transition-colors">{spot.desc}</span>
                      <span className="text-[8px] text-zinc-500 font-bold uppercase mt-0.5 tracking-widest block opacity-0 group-hover:opacity-100 transition-opacity">{spot.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Botón de retorno al mapa */}
              <button
                onClick={() => {
                  setActiveModalTab(null);
                  setDashboardMode('immersive');
                }}
                className="mb-6 self-start px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-350 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md"
              >
                <ArrowLeft size={12} />
                <span>Volver a Oficina Inmersiva</span>
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col"
                >
                  {renderTabContent(activeTab)}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay via DynamicWorkspace for Immersive Mode */}
      <DynamicWorkspace
        isOpen={dashboardMode === 'immersive' && activeModalTab !== null}
        onClose={() => setActiveModalTab(null)}
        title={AGENCY_TABS.find(t => t.id === activeModalTab)?.label ?? ''}
        subtitle="Consola Operativa de Agencia"
        activeRoom={activeModalTab ? { id: activeModalTab, name: AGENCY_TABS.find(t => t.id === activeModalTab)?.label ?? '', accent: '#0ea5e9' } : null}
        onViewModeChange={setWorkspaceMode}
        quickSwitch={AGENCY_TABS.map(tab => ({
          id: tab.id,
          label: tab.label,
          icon: tab.icon
        }))}
        onQuickSwitch={(id) => {
          setActiveTab(id);
          setActiveModalTab(id);
        }}
      >
        <div className="p-8 min-h-full">
          {activeModalTab && renderTabContent(activeModalTab)}
        </div>
      </DynamicWorkspace>

      {/* Modals */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-emerald-400" />
                <span>Invitar Miembro a la Agencia</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Buscador de usuarios registrados */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Buscar Usuario Registrado</label>
              <div className="flex items-center bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                <Search size={14} className="text-zinc-500 mr-2" />
                <input
                  type="text"
                  placeholder="Escribe nombre o email (min. 3 caracteres)..."
                  value={inviteSearchTerm}
                  onChange={e => handleSearchUsers(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-xs text-white placeholder:text-zinc-650"
                />
                {isInviteSearching && <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
              </div>

              {inviteSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[100] max-h-48 overflow-y-auto">
                  {inviteSearchResults.map(u => (
                    <div
                      key={u.id}
                      onClick={() => {
                        setInviteEmail(u.email);
                        setInviteSearchTerm(u.nombreCompleto);
                        setInviteSearchResults([]);
                      }}
                      className="p-2.5 hover:bg-emerald-500/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <p className="font-bold text-white">{u.nombreCompleto}</p>
                        <p className="text-[10px] text-zinc-500">{u.email}</p>
                      </div>
                      <Plus size={14} className="text-emerald-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Email del Colaborador (Destinatario)</label>
                <input required type="email" placeholder="ejemplo@correo.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Rol en la Organización</label>
                  <select value={inviteRol} onChange={e => setInviteRol(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                    <option value="Administrador">Administrador</option>
                    <option value="Colaborador">Colaborador</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Etiqueta de Especialidad</label>
                  <input type="text" placeholder="Ej: Desarrollador | Frontend" value={inviteRoleTag} onChange={e => setInviteRoleTag(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
                </div>
              </div>

              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Matriz de Acceso Inicial</h4>

                {[
                  { key: 'crm', label: 'Clientes/CRM', icon: Users, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Editar / Crear' }] },
                  { key: 'secrets', label: 'Accesos Vault', icon: Key, options: [{ v: 'none', l: 'Prohibido' }, { v: 'read', l: 'Permitido Revelar' }] },
                  { key: 'finances', label: 'Finanzas', icon: DollarSign, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Registrar' }] },
                  { key: 'tasks', label: 'Tareas Operativas', icon: Calendar, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Organizar' }] },
                ].map(p => {
                  const Icon = p.icon;
                  return (
                    <div key={p.key} className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-xl border border-zinc-800">
                      <span className="text-xs text-zinc-300 flex items-center gap-2">
                        <Icon size={14} className="text-zinc-500" />
                        <span>{p.label}</span>
                      </span>
                      <select
                        value={(inviteModules as any)[p.key]}
                        onChange={e => setInviteModules({ ...inviteModules, [p.key]: e.target.value })}
                        className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-[10px] text-white"
                      >
                        {p.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Árbol Jerárquico de Espacios y Proyectos */}
              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Accesos a Espacios y Proyectos (Jerárquico)</h4>
                
                {workspacesWithProjects.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic">No hay espacios de trabajo en la agencia.</p>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto p-1 bg-zinc-950/20 rounded-xl border border-zinc-800">
                    {workspacesWithProjects.map(ws => {
                      const wsChecked = !!inviteWorkspaces[ws.id];
                      return (
                        <div key={ws.id} className="p-2 border border-zinc-900 bg-zinc-950/25 rounded-lg space-y-1.5">
                          <label className="flex items-center gap-2 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={wsChecked}
                              onChange={e => handleInviteWorkspaceChange(ws.id, e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-zinc-900 cursor-pointer"
                            />
                            <span className={`text-xs font-bold ${wsChecked ? 'text-emerald-400' : 'text-zinc-450'}`}>
                              {ws.nombre}
                            </span>
                          </label>

                          {ws.projects && ws.projects.length > 0 && (
                            <div className="pl-5 border-l border-zinc-800 ml-1.5 space-y-1">
                              {ws.projects.map((p: any) => {
                                const projChecked = wsChecked && !!inviteProjects[p.id];
                                return (
                                  <label key={p.id} className={`flex items-center gap-2 select-none ${wsChecked ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                                    <input
                                      type="checkbox"
                                      disabled={!wsChecked}
                                      checked={projChecked}
                                      onChange={e => setInviteProjects(prev => ({ ...prev, [p.id]: e.target.checked }))}
                                      className="w-3 h-3 rounded border-zinc-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 bg-zinc-900 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <span className={`text-[10px] ${projChecked ? 'text-indigo-400 font-bold' : 'text-zinc-500'}`}>
                                      {p.nombre}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-750 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-450 transition-colors">Enviar Invitación</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isPermModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="text-indigo-400" />
                <span>Ajustar Permisos: {selectedMember.usuario?.nombre_completo}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsPermModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Rol en la Organización</label>
                  <select value={editRol} onChange={e => setEditRol(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                    <option value="Administrador">Administrador</option>
                    <option value="Colaborador">Colaborador</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Etiqueta de Especialidad</label>
                  <input type="text" placeholder="Ej: Desarrollador | Frontend" value={editRoleTag} onChange={e => setEditRoleTag(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
                </div>
              </div>

              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Matriz de Acceso Modular</h4>

                {[
                  { key: 'crm', label: 'Clientes/CRM', icon: Users, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Editar / Crear' }] },
                  { key: 'secrets', label: 'Accesos Vault', icon: Key, options: [{ v: 'none', l: 'Prohibido' }, { v: 'read', l: 'Permitido Revelar' }] },
                  { key: 'finances', label: 'Finanzas', icon: DollarSign, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Registrar Movimientos' }] },
                  { key: 'tasks', label: 'Tareas Operativas', icon: Calendar, options: [{ v: 'none', l: 'Ninguno' }, { v: 'read', l: 'Solo Ver' }, { v: 'write', l: 'Organizar Actividades' }] },
                ].map(p => {
                  const Icon = p.icon;
                  return (
                    <div key={p.key} className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-xs text-zinc-300 flex items-center gap-2">
                        <Icon size={14} className="text-zinc-500" />
                        <span>{p.label}</span>
                      </span>
                      <select
                        value={(editModules as any)[p.key]}
                        onChange={e => setEditModules({ ...editModules, [p.key]: e.target.value })}
                        className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white"
                      >
                        {p.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Árbol Jerárquico de Espacios y Proyectos */}
              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Accesos a Espacios y Proyectos (Jerárquico)</h4>
                
                {workspacesWithProjects.length === 0 ? (
                  <p className="text-[10px] text-zinc-550 italic">No hay espacios de trabajo en la agencia.</p>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto p-1 bg-zinc-950/20 rounded-xl border border-zinc-800">
                    {workspacesWithProjects.map(ws => {
                      const wsChecked = !!editWorkspaces[ws.id];
                      return (
                        <div key={ws.id} className="p-2 border border-zinc-900 bg-zinc-950/25 rounded-lg space-y-1.5">
                          <label className="flex items-center gap-2 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={wsChecked}
                              onChange={e => handleEditWorkspaceChange(ws.id, e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-zinc-900 cursor-pointer"
                            />
                            <span className={`text-xs font-bold ${wsChecked ? 'text-emerald-400' : 'text-zinc-450'}`}>
                              {ws.nombre}
                            </span>
                          </label>

                          {ws.projects && ws.projects.length > 0 && (
                            <div className="pl-5 border-l border-zinc-800 ml-1.5 space-y-1">
                              {ws.projects.map((p: any) => {
                                const projChecked = wsChecked && !!editProjects[p.id];
                                return (
                                  <label key={p.id} className={`flex items-center gap-2 select-none ${wsChecked ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                                    <input
                                      type="checkbox"
                                      disabled={!wsChecked}
                                      checked={projChecked}
                                      onChange={e => setEditProjects(prev => ({ ...prev, [p.id]: e.target.checked }))}
                                      className="w-3 h-3 rounded border-zinc-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 bg-zinc-900 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <span className={`text-[10px] ${projChecked ? 'text-indigo-400 font-bold' : 'text-zinc-500'}`}>
                                      {p.nombre}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button type="button" onClick={() => setIsPermModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-750 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-450 transition-colors">Guardar Permisos</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

