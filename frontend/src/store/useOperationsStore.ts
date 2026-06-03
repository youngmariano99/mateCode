import { create } from 'zustand';
import { api } from '../lib/apiClient';

export interface Resource {
  id: string;
  agencia_id: string;
  titulo: string;
  contenido?: string;
  tipo: string;
  etiquetas?: string[];
  roles_permitidos?: string[];
  creador_id?: string;
  fecha_creacion: string;
  categoria?: string;
  favorito?: boolean;
}

export interface TaskOperative {
  id: string;
  agencia_id: string;
  titulo: string;
  descripcion?: string;
  estado: string;
  fecha_planificada?: string;
  usuario_asignado_id?: string;
  rango_lexicografico?: string;
  fecha_creacion: string;
}

export interface ContentPlan {
  id: string;
  agencia_id: string;
  miembro_id: string;
  titulo: string;
  plataformas: string[];
  guion_plantilla?: string;
  dialogo?: string;
  procedimiento_estandar?: string;
  estado: string;
  notas_mejora?: string;
  resumen_analitico?: any;
  fecha_publicacion?: string;
  fecha_creacion: string;
}

export interface AuditLog {
  id: string;
  agencia_id: string;
  usuario_id: string;
  nombre_usuario?: string;
  modulo: string;
  accion: string;
  registro_id?: string;
  detalles?: any;
  fecha: string;
}

interface OperationsState {
  resources: Resource[];
  tasks: TaskOperative[];
  contents: ContentPlan[];
  auditLogs: AuditLog[];

  // Resources
  fetchResources: () => Promise<void>;
  createResource: (res: { titulo: string; contenido: string; tipo: string; etiquetas: string[]; roles_permitidos: string[]; categoria?: string; favorito?: boolean }) => Promise<void>;
  updateResource: (id: string, res: { titulo: string; contenido: string; tipo: string; etiquetas: string[]; roles_permitidos: string[]; categoria?: string; favorito?: boolean }) => Promise<void>;
  toggleResourceFavorite: (id: string, favorito: boolean) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;

  // Tasks
  fetchTasks: () => Promise<void>;
  createTask: (task: { titulo: string; descripcion: string; estado: string; fecha_planificada?: string; usuario_asignado_id?: string }) => Promise<void>;
  updateTaskStatus: (id: string, estado: string, posicion?: string) => Promise<void>;
  updateTask: (id: string, task: { titulo: string; descripcion: string; estado: string; fecha_planificada?: string; usuario_asignado_id?: string }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Contents
  fetchContents: () => Promise<void>;
  createContent: (content: { miembroId: string; titulo: string; plataformas: string[]; guionPlantilla: string; dialogo: string; procedimientoEstandar: string; estado: string; notasMejora: string }) => Promise<void>;
  updateContent: (id: string, content: { titulo: string; plataformas: string[]; guionPlantilla: string; dialogo: string; procedimientoEstandar: string; estado: string; notasMejora: string; resumenAnalitico?: any; fechaPublicacion?: string }) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;

  // Audit Logs
  fetchAuditLogs: () => Promise<void>;
}

export const useOperationsStore = create<OperationsState>((set) => ({
  resources: [],
  tasks: [],
  contents: [],
  auditLogs: [],

  // Resources Actions
  fetchResources: async () => {
    try {
      const data = await api.get('/AgencyOperations/resources');
      set({ resources: data });
    } catch (err) {
      console.error(err);
    }
  },
  createResource: async (res) => {
    try {
      const data = await api.post('/AgencyOperations/resources', res);
      set(state => ({ resources: [...state.resources, data] }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  updateResource: async (id, res) => {
    try {
      await api.put(`/AgencyOperations/resources/${id}`, res);
      set(state => ({
        resources: state.resources.map(r => r.id === id ? { ...r, ...res } : r)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  toggleResourceFavorite: async (id, favorito) => {
    try {
      await api.put(`/AgencyOperations/resources/${id}/favorite`, { favorito });
      set(state => ({
        resources: state.resources.map(r => r.id === id ? { ...r, favorito } : r)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteResource: async (id) => {
    try {
      await api.delete(`/AgencyOperations/resources/${id}`);
      set(state => ({ resources: state.resources.filter(r => r.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  },

  // Tasks Actions
  fetchTasks: async () => {
    try {
      const data = await api.get('/AgencyOperations/tasks');
      set({ tasks: data });
    } catch (err) {
      console.error(err);
    }
  },
  createTask: async (task) => {
    try {
      const data = await api.post('/AgencyOperations/tasks', task);
      set(state => ({ tasks: [...state.tasks, data] }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  updateTaskStatus: async (id, estado, posicion = 'a') => {
    try {
      await api.put(`/AgencyOperations/tasks/status/${id}`, { Estado: estado, Posicion: posicion });
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, estado, rango_lexicografico: posicion } : t)
      }));
    } catch (err) {
      console.error(err);
    }
  },
  updateTask: async (id, task) => {
    try {
      await api.put(`/AgencyOperations/tasks/${id}`, task);
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...task } : t)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteTask: async (id) => {
    try {
      await api.delete(`/AgencyOperations/tasks/${id}`);
      set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  },

  // Contents Actions
  fetchContents: async () => {
    try {
      const data = await api.get('/AgencyOperations/contents');
      set({ contents: data });
    } catch (err) {
      console.error(err);
    }
  },
  createContent: async (content) => {
    try {
      const data = await api.post('/AgencyOperations/contents', content);
      set(state => ({ contents: [...state.contents, data] }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  updateContent: async (id, content) => {
    try {
      await api.put(`/AgencyOperations/contents/${id}`, content);
      set(state => ({
        contents: state.contents.map(c => c.id === id ? { ...c, ...content } : c)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteContent: async (id) => {
    try {
      await api.delete(`/AgencyOperations/contents/${id}`);
      set(state => ({ contents: state.contents.filter(c => c.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  },

  // Audit Actions
  fetchAuditLogs: async () => {
    try {
      const data = await api.get('/Audit');
      set({ auditLogs: data });
    } catch (err) {
      console.error(err);
    }
  }
}));
