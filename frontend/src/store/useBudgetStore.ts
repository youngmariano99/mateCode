import { create } from 'zustand';
import { api } from '../lib/apiClient';

export interface Budget {
  id?: string;
  proyectoId: string;
  perfilId: string;
  alcanceJson: any;
  montoTotal: number;
}

interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  fetchBudgets: (projectId: string) => Promise<void>;
  saveBudget: (budgetData: Budget) => Promise<Budget>;
  deleteBudget: (budgetId: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  loading: false,
  fetchBudgets: async (projectId) => {
    set({ loading: true });
    try {
      const data = await api.get(`/Budget/${projectId}`);
      // Standardize properties to camelCase if backend returns them in PascalCase
      const formatted = (data || []).map((item: any) => ({
        id: item.id || item.Id,
        proyectoId: item.proyectoId || item.ProyectoId,
        perfilId: item.perfilId || item.PerfilId,
        alcanceJson: item.alcanceJson || item.AlcanceJson,
        montoTotal: item.montoTotal || item.MontoTotal
      }));
      set({ budgets: formatted });
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      set({ loading: false });
    }
  },
  saveBudget: async (budgetData) => {
    try {
      const response = await api.post('/Budget', {
        Id: budgetData.id,
        ProyectoId: budgetData.proyectoId,
        PerfilId: budgetData.perfilId || '00000000-0000-0000-0000-000000000000',
        AlcanceJson: budgetData.alcanceJson,
        MontoTotal: budgetData.montoTotal
      });
      // Refetch budgets
      await get().fetchBudgets(budgetData.proyectoId);
      return response;
    } catch (err) {
      console.error('Error saving budget:', err);
      throw err;
    }
  },
  deleteBudget: async (budgetId) => {
    try {
      await api.delete(`/Budget/${budgetId}`);
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== budgetId)
      }));
    } catch (err) {
      console.error('Error deleting budget:', err);
      throw err;
    }
  }
}));
