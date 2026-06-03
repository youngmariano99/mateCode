import { create } from 'zustand';
import { api } from '../lib/apiClient';

export interface Transaction {
  id: string;
  agencia_id: string;
  tipo: string;
  monto: number;
  concepto: string;
  descripcion?: string;
  fecha: string;
  categoria?: string;
  proyecto_id?: string;
  fecha_creacion: string;
}

interface FinanceState {
  financeData: {
    transacciones: Transaction[];
    totalIngresos: number;
    totalEgresos: number;
    totalCostosFijos: number;
    totalCostosVariables: number;
    balanceNeto: number;
  } | null;
  fetchFinanceDashboard: () => Promise<void>;
  createTransaction: (tx: { tipo: string; monto: number; concepto: string; descripcion: string; fecha: string; categoria: string; proyectoId?: string }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  financeData: null,
  fetchFinanceDashboard: async () => {
    try {
      const data = await api.get('/AgencyFinance');
      set({ financeData: data });
    } catch (err) {
      console.error(err);
    }
  },
  createTransaction: async (tx) => {
    try {
      await api.post('/AgencyFinance', {
        Tipo: tx.tipo,
        Monto: tx.monto,
        Concepto: tx.concepto,
        Descripcion: tx.descripcion,
        Fecha: tx.fecha,
        Categoria: tx.categoria,
        ProyectoId: tx.proyectoId
      });
      await get().fetchFinanceDashboard();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteTransaction: async (id) => {
    try {
      await api.delete(`/AgencyFinance/${id}`);
      await get().fetchFinanceDashboard();
    } catch (err) {
      console.error(err);
    }
  }
}));
