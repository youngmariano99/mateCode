import { create } from 'zustand';
import { api } from '../lib/apiClient';

export interface Goal {
  id: string;
  agencia_id: string;
  usuario_asignado_id: string;
  creador_id?: string;
  titulo: string;
  descripcion?: string;
  tipo_periodo: string;
  fecha_limite?: string;
  completado: boolean;
  fecha_creacion: string;
  usuario_asignado?: {
    nombre_completo: string;
  };
}

interface GoalsState {
  goals: Goal[];
  fetchGoals: (userId?: string) => Promise<void>;
  createGoal: (goal: { usuario_asignado_id: string; titulo: string; descripcion: string; tipo_periodo: string; fecha_limite?: string }) => Promise<void>;
  toggleGoal: (id: string, completado: boolean) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  fetchGoals: async (userId) => {
    try {
      const data = await api.get('/Goals', { params: userId ? { userId } : undefined });
      set({ goals: data });
    } catch (err) {
      console.error(err);
    }
  },
  createGoal: async (goal) => {
    try {
      const data = await api.post('/Goals', {
        UsuarioAsignadoId: goal.usuario_asignado_id,
        Titulo: goal.titulo,
        Descripcion: goal.descripcion,
        TipoPeriodo: goal.tipo_periodo,
        FechaLimite: goal.fecha_limite
      });
      set(state => ({ goals: [...state.goals, data] }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  toggleGoal: async (id, completado) => {
    try {
      await api.put(`/Goals/${id}/toggle`, { Completado: completado });
      set(state => ({
        goals: state.goals.map(g => g.id === id ? { ...g, completado } : g)
      }));
    } catch (err) {
      console.error(err);
    }
  }
}));
