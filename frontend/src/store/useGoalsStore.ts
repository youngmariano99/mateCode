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
  updateGoal: (id: string, goal: { usuario_asignado_id: string; titulo: string; descripcion: string; tipo_periodo: string; fecha_limite?: string }) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const mapGoal = (g: any): Goal => {
  if (!g) return g;
  return {
    id: g.id,
    agencia_id: g.agenciaId || g.agencia_id,
    usuario_asignado_id: g.usuarioAsignadoId || g.usuario_asignado_id,
    creador_id: g.creadorId || g.creador_id,
    titulo: g.titulo,
    descripcion: g.descripcion,
    tipo_periodo: g.tipoPeriodo || g.tipo_periodo,
    fecha_limite: g.fechaLimite || g.fecha_limite,
    completado: g.completado,
    fecha_creacion: g.fechaCreacion || g.fecha_creacion,
    usuario_asignado: g.usuarioAsignado 
      ? { nombre_completo: g.usuarioAsignado.nombreCompleto || g.usuarioAsignado.nombre_completo }
      : (g.usuario_asignado 
          ? { nombre_completo: g.usuario_asignado.nombre_completo } 
          : undefined)
  };
};

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  fetchGoals: async (userId) => {
    try {
      const data = await api.get('/Goals', { params: userId ? { userId } : undefined });
      const list = Array.isArray(data) ? data.map(mapGoal) : [];
      set({ goals: list });
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
      set(state => ({ goals: [...state.goals, mapGoal(data)] }));
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
  },
  updateGoal: async (id, goal) => {
    try {
      const data = await api.put(`/Goals/${id}`, {
        UsuarioAsignadoId: goal.usuario_asignado_id,
        Titulo: goal.titulo,
        Descripcion: goal.descripcion,
        TipoPeriodo: goal.tipo_periodo,
        FechaLimite: goal.fecha_limite
      });
      set(state => ({
        goals: state.goals.map(g => g.id === id ? mapGoal(data) : g)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteGoal: async (id) => {
    try {
      await api.delete(`/Goals/${id}`);
      set(state => ({
        goals: state.goals.filter(g => g.id !== id)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}));
