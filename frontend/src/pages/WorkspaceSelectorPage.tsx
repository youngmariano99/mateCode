import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { api } from '../lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Layout, Zap, Globe, Shield, ArrowLeft, Users, Building, ChevronRight, Award, Trash2 } from 'lucide-react';
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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isWorkspacesLoading, setIsWorkspacesLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'agency' | 'workspace'>('agency');
  const [isCebando, setIsCebando] = useState(false);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);

  // Carga inicial
  useEffect(() => {
    const init = async () => {
      await fetchAgencies();
      await fetchInvitations();
    };
    init();
  }, []);

  // Al seleccionar una agencia, cargar sus espacios de trabajo
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
      navigate('/workspace/mi-oficina'); // O la ruta principal del mapa
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
        // Seleccionarla directamente
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
    }
  };

  const handleEnterDashboard = async (agency: Agency) => {
    setAgencyId(agency.id);
    navigate('/agency/dashboard');
  };

  if (isCebando) {
    return <MateLoadingScreen onFinished={onLoadingFinished} />;
  }

  const activeAgencyObj = agencies.find(a => a.id === currentAgencyId);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-5xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
            <Zap size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {viewMode === 'agency' ? 'Ecosistema de Organizaciones' : 'Espacios de Trabajo'}
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            {viewMode === 'agency' ? 'Tus Empresas y Agencias' : activeAgencyObj?.nombre}
          </h1>
          <p className="text-zinc-500 text-base max-w-2xl mx-auto">
            {viewMode === 'agency' 
              ? 'Administra tu negocio o tu espacio personal. Accede al panel administrativo o entra a tus áreas de desarrollo.'
              : 'Selecciona el espacio de trabajo donde vas a programar. Cada espacio cuenta con sus propios proyectos y equipo.'
            }
          </p>
        </div>

        {/* Invitaciones Pendientes */}
        {viewMode === 'agency' && invitations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl backdrop-blur-md"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
              <Users size={16} /> Invitaciones Pendientes ({invitations.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((invite: any) => (
                <div key={invite.agencyId} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-zinc-200">{invite.agencyNombre}</p>
                    <p className="text-xs text-zinc-500">Rol propuesto: {invite.rolInvitado}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptInvite(invite.agencyId)}
                      className="px-3 py-1.5 bg-emerald-500 text-black text-xs font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                    >
                      Aceptar
                    </button>
                    <button 
                      onClick={() => handleRejectInvite(invite.agencyId)}
                      className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl hover:bg-zinc-700 transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Carga principal */}
        {(isAgencyLoading || isWorkspacesLoading) ? (
          <div className="flex justify-center p-12 w-full">
            <MateLoadingScreen isEmbedded={true} message="Sincronizando con la nube de MateCode..." />
          </div>
        ) : (
          <div className="w-full">
            {viewMode === 'agency' ? (
              // --- VISTA DE AGENCIAS/EMPRESAS ---
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {agencies.map((agency, index) => (
                    <motion.div
                      key={agency.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group relative flex flex-col"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
                      <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-800 group-hover:border-zinc-700/80 p-6 rounded-3xl transition-all h-full flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                              <Building size={24} />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              agency.tipo === 'personal' 
                                ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {agency.tipo === 'personal' ? 'Personal' : 'Empresa'}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                            {agency.nombre}
                          </h3>
                        </div>

                        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-zinc-800/80">
                          <button
                            onClick={() => handleSelectAgency(agency, true)}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                          >
                            <span>Ver Espacios de Trabajo</span>
                            <ChevronRight size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleEnterDashboard(agency)}
                            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Layout size={14} className="text-indigo-400" />
                            <span>Dashboard Corporativo</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Card Crear Agencia */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={handleCreateAgency}
                    className="cursor-pointer border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all bg-zinc-900/10 h-[216px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                      <Plus size={24} />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-[10px]">Nueva Agencia / Empresa</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              // --- VISTA DE ESPACIOS DE TRABAJO ---
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {workspaces.map((ws, index) => (
                      <motion.div
                        key={ws.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelectWorkspace(ws.id)}
                        className="group relative cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
                        <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-800 group-hover:border-emerald-500/50 p-6 rounded-3xl transition-all h-full flex flex-col justify-between min-h-[180px]">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                            <Briefcase size={22} />
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{ws.nombre}</h3>
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-800/80">
                              <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                <Globe size={11} /> Público
                              </div>
                              <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
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
                      className="cursor-pointer border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all bg-zinc-900/10 h-[180px]"
                    >
                      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
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
    </div>
  );
};
