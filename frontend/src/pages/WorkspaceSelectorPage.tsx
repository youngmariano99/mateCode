import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { api } from '../lib/apiClient';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Plus, Layout, Zap, Globe, Shield, ArrowLeft, Building, ChevronRight, LogOut, Copy, Check, Bell, Edit2
} from 'lucide-react';
import { MateLoadingScreen } from '../components/layout/MateLoadingScreen';
import Swal from 'sweetalert2';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useAgencyStore } from '../store/useAgencyStore';
import type { Agency } from '../store/useAgencyStore';

interface Workspace {
  id: string;
  nombre: string;
  created_at?: string;
}

export const WorkspaceSelectorPage = () => {
  const { setTenant } = useProject();
  const { setWorkspaceId } = useWorkspaceStore();
  const { 
    agencies, 
    currentAgencyId, 
    invitations, 
    isLoading: isAgencyLoading, 
    fetchAgencies, 
    createAgency, 
    fetchInvitations, 
    acceptInvitation, 
    rejectInvitation,
    setAgencyId,
    getAgencyWorkspaces,
    createWorkspaceInAgency
  } = useAgencyStore();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isWorkspacesLoading, setIsWorkspacesLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'agency' | 'workspace'>('agency');
  const [isCebando, setIsCebando] = useState(false);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleOpenEditProfile = () => {
    setEditName(currentUser?.user_metadata?.nombre_completo || currentUser?.user_metadata?.full_name || '');
    setEditUsername(currentUser?.user_metadata?.username || '');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      Swal.fire({ title: 'Error', text: 'El nombre de usuario no puede estar vacío.', icon: 'error', background: '#09090b', color: '#f4f4f5' });
      return;
    }
    const cleanUsername = editUsername.trim().toLowerCase().replace(/[^a-zA-Z0-9_.-]/g, '');
    if (!cleanUsername) {
      Swal.fire({ title: 'Error', text: 'Nombre de usuario inválido.', icon: 'error', background: '#09090b', color: '#f4f4f5' });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: editName,
          username: cleanUsername
        }
      });

      if (error) throw error;

      await api.put('/Workspace/profile', {
        nombreCompleto: editName,
        nombreUsuario: cleanUsername
      });

      setCurrentUser(data.user);

      Swal.fire({
        title: '¡Perfil Actualizado!',
        text: 'Tu nombre y nombre de usuario se han guardado correctamente.',
        icon: 'success',
        background: '#09090b',
        color: '#f4f4f5',
        confirmButtonColor: '#10b981'
      });
      setIsProfileModalOpen(false);
      await fetchAgencies();
    } catch (err: any) {
      Swal.fire({
        title: 'Error al actualizar',
        text: err.message || 'No se pudo guardar la información.',
        icon: 'error',
        background: '#09090b',
        color: '#f4f4f5'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    const init = async () => {
      await fetchAgencies();
      await fetchInvitations();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    init();
  }, []);

  // Si viene del dashboard con ?view=workspaces y hay una agencia activa, saltar directo a sus workspaces
  useEffect(() => {
    const goToWorkspaces = searchParams.get('view') === 'workspaces';
    const savedId = localStorage.getItem('mc_current_agency_id');
    if (goToWorkspaces && savedId && agencies.length > 0) {
      const agency = agencies.find(a => a.id === savedId);
      if (agency) handleSelectAgency(agency, true);
    }
  }, [agencies, searchParams]);

  const handleSelectAgency = async (agency: Agency, autoEnterWorkspaces = true) => {
    setAgencyId(agency.id);
    setIsWorkspacesLoading(true);
    try {
      const wss = await getAgencyWorkspaces(agency.id);
      setWorkspaces(wss);
      if (autoEnterWorkspaces) {
        setViewMode('workspace');
      }
    } catch (err) {
      console.error("Error al cargar espacios de trabajo", err);
    } finally {
      setIsWorkspacesLoading(false);
    }
  };

  const handleSelectWorkspace = (id: string) => {
    setSelectedWsId(id);
    setIsCebando(true);
  };

  const onLoadingFinished = () => {
    if (selectedWsId) {
      setTenant(selectedWsId);
      setWorkspaceId(selectedWsId);
      navigate('/workspace/mi-oficina');
    }
  };

  const handleCreateAgency = async () => {
    const { value: name } = await Swal.fire({
      title: 'Cimentar Nueva Agencia / Empresa',
      input: 'text',
      inputLabel: '¿Cómo se llamará la organización?',
      inputPlaceholder: 'Ej: MateCode Studio',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Crear Organización',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl border border-zinc-800 shadow-2xl',
        input: 'bg-zinc-900 border-zinc-800 text-white rounded-xl'
      }
    });

    if (name) {
      try {
        const newAgency = await createAgency(name);
        Swal.fire({
          title: '¡Organización Creada!',
          text: `Se ha establecido la agencia ${name}.`,
          icon: 'success',
          background: '#09090b',
          color: '#f4f4f5'
        });
        handleSelectAgency(newAgency, true);
      } catch (err) {
        console.error("Error al crear la agencia", err);
      }
    }
  };

  const handleCreateWorkspace = async () => {
    if (!currentAgencyId) return;
    
    const { value: name } = await Swal.fire({
      title: 'Nuevo Mundo MateCode',
      input: 'text',
      inputLabel: '¿Cómo se llama tu nuevo espacio de trabajo?',
      inputPlaceholder: 'Ej: Galaxia Dev v2',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Cimentar Espacio',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl border border-zinc-800 shadow-2xl',
        input: 'bg-zinc-900 border-zinc-800 text-white rounded-xl'
      }
    });

    if (name) {
      try {
        const newWs = await createWorkspaceInAgency(currentAgencyId, name);
        setWorkspaces(prev => [...prev, newWs]);
        Swal.fire({
          title: '¡Mundo Creado!',
          text: `Tu espacio ${name} está listo para ser cebado.`,
          icon: 'success',
          background: '#09090b',
          color: '#f4f4f5'
        });
      } catch (err) {
        console.error("Error al crear el espacio", err);
      }
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    const ok = await acceptInvitation(inviteId);
    if (ok) {
      Swal.fire({
        title: '¡Invitación Aceptada!',
        text: 'Ahora eres parte de la organización.',
        icon: 'success',
        background: '#09090b',
        color: '#f4f4f5'
      });
      await fetchAgencies();
      await fetchInvitations();
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    const ok = await rejectInvitation(inviteId);
    if (ok) {
      Swal.fire({
        title: 'Invitación Rechazada',
        icon: 'info',
        background: '#09090b',
        color: '#f4f4f5'
      });
      await fetchInvitations();
    }
  };

  const handleEnterDashboard = async (agency: Agency) => {
    setAgencyId(agency.id);
    navigate('/agency/dashboard');
  };

  const handleLogout = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir de tu cuenta?',
      icon: 'question',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    });
    if (isConfirmed) {
      await supabase.auth.signOut();
      localStorage.removeItem('mc_current_tenant');
      localStorage.removeItem('mc_current_agency_id');
      navigate('/login');
    }
  };

  const handleCopyEmail = () => {
    if (currentUser?.email) {
      navigator.clipboard.writeText(currentUser.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  if (isCebando) {
    return <MateLoadingScreen onFinished={onLoadingFinished} />;
  }

  const activeAgencyObj = agencies.find(a => a.id === currentAgencyId);
  const isUserLoaded = currentUser !== null;

  // Filtrado clasificado de organizaciones
  const personalAgencies = agencies.filter(a => a.tipo === 'personal');
  const ownedAgencies = isUserLoaded 
    ? agencies.filter(a => {
        const ownerId = a.propietario_id || a.propietarioId;
        return a.tipo !== 'personal' && ownerId?.toLowerCase() === currentUser.id?.toLowerCase();
      })
    : [];
  const invitedAgencies = isUserLoaded
    ? agencies.filter(a => {
        const ownerId = a.propietario_id || a.propietarioId;
        return a.tipo !== 'personal' && ownerId?.toLowerCase() !== currentUser.id?.toLowerCase();
      })
    : [];

  const userName = currentUser?.user_metadata?.nombre_completo || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Desarrollador';

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-6 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-500/5 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/5 blur-[130px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center"
      >
        {/* Header decorativo superior */}
        <div className="flex justify-between items-center pb-6 border-b border-zinc-900/60 mb-10">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">MateCode Portal</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-650 bg-zinc-900/40 border border-zinc-850 px-3 py-1 rounded-full">v2.5 Immersive</span>
        </div>

        {/* Layout de Mando de Control y Rejilla */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">
          
          {/* MANDO DE CONTROL PERSONAL (SIDEBAR) */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-[2rem] flex flex-col justify-between w-full lg:w-80 shrink-0 backdrop-blur-xl shadow-xl min-h-[480px]">
            <div className="space-y-6">
              {/* Perfil del Usuario */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/65 gap-2">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center shadow-inner shrink-0">
                    {userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-white truncate">{userName}</h3>
                    {currentUser?.user_metadata?.username && (
                      <span className="text-[11px] text-emerald-400 font-mono block truncate">@{currentUser.user_metadata.username}</span>
                    )}
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block mt-0.5">Control Personal</span>
                  </div>
                </div>
                <button
                  onClick={handleOpenEditProfile}
                  className="p-1.5 bg-zinc-950/40 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400 rounded-xl transition-colors shrink-0"
                  title="Editar Perfil"
                >
                  <Edit2 size={13} />
                </button>
              </div>

              {/* Identidad copiable para recibir invitaciones */}
              <div className="bg-zinc-950/65 border border-zinc-850 p-4 rounded-2xl space-y-3">
                <div>
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    Identificador (Búsqueda BD)
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-zinc-900/40 p-2 rounded-xl border border-zinc-800 mt-1">
                    <span className="text-[10px] font-mono text-emerald-400 truncate max-w-[170px]" title={currentUser?.email}>
                      {currentUser?.email || 'Cargando...'}
                    </span>
                    <button
                      onClick={handleCopyEmail}
                      className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 rounded-lg transition-colors shrink-0"
                      title="Copiar identificador de búsqueda"
                    >
                      {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    Nombre en Cuenta
                  </div>
                  <div className="text-xs font-semibold text-zinc-300 mt-0.5">
                    {userName}
                  </div>
                </div>

                <span className="text-[8px] text-zinc-600 block leading-tight pt-1.5 border-t border-zinc-900">
                  Proporciona tu identificador (email) a tus socios para que te inviten a sus organizaciones o contratos.
                </span>
              </div>

              {/* Bandeja de Notificaciones de Invitación */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                  <Bell size={12} className="text-indigo-400" />
                  <span>Invitaciones Pendientes</span>
                  {invitations.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black text-[8px] font-black">{invitations.length}</span>
                  )}
                </h4>
                {invitations.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 italic">No tienes notificaciones o invitaciones.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 neon-scrollbar">
                    {invitations.map((invite: any) => (
                      <div key={invite.agencyId} className="bg-zinc-950/70 border border-emerald-500/20 p-3 rounded-2xl space-y-2">
                        <div>
                          <p className="text-[11px] font-bold text-white leading-tight">{invite.agencyNombre}</p>
                          <p className="text-[8px] text-zinc-550 uppercase tracking-widest mt-0.5">Rol: {invite.rolInvitado}</p>
                          {invite.invitadoPor && (
                            <div className="mt-1.5 pt-1 border-t border-zinc-900 text-[9px] text-zinc-400">
                              <span>Invitado por: </span>
                              <span className="font-semibold text-emerald-400">{invite.invitadoPor}</span>
                              {invite.invitadoPorEmail && (
                                <span className="block text-[8px] text-zinc-550 font-mono truncate" title={invite.invitadoPorEmail}>
                                  ({invite.invitadoPorEmail})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => handleAcceptInvite(invite.agencyId)}
                            className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-bold rounded-lg transition-colors"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleRejectInvite(invite.agencyId)}
                            className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-bold rounded-lg transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Logout button at bottom of sidebar */}
            <button
              onClick={handleLogout}
              className="w-full mt-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* ÁREA PRINCIPAL DE CONTENIDO */}
          <div className="flex-1 min-w-0">
            {(isAgencyLoading || isWorkspacesLoading) ? (
              <div className="flex justify-center p-12 w-full h-full items-center">
                <MateLoadingScreen isEmbedded={true} message="Sincronizando con la nube de MateCode..." />
              </div>
            ) : (
              <div className="w-full space-y-8">
                {viewMode === 'agency' ? (
                  // --- VISTA DE AGENCIAS/EMPRESAS CLASIFICADAS ---
                  <div className="space-y-8">
                    
                    {/* Sección 1: Espacio Personal */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest pb-1.5 border-b border-zinc-900">
                        1. Tu Espacio Personal (Sandbox)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personalAgencies.map((agency, index) => (
                          <motion.div
                            key={agency.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -3 }}
                            className="group relative flex flex-col"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
                            <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-850 group-hover:border-zinc-800 p-5 rounded-3xl transition-all h-full flex flex-col justify-between min-h-[170px]">
                              <div>
                                <div className="flex justify-between items-start mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                    <Building size={18} />
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-zinc-800/80 text-zinc-400 border-zinc-700">
                                    Personal
                                  </span>
                                </div>
                                <h3 className="text-base font-bold mb-1 group-hover:text-emerald-400 transition-colors">
                                  {agency.nombre}
                                </h3>
                                <p className="text-[10px] text-zinc-500">Espacio de trabajo local para pruebas e ideas rápidas.</p>
                              </div>

                              <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                                <button
                                  onClick={() => handleSelectAgency(agency, true)}
                                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                                >
                                  <span>Cargar Espacios de Trabajo</span>
                                  <ChevronRight size={13} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Sección 2: Tus Organizaciones Creadas */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest pb-1.5 border-b border-zinc-900">
                        2. Tus Empresas / Agencias (Propias)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ownedAgencies.map((agency, index) => (
                          <motion.div
                            key={agency.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -3 }}
                            className="group relative flex flex-col"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
                            <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-850 group-hover:border-zinc-800 p-5 rounded-3xl transition-all h-full flex flex-col justify-between min-h-[180px]">
                              <div>
                                <div className="flex justify-between items-start mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition-colors">
                                    <Building size={18} />
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                    Empresa
                                  </span>
                                </div>
                                <h3 className="text-base font-bold mb-1 group-hover:text-emerald-400 transition-colors">
                                  {agency.nombre}
                                </h3>
                              </div>

                              <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-zinc-800/80">
                                <button
                                  onClick={() => handleSelectAgency(agency, true)}
                                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                                >
                                  <span>Ver Espacios de Trabajo</span>
                                  <ChevronRight size={13} />
                                </button>
                                <button
                                  onClick={() => handleEnterDashboard(agency)}
                                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                                >
                                  <Layout size={13} className="text-indigo-400" />
                                  <span>Dashboard Corporativo</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {/* Card Crear Agencia */}
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          onClick={handleCreateAgency}
                          className="cursor-pointer border border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-5 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all bg-zinc-900/10 h-[180px]"
                        >
                          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-805 flex items-center justify-center mb-3">
                            <Plus size={20} />
                          </div>
                          <span className="font-bold uppercase tracking-widest text-[9px]">Cimentar Nueva Organización</span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Sección 3: Organizaciones Invitadas */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest pb-1.5 border-b border-zinc-900">
                        3. Organizaciones de Terceros (Invitado)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {invitedAgencies.map((agency, index) => (
                          <motion.div
                            key={agency.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -3 }}
                            className="group relative flex flex-col"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
                            <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-850 group-hover:border-zinc-800 p-5 rounded-3xl transition-all h-full flex flex-col justify-between min-h-[180px]">
                              <div>
                                <div className="flex justify-between items-start mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition-colors">
                                    <Building size={18} />
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                    Invitado
                                  </span>
                                </div>
                                <h3 className="text-base font-bold mb-1 group-hover:text-emerald-400 transition-colors">
                                  {agency.nombre}
                                </h3>
                              </div>

                              <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-zinc-800/80">
                                <button
                                  onClick={() => handleSelectAgency(agency, true)}
                                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                                >
                                  <span>Ver Espacios de Trabajo</span>
                                  <ChevronRight size={13} />
                                </button>
                                <button
                                  onClick={() => handleEnterDashboard(agency)}
                                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                                >
                                  <Layout size={13} className="text-indigo-400" />
                                  <span>Dashboard Corporativo</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {invitedAgencies.length === 0 && (
                          <div className="col-span-2 p-8 border border-dashed border-zinc-850 text-center rounded-3xl text-zinc-600 text-xs flex flex-col items-center justify-center gap-1 min-h-[140px] bg-zinc-950/20">
                            <span>No formas parte de organizaciones externas.</span>
                            <span className="text-[10px] text-zinc-600">Proporciona tu email a tus socios para que te inviten.</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  // --- VISTA DE ESPACIOS DE TRABAJO (WORSPACES) ---
                  <div>
                    {/* Back Button */}
                    <div className="flex justify-start mb-6">
                      <button 
                        onClick={() => setViewMode('agency')}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-emerald-400 transition-colors flex items-center gap-2 text-xs font-bold text-zinc-400"
                      >
                        <ArrowLeft size={14} />
                        <span>Volver a Organizaciones</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <AnimatePresence>
                        {workspaces.map((ws, index) => (
                          <motion.div
                            key={ws.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                            onClick={() => handleSelectWorkspace(ws.id)}
                            className="group relative cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
                            <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-800 group-hover:border-emerald-500/50 p-6 rounded-3xl transition-all h-full flex flex-col justify-between min-h-[180px]">
                              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                <Briefcase size={20} />
                              </div>
                              
                              <div>
                                <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{ws.nombre}</h3>
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-800/80">
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-550 uppercase tracking-widest">
                                    <Globe size={11} /> Público
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-550 uppercase tracking-widest">
                                    <Shield size={11} /> Cifrado
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {/* Card Crear Workspace */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          onClick={handleCreateWorkspace}
                          className="cursor-pointer border border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all bg-zinc-900/10 h-[180px]"
                        >
                          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-805 flex items-center justify-center mb-3">
                            <Plus size={24} />
                          </div>
                          <span className="font-bold uppercase tracking-widest text-[10px]">Cimentar Nuevo Mundo</span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-900/60 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Layout size={16} className="text-zinc-700" />
                 <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">V2.5 Immersive Enterprise</span>
              </div>
           </div>
           <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-[0.4em]">MateCode Architecture</p>
        </div>
      </motion.div>

      {/* Modal de Editar Perfil */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl z-10"
            >
              <div>
                <h3 className="text-lg font-bold text-white">Editar Perfil</h3>
                <p className="text-zinc-550 text-[10px] uppercase tracking-wider">Actualiza tu información personal</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-550 uppercase tracking-widest mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/65 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Ej: Mariano Young"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-550 uppercase tracking-widest mb-1.5">
                    Nombre de Usuario (@username)
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/65 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                    placeholder="Ej: marianodev"
                  />
                  <span className="text-[9px] text-zinc-650 mt-1 block">
                    Solo letras, números, puntos, guiones y barras bajas.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900/60">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                  >
                    {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
