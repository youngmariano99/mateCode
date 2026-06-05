import { create } from 'zustand';
import { api } from '../lib/apiClient';

export interface Agency {
  id: string;
  nombre: string;
  propietario_id: string;
  tipo: 'personal' | 'agencia';
  fecha_creacion: string;
  redes_sociales?: any;
  branding?: any;
  mision?: string;
  vision?: string;
  datos_marketing?: any;
}

export interface Member {
  agencia_id: string;
  usuario_id: string;
  rol: string;
  estado_invitacion: string;
  usuario?: {
    id: string;
    email: string;
    nombre_completo: string;
    nombre_usuario?: string;
  };
  permisos_json?: any;
}

interface AgencyState {
  agencies: Agency[];
  currentAgencyId: string | null;
  activeAgency: Agency | null;
  permissions: any;
  invitations: any[];
  isLoading: boolean;
  error: string | null;

  setAgencyId: (id: string | null) => void;
  fetchAgencies: () => Promise<void>;
  createAgency: (nombre: string) => Promise<Agency>;
  fetchInvitations: () => Promise<void>;
  acceptInvitation: (id: string) => Promise<boolean>;
  rejectInvitation: (id: string) => Promise<boolean>;
  fetchMembers: (id: string) => Promise<Member[]>;
  inviteMember: (id: string, email: string, rol?: string, permisos?: any) => Promise<boolean>;
  updateMemberPermissions: (id: string, userId: string, rol: string, permisos: any) => Promise<boolean>;
  getAgencyWorkspaces: (id: string) => Promise<any[]>;
  getAgencyWorkspacesWithProjects: (id: string) => Promise<any[]>;
  createWorkspaceInAgency: (id: string, nombre: string) => Promise<any>;
  updateAgencyProfile: (id: string, nombre: string, redesSociales: any, branding: any, mision: string, vision: string, datosMarketing: any) => Promise<boolean>;
}

export const useAgencyStore = create<AgencyState>((set, get) => ({
  agencies: [],
  currentAgencyId: localStorage.getItem('mc_current_agency_id'),
  activeAgency: null,
  permissions: {},
  invitations: [],
  isLoading: false,
  error: null,

  setAgencyId: (id) => {
    if (id) {
      localStorage.setItem('mc_current_agency_id', id);
    } else {
      localStorage.removeItem('mc_current_agency_id');
    }
    const active = get(). agencies.find(a => a.id === id) || null;
    set({ currentAgencyId: id, activeAgency: active });
  },

  fetchAgencies: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get('/Agency');
      const curId = get().currentAgencyId;
      const active = data.find((a: Agency) => a.id === curId) || data[0] || null;
      
      let userPermissions = {};
      if (active) {
        try {
          const members = await api.get(`/Agency/${active.id}/members`) as any[];
          const profile = await api.get('/Workspace/profile').catch(() => ({})) as any;
          const currentUserId = profile.id; 
          const currentMember = members.find((m: any) => m.usuario_id === currentUserId);
          if (currentMember && currentMember.permisos_json) {
            userPermissions = typeof currentMember.permisos_json === 'string' 
              ? JSON.parse(currentMember.permisos_json) 
              : currentMember.permisos_json;
          }
        } catch (e) {
          console.warn("No se pudieron cargar permisos de miembro", e);
        }
      }

      set({ 
        agencies: data, 
        activeAgency: active, 
        currentAgencyId: active ? active.id : null,
        permissions: userPermissions,
        isLoading: false 
      });
      if (active) {
        localStorage.setItem('mc_current_agency_id', active.id);
      }
    } catch (err: any) {
      set({ error: err.message || 'Error al obtener agencias', isLoading: false });
    }
  },

  createAgency: async (nombre) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post('/Agency', { Nombre: nombre });
      set(state => ({ agencies: [...state.agencies, data], isLoading: false }));
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Error al crear agencia', isLoading: false });
      throw err;
    }
  },

  fetchInvitations: async () => {
    try {
      const data = await api.get('/Agency/invitations');
      set({ invitations: data });
    } catch (err) {
      console.error(err);
    }
  },

  acceptInvitation: async (id) => {
    try {
      await api.post(`/Agency/${id}/accept`);
      await get().fetchInvitations();
      await get().fetchAgencies();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  rejectInvitation: async (id) => {
    try {
      await api.post(`/Agency/${id}/reject`);
      await get().fetchInvitations();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  fetchMembers: async (id) => {
    try {
      return await api.get(`/Agency/${id}/members`);
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  inviteMember: async (id, email, rol = 'Colaborador', permisos = {}) => {
    try {
      await api.post(`/Agency/${id}/invite`, { Email: email, Rol: rol, Permisos: permisos });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  updateMemberPermissions: async (id, userId, rol, permisos) => {
    try {
      await api.put(`/Agency/${id}/members/${userId}`, { Rol: rol, Permisos: permisos });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  getAgencyWorkspaces: async (id) => {
    try {
      return await api.get(`/Agency/${id}/workspaces`);
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  getAgencyWorkspacesWithProjects: async (id) => {
    try {
      return await api.get(`/Agency/${id}/workspaces-with-projects`);
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  updateAgencyProfile: async (id, nombre, redesSociales, branding, mision, vision, datosMarketing) => {
    try {
      await api.put(`/Agency/${id}/profile`, {
        nombre,
        redes_sociales: redesSociales,
        branding,
        mision,
        vision,
        datos_marketing: datosMarketing
      });
      await get().fetchAgencies();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  createWorkspaceInAgency: async (id, nombre) => {
    try {
      return await api.post(`/Agency/${id}/workspaces`, { Nombre: nombre });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}));
