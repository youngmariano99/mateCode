import { create } from 'zustand';
import { api } from '../lib/apiClient';

export interface Secret {
  id: string;
  agencia_id: string;
  servicio: string;
  usuario?: string;
  clave_encriptada: string;
  url_acceso?: string;
  roles_permitidos?: string[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface SecretsState {
  secrets: Secret[];
  fetchSecrets: () => Promise<void>;
  createSecret: (secret: { servicio: string; usuario: string; passwordPlano: string; urlAcceso: string; rolesPermitidos: string[] }) => Promise<void>;
  revealSecret: (id: string) => Promise<string>;
  deleteSecret: (id: string) => Promise<void>;
}

export const useSecretsStore = create<SecretsState>((set) => ({
  secrets: [],
  fetchSecrets: async () => {
    try {
      const data = await api.get('/Secrets');
      set({ secrets: data });
    } catch (err) {
      console.error(err);
    }
  },
  createSecret: async (secret) => {
    try {
      const data = await api.post('/Secrets', {
        Servicio: secret.servicio,
        Usuario: secret.usuario,
        PasswordPlano: secret.passwordPlano,
        UrlAcceso: secret.urlAcceso,
        RolesPermitidos: secret.rolesPermitidos
      });
      set(state => ({ secrets: [...state.secrets, data] }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  revealSecret: async (id) => {
    try {
      const data = await api.post(`/Secrets/reveal/${id}`) as any;
      return data.password;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteSecret: async (id) => {
    try {
      await api.delete(`/Secrets/${id}`);
      set(state => ({ secrets: state.secrets.filter(s => s.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  }
}));
