import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, Briefcase, Users, Target, FileText, Calendar, Key, Video,
  DollarSign, ShieldAlert, ArrowLeft, Shield, Layout, Search, Plus
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

export const AgencyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeAgency,
    currentAgencyId,
    fetchMembers,
    inviteMember,
    updateMemberPermissions,
    getAgencyWorkspaces
  } = useAgencyStore();

  const [activeTab, setActiveTab] = useState<string>('structure');
  const [dashboardMode, setDashboardMode] = useState<'standard' | 'immersive'>('immersive');
  const [agencyWorkspaces, setAgencyWorkspaces] = useState<any[]>([]);
  const [agencyMembers, setAgencyMembers] = useState<Member[]>([]);

  // Modals / forms states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Form Fields State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRol, setInviteRol] = useState('Colaborador');
  const [invitePerms, setInvitePerms] = useState({ crm: 'write', secrets: 'none', finances: 'none', tasks: 'read' });
  const [inviteSearchTerm, setInviteSearchTerm] = useState('');
  const [inviteSearchResults, setInviteSearchResults] = useState<any[]>([]);
  const [isInviteSearching, setIsInviteSearching] = useState(false);
  const [permForm, setPermForm] = useState({ rol: 'Colaborador', crm: 'write', secrets: 'none', finances: 'none', tasks: 'read' });

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
    } catch (e) {
      console.error("Error al cargar la estructura del dashboard", e);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgencyId) return;
    try {
      const ok = await inviteMember(currentAgencyId, inviteEmail, inviteRol, invitePerms);
      if (ok) {
        Swal.fire({ title: 'Éxito', text: 'Invitación enviada con éxito.', icon: 'success', background: '#09090b', color: '#f4f4f5' });
        setIsInviteModalOpen(false);
        setInviteEmail('');
        setInviteSearchTerm('');
        setInviteSearchResults([]);
        setInviteRol('Colaborador');
        setInvitePerms({ crm: 'write', secrets: 'none', finances: 'none', tasks: 'read' });
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
    let p = { crm: 'write', secrets: 'none', finances: 'none', tasks: 'read' };
    if (member.permisos_json) {
      const parsed = typeof member.permisos_json === 'string' ? JSON.parse(member.permisos_json) : member.permisos_json;
      p = { ...p, ...parsed };
    }
    setPermForm({
      rol: member.rol,
      crm: p.crm || 'none',
      secrets: p.secrets || 'none',
      finances: p.finances || 'none',
      tasks: p.tasks || 'none'
    });
    setIsPermModalOpen(true);
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgencyId || !selectedMember) return;
    const permissionsObj = {
      crm: permForm.crm,
      secrets: permForm.secrets,
      finances: permForm.finances,
      tasks: permForm.tasks
    };
    try {
      const ok = await updateMemberPermissions(currentAgencyId, selectedMember.usuario_id, permForm.rol, permissionsObj);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans overflow-hidden">
      {/* SIDEBAR */}
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
            {[
              { id: 'structure', label: 'Estructura & Equipo', icon: Briefcase },
              { id: 'crm', label: 'Clientes & Leads', icon: Users },
              { id: 'goals', label: 'Objetivos Cruzados', icon: Target },
              { id: 'resources', label: 'Recursos Vault', icon: FileText },
              { id: 'tasks', label: 'Tareas Operativas', icon: Calendar },
              { id: 'secrets', label: 'Accesos Cifrados', icon: Key },
              { id: 'content', label: 'Planificador Contenido', icon: Video },
              { id: 'finance', label: 'Finanzas Dashboard', icon: DollarSign },
              { id: 'audit', label: 'Logs de Auditoría', icon: ShieldAlert },
            ].map(tab => {
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
            onClick={() => setDashboardMode(prev => prev === 'standard' ? 'immersive' : 'standard')}
            className="w-full py-2.5 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            {dashboardMode === 'standard' ? <Building size={14} /> : <Layout size={14} />}
            <span>{dashboardMode === 'standard' ? 'Vista Inmersiva' : 'Vista Estándar'}</span>
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 bg-zinc-950 p-10 overflow-y-auto relative z-10 flex flex-col">
        <div className="absolute top-[-10%] right-[-10%] w-[35%] h-[35%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[10%] w-[35%] h-[35%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex-1 flex flex-col">
          {dashboardMode === 'immersive' ? (
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="text-center mb-6 z-10">
                <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Oficina <span className="text-emerald-500">Corporativa</span></h1>
                <p className="text-zinc-500 text-xs mt-1">Haz clic en cualquier departamento para ingresar a la consola operativa.</p>
              </div>

              {/* Contenedor del Mapa Inmersivo */}
              <div className="relative w-full max-w-4xl aspect-[16/10] border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-950/60 backdrop-blur-sm z-10">
                <img
                  src="/agency_office_mockup.png"
                  alt="Oficina Corporativa"
                  className="w-full h-full object-cover opacity-60"
                />

                {/* Hotspots */}
                {[
                  { id: 'structure', label: 'Estructura & Equipo', desc: 'Estructura & Equipo', icon: Briefcase, top: '15%', left: '15%', w: '22%', h: '22%' },
                  { id: 'crm', label: 'Clientes & Leads', desc: 'Clientes & CRM', icon: Users, top: '15%', left: '42%', w: '22%', h: '22%' },
                  { id: 'goals', label: 'Objetivos Organizacionales', desc: 'Muro OKR', icon: Target, top: '15%', left: '68%', w: '20%', h: '22%' },
                  
                  { id: 'resources', label: 'Recursos Vault', desc: 'Biblioteca Prompts', icon: FileText, top: '44%', left: '15%', w: '22%', h: '22%' },
                  { id: 'tasks', label: 'Tareas Operativas', desc: 'Tablero Kanban', icon: Calendar, top: '44%', left: '42%', w: '22%', h: '22%' },
                  { id: 'secrets', label: 'Accesos Cifrados', desc: 'Accesos Cifrados', icon: Key, top: '44%', left: '68%', w: '20%', h: '22%' },
                  
                  { id: 'content', label: 'Planificador Contenido', desc: 'Plan de Contenido', icon: Video, top: '72%', left: '15%', w: '22%', h: '20%' },
                  { id: 'finance', label: 'Finanzas Dashboard', desc: 'Finanzas Corporativas', icon: DollarSign, top: '72%', left: '42%', w: '22%', h: '20%' },
                  { id: 'audit', label: 'Logs de Auditoría', desc: 'Logs de Seguridad', icon: ShieldAlert, top: '72%', left: '68%', w: '20%', h: '20%' },
                ].map(spot => {
                  const Icon = spot.icon;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => {
                        setActiveTab(spot.id);
                        setDashboardMode('standard');
                      }}
                      style={{
                        position: 'absolute',
                        top: spot.top,
                        left: spot.left,
                        width: spot.w,
                        height: spot.h
                      }}
                      className="group border border-white/5 hover:border-emerald-500/50 bg-zinc-950/20 hover:bg-emerald-500/10 rounded-2xl transition-all duration-305 flex flex-col items-center justify-center p-3 text-center backdrop-blur-[1px] hover:backdrop-blur-[4px] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] cursor-pointer"
                    >
                      <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 group-hover:border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black rounded-xl transition-all mb-1 text-zinc-400">
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors">{spot.desc}</span>
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
                onClick={() => setDashboardMode('immersive')}
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
                  {activeTab === 'structure' && (
                    <StructurePanel
                      activeAgency={activeAgency}
                      agencyWorkspaces={agencyWorkspaces}
                      agencyMembers={agencyMembers}
                      onOpenInviteModal={() => setIsInviteModalOpen(true)}
                      onOpenPermModal={handleOpenPermModal}
                    />
                  )}
                  {activeTab === 'crm' && <CrmPanel />}
                  {activeTab === 'goals' && <GoalsPanel agencyMembers={agencyMembers} />}
                  {activeTab === 'resources' && <ResourcesPanel />}
                  {activeTab === 'tasks' && <TasksPanel agencyMembers={agencyMembers} />}
                  {activeTab === 'secrets' && <SecretsPanel />}
                  {activeTab === 'content' && <ContentPanel agencyMembers={agencyMembers} />}
                  {activeTab === 'finance' && <FinancePanel agencyWorkspaces={agencyWorkspaces} />}
                  {activeTab === 'audit' && <AuditPanel />}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4 my-8"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="text-emerald-400" />
              <span>Invitar Miembro a la Agencia</span>
            </h3>
            
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

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Rol en la Organización</label>
                <select value={inviteRol} onChange={e => setInviteRol(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                  <option value="Administrador">Administrador</option>
                  <option value="Colaborador">Colaborador</option>
                </select>
              </div>

              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Matriz de Acceso Inicial</h4>

                <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-xl border border-zinc-900">
                  <span className="text-xs text-zinc-300">Clientes/CRM</span>
                  <select value={invitePerms.crm} onChange={e => setInvitePerms({ ...invitePerms, crm: e.target.value })} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-[10px] text-white">
                    <option value="none">Ninguno</option>
                    <option value="read">Solo Ver</option>
                    <option value="write">Editar / Crear</option>
                  </select>
                </div>

                <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-xl border border-zinc-900">
                  <span className="text-xs text-zinc-300">Accesos Vault</span>
                  <select value={invitePerms.secrets} onChange={e => setInvitePerms({ ...invitePerms, secrets: e.target.value })} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-[10px] text-white">
                    <option value="none">Prohibido</option>
                    <option value="read">Permitido Revelar</option>
                  </select>
                </div>

                <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-xl border border-zinc-900">
                  <span className="text-xs text-zinc-300">Finanzas</span>
                  <select value={invitePerms.finances} onChange={e => setInvitePerms({ ...invitePerms, finances: e.target.value })} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-[10px] text-white">
                    <option value="none">Ninguno</option>
                    <option value="read">Solo Ver</option>
                    <option value="write">Registrar</option>
                  </select>
                </div>

                <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-xl border border-zinc-900">
                  <span className="text-xs text-zinc-300">Tareas Operativas</span>
                  <select value={invitePerms.tasks} onChange={e => setInvitePerms({ ...invitePerms, tasks: e.target.value })} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-[10px] text-white">
                    <option value="none">Ninguno</option>
                    <option value="read">Solo Ver</option>
                    <option value="write">Organizar</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">Enviar Invitación</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isPermModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="text-indigo-400" />
              <span>Ajustar Permisos: {selectedMember.usuario?.nombre_completo}</span>
            </h3>
            <form onSubmit={handleSavePermissions} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Rol en la Organización</label>
                <select value={permForm.rol} onChange={e => setPermForm({ ...permForm, rol: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                  <option value="Administrador">Administrador</option>
                  <option value="Colaborador">Colaborador</option>
                </select>
              </div>

              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">Matriz de Acceso Modular</h4>

                <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-xs text-zinc-300">Acceso a Clientes/CRM</span>
                  <select value={permForm.crm} onChange={e => setPermForm({ ...permForm, crm: e.target.value })} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white">
                    <option value="none">Ninguno</option>
                    <option value="read">Solo Ver</option>
                    <option value="write">Editar / Crear</option>
                  </select>
                </div>

                <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-xs text-zinc-300">Desencripción de Accesos Vault</span>
                  <select value={permForm.secrets} onChange={e => setPermForm({ ...permForm, secrets: e.target.value })} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white">
                    <option value="none">Prohibido</option>
                    <option value="read">Permitido Revelar</option>
                  </select>
                </div>

                <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-xs text-zinc-300">Acceso a Finanzas</span>
                  <select value={permForm.finances} onChange={e => setPermForm({ ...permForm, finances: e.target.value })} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white">
                    <option value="none">Ninguno</option>
                    <option value="read">Solo Ver Dashboard</option>
                    <option value="write">Registrar Movimientos</option>
                  </select>
                </div>

                <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-xs text-zinc-300">Acceso a Tareas Operativas</span>
                  <select value={permForm.tasks} onChange={e => setPermForm({ ...permForm, tasks: e.target.value })} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-xs text-white">
                    <option value="none">Ninguno</option>
                    <option value="read">Solo Ver</option>
                    <option value="write">Organizar Actividades</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPermModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">Guardar Permisos</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

