import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { api } from '../lib/apiClient';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Zap, Layout } from 'lucide-react';
import { MateLoadingScreen } from '../components/layout/MateLoadingScreen';
import Swal from 'sweetalert2';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useAgencyStore } from '../store/useAgencyStore';
import type { Agency } from '../store/useAgencyStore';
import { EditProfileModal } from '../components/selector/EditProfileModal';
import { AgencySidebar } from '../components/selector/AgencySidebar';
import { AgencySection } from '../components/selector/AgencySection';
import { WorkspaceGrid } from '../components/selector/WorkspaceGrid';
import { UploadAdapterFactory } from '../services/UploadAdapters';

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
  const [profileData, setProfileData] = useState<any>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Avatar upload states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleOpenEditProfile = () => {
    setEditName(profileData?.nombreCompleto || currentUser?.user_metadata?.nombre_completo || currentUser?.user_metadata?.full_name || '');
    setEditUsername(profileData?.nombreUsuario || currentUser?.user_metadata?.username || '');
    setEditAvatarUrl(profileData?.fotoPerfilUrl || '');
    setIsProfileModalOpen(true);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: 20MB limit
    const maxLimit = 20 * 1024 * 1024;
    if (file.size > maxLimit) {
      Swal.fire({
        title: 'Archivo demasiado grande',
        text: `La imagen supera el límite de 20 MB.`,
        icon: 'warning',
        background: '#09090b',
        color: '#f4f4f5'
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAvatarCropConfirm = async (croppedBlob: Blob) => {
    setCropModalOpen(false);
    setIsUploadingAvatar(true);
    try {
      const adapter = UploadAdapterFactory.getAdapter();
      const url = await adapter.uploadImage(croppedBlob);
      setEditAvatarUrl(url);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Avatar recortado correctamente',
        showConfirmButton: false,
        timer: 2000,
        background: '#18181b',
        color: '#fff'
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error al subir',
        text: err.message || 'No se pudo subir la imagen.',
        icon: 'error',
        background: '#09090b',
        color: '#f4f4f5'
      });
    } finally {
      setIsUploadingAvatar(false);
    }
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
        nombreUsuario: cleanUsername,
        fotoPerfilUrl: editAvatarUrl
      });

      setCurrentUser(data.user);
      setProfileData((prev: any) => ({
        ...prev,
        nombreCompleto: editName,
        nombreUsuario: cleanUsername,
        fotoPerfilUrl: editAvatarUrl
      }));

      Swal.fire({
        title: '¡Perfil Actualizado!',
        text: 'Tu nombre y foto de perfil se han guardado correctamente.',
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
      
      try {
        const prof = await api.get('/Workspace/profile');
        setProfileData(prof);
      } catch (err) {
        console.error("Error al obtener perfil inicial", err);
      }
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
        input: 'bg-zinc-900 border-zinc-805 text-white rounded-xl'
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
        input: 'bg-zinc-900 border-zinc-805 text-white rounded-xl'
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

  // Filtrado clasificado de organizaciones
  const personalAgencies = agencies.filter(a => a.tipo === 'personal');
  const ownedAgencies = currentUser 
    ? agencies.filter(a => {
        const ownerId = a.propietario_id || a.propietarioId;
        return a.tipo !== 'personal' && ownerId?.toLowerCase() === currentUser.id?.toLowerCase();
      })
    : [];
  const invitedAgencies = currentUser
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
          <AgencySidebar
            profileData={profileData}
            currentUser={currentUser}
            userName={userName}
            copiedEmail={copiedEmail}
            onCopyEmail={handleCopyEmail}
            onOpenEditProfile={handleOpenEditProfile}
            invitations={invitations}
            onAcceptInvite={handleAcceptInvite}
            onRejectInvite={handleRejectInvite}
            onLogout={handleLogout}
          />

          {/* ÁREA PRINCIPAL DE CONTENIDO */}
          <div className="flex-1 min-w-0">
            {(isAgencyLoading || isWorkspacesLoading) ? (
              <div className="flex justify-center p-12 w-full h-full items-center">
                <MateLoadingScreen isEmbedded={true} message="Sincronizando con la nube de MateCode..." />
              </div>
            ) : (
              <div className="w-full space-y-8">
                {viewMode === 'agency' ? (
                  <AgencySection
                    personalAgencies={personalAgencies}
                    ownedAgencies={ownedAgencies}
                    invitedAgencies={invitedAgencies}
                    onSelectAgency={handleSelectAgency}
                    onEnterDashboard={handleEnterDashboard}
                    onCreateAgency={handleCreateAgency}
                  />
                ) : (
                  <WorkspaceGrid
                    workspaces={workspaces}
                    onBack={() => setViewMode('agency')}
                    onSelectWorkspace={handleSelectWorkspace}
                    onCreateWorkspace={handleCreateWorkspace}
                  />
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
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        editName={editName}
        setEditName={setEditName}
        editUsername={editUsername}
        setEditUsername={setEditUsername}
        editAvatarUrl={editAvatarUrl}
        isUpdatingProfile={isUpdatingProfile}
        onSave={handleSaveProfile}
        handleAvatarSelect={handleAvatarSelect}
        cropModalOpen={cropModalOpen}
        setCropModalOpen={setCropModalOpen}
        selectedImageSrc={selectedImageSrc}
        isUploadingAvatar={isUploadingAvatar}
        handleAvatarCropConfirm={handleAvatarCropConfirm}
      />
    </div>
  );
};
