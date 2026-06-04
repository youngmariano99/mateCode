import { create } from 'zustand';
import { api } from '../lib/apiClient';

export interface Lead {
  id: string;
  agenciaId?: string;
  nombre: string;
  email?: string;
  categoria: string;
  calificacion: string;
  origenContacto?: string;
  motivoContacto?: string;
  descripcion?: string;
  notas?: any[];
  rangoLexicografico?: string;
  fechaCreacion: string;
  contextoJson?: any;
}

export interface Contract {
  id: string;
  agenciaId: string;
  clienteId?: string;
  titulo: string;
  contenido: string;
  estado: string; // Borrador, Enviado, Firmado
  fechaCreacion: string;
  fechaFirma?: string;
  huellaCriptografica?: string;
  cliente?: { nombre: string; email: string };
  tipoContrato?: string;
  miembrosIds?: any;
}

interface CrmState {
  leads: Lead[];
  contracts: Contract[];
  fetchLeads: () => Promise<void>;
  createLead: (lead: Omit<Lead, 'id' | 'agenciaId' | 'fechaCreacion'>) => Promise<void>;
  updateLeadStatus: (id: string, categoria: string, posicion?: string) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  
  // Contratos
  fetchContracts: () => Promise<void>;
  createContract: (contract: Omit<Contract, 'id' | 'agenciaId' | 'fechaCreacion'>) => Promise<void>;
  updateContract: (id: string, contract: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  signContract: (id: string, huellaCriptografica: string) => Promise<void>;
}

export const useCrmStore = create<CrmState>((set) => ({
  leads: [],
  contracts: [],
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
        leads: state.leads.map(l => l.id === id ? { ...l, categoria, rangoLexicografico: posicion } : l)
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
  },

  // Contratos
  fetchContracts: async () => {
    try {
      const data = await api.get('/AgencyContract');
      set({ contracts: data });
    } catch (err) {
      console.error(err);
    }
  },
  createContract: async (contract) => {
    try {
      const data = await api.post('/AgencyContract', contract);
      set(state => ({ contracts: [data, ...state.contracts] }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  updateContract: async (id, contract) => {
    try {
      await api.put(`/AgencyContract/${id}`, contract);
      set(state => ({
        contracts: state.contracts.map(c => c.id === id ? { ...c, ...contract } : c)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteContract: async (id) => {
    try {
      await api.delete(`/AgencyContract/${id}`);
      set(state => ({
        contracts: state.contracts.filter(c => c.id !== id)
      }));
    } catch (err) {
      console.error(err);
    }
  },
  signContract: async (id, huellaCriptografica) => {
    try {
      await api.post(`/AgencyContract/${id}/sign`, { HuellaCriptografica: huellaCriptografica });
      set(state => ({
        contracts: state.contracts.map(c => c.id === id 
          ? { ...c, estado: 'Firmado', fechaFirma: new Date().toISOString(), huellaCriptografica } 
          : c)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}));
