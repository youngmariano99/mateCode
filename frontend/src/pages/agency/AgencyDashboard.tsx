import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, Briefcase, Users, Target, FileText, Calendar, CalendarDays, Key, Video,
  DollarSign, ShieldAlert, ArrowLeft, Layout
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
import { InviteMemberModal } from '../../components/agency/dashboard/InviteMemberModal';
import { AdjustPermissionsModal } from '../../components/agency/dashboard/AdjustPermissionsModal';

const AGENCY_TABS = [
  { id: 'structure', label: 'Estructura & Equipo', desc: 'Estructura & Equipo', icon: Briefcase, top: '2%', left: '2%', w: '31%', h: '30.5%' },
  { id: 'crm', label: 'Clientes & Leads', desc: 'Clientes & CRM', icon: Users, top: '2%', left: '34.5%', w: '31%', h: '30.5%' },
  { id: 'goals', label: 'Objetivos Cruzados', desc: 'Objetivos', icon: Target, top: '2%', left: '67%', w: '31%', h: '30.5%' },
  { id: 'resources', label: 'Recursos Vault', desc: 'Biblioteca Prompts', icon: FileText, top: '34.5%', left: '2%', w: '31%', h: '30.5%' },
  { id: 'tasks', label: 'Tareas Operativas', desc: 'Tablero Kanban', icon: Calendar, top: '34.5%', left: '34.5%', w: '31%', h: '30.5%' },
  { id: 'secrets', label: 'Accesos Cifrados', desc: 'Accesos Cifrados', icon: Key, top: '34.5%', left: '67%', w: '31%', h: '30.5%' },
  { id: 'content', label: 'Planificador Contenido', desc: 'Plan de Contenido', icon: Video, top: '67%', left: '2%', w: '31%', h: '30.5%' },
  { id: 'finance', label: 'Finanzas Dashboard', desc: 'Finanzas Corporativas', icon: DollarSign, top: '67%', left: '34.5%', w: '31%', h: '30.5%' },
  { id: 'audit', label: 'Logs de Auditoría', desc: 'Logs de Seguridad', icon: ShieldAlert, top: '67%', left: '67%', w: '31%', h: '30.5%' },
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
        return <FinancePanel workspacesWithProjects={workspacesWithProjects} />;
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
              <div className="relative w-full max-w-6xl aspect-[3/2] border border-zinc-800/80 rounded-[2rem] overflow-hidden shadow-2xl bg-zinc-950/80 backdrop-blur-sm z-10 flex-1 my-4 flex items-center justify-center">
                <img
                  src="/agenciaInterfaz2.png"
                  alt="Oficina MateCode"
                  className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
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
                      className="group border border-transparent hover:border-emerald-500/20 bg-transparent hover:bg-emerald-500/5 rounded-[1.5rem] transition-all duration-300 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.08),_0_0_30px_rgba(16,185,129,0.05)]"
                    >
                      <div className="p-2.5 bg-zinc-950/90 border border-zinc-800/60 group-hover:border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-black rounded-xl transition-all shadow-md transform group-hover:scale-110 duration-300 text-zinc-400">
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-1.5">{spot.desc}</span>
                      <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5 tracking-widest block opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{spot.label}</span>
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
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspacesWithProjects={workspacesWithProjects}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        inviteRol={inviteRol}
        setInviteRol={setInviteRol}
        inviteRoleTag={inviteRoleTag}
        setInviteRoleTag={setInviteRoleTag}
        inviteModules={inviteModules}
        setInviteModules={setInviteModules}
        inviteWorkspaces={inviteWorkspaces}
        setInviteWorkspaces={setInviteWorkspaces}
        inviteProjects={inviteProjects}
        setInviteProjects={setInviteProjects}
        inviteSearchTerm={inviteSearchTerm}
        onSearchUsers={handleSearchUsers}
        inviteSearchResults={inviteSearchResults}
        isInviteSearching={isInviteSearching}
        onInviteSubmit={handleInviteSubmit}
        onInviteWorkspaceChange={handleInviteWorkspaceChange}
        onInviteSearchResultsClear={() => setInviteSearchResults([])}
      />

      <AdjustPermissionsModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        selectedMember={selectedMember}
        workspacesWithProjects={workspacesWithProjects}
        editRol={editRol}
        setEditRol={setEditRol}
        editRoleTag={editRoleTag}
        setEditRoleTag={setEditRoleTag}
        editModules={editModules}
        setEditModules={setEditModules}
        editWorkspaces={editWorkspaces}
        setEditWorkspaces={setEditWorkspaces}
        editProjects={editProjects}
        setEditProjects={setEditProjects}
        onSavePermissions={handleSavePermissions}
        onEditWorkspaceChange={handleEditWorkspaceChange}
      />
    </div>
  );
};

