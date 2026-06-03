import { create } from 'zustand';
import { api } from '../lib/apiClient';

export interface Lead {
  id: string;
  agencia_id: string;
  nombre: string;
  email?: string;
  categoria: string;
  calificacion: string;
  origen_contacto?: string;
  motivo_contacto?: string;
  descripcion?: string;
  notas?: any[];
  orden_posicion?: string;
  fecha_creacion: string;
}

interface CrmState {
  leads: Lead[];
  fetchLeads: () => Promise<void>;
  createLead: (lead: Omit<Lead, 'id' | 'agencia_id' | 'fecha_creacion'>) => Promise<void>;
  updateLeadStatus: (id: string, categoria: string, posicion?: string) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

export const useCrmStore = create<CrmState>((set) => ({
  leads: [],
  fetchLeads: async () => {
    try {
      const data = await api.get('/AgencyCrm');
      set({ leads: data });
    } catch (err) {
      console.error(err);
    }
  },
  createLead: async (lead) => {
    try {
      const data = await api.post('/AgencyCrm', lead);
      set(state => ({ leads: [...state.leads, data] }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  updateLeadStatus: async (id, categoria, posicion = 'a') => {
    try {
      await api.put(`/AgencyCrm/status/${id}`, { Categoria: categoria, Posicion: posicion });
      set(state => ({
        leads: state.leads.map(l => l.id === id ? { ...l, categoria, orden_posicion: posicion } : l)
      }));
    } catch (err) {
      console.error(err);
    }
  },
  updateLead: async (id, lead) => {
    try {
      await api.put(`/AgencyCrm/${id}`, lead);
      set(state => ({
        leads: state.leads.map(l => l.id === id ? { ...l, ...lead } : l)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteLead: async (id) => {
    try {
      await api.delete(`/AgencyCrm/${id}`);
      set(state => ({ leads: state.leads.filter(l => l.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  }
}));
