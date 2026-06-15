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
  cliente_id?: string;
  cliente?: { id: string; nombre: string; email?: string };
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
  espacio_trabajo_id?: string;
  proyecto_id?: string;
  recurso_id?: string;
  espacio_trabajo?: { id: string; nombre: string };
  proyecto?: { id: string; nombre: string };
  recurso?: { id: string; titulo: string; tipo: string; contenido?: string };
}

export const normalizeTask = (t: any): TaskOperative => {
  if (!t) return t;
  return {
    ...t,
    id: t.id,
    agencia_id: t.agenciaId || t.agencia_id,
    titulo: t.titulo,
    descripcion: t.descripcion,
    estado: t.estado,
    fecha_planificada: t.fechaPlanificada || t.fecha_planificada,
    usuario_asignado_id: t.usuarioAsignadoId || t.usuario_asignado_id,
    rango_lexicografico: t.rangoLexicografico || t.rango_lexicografico,
    fecha_creacion: t.fechaCreacion || t.fecha_creacion,
    espacio_trabajo_id: t.espacioTrabajoId || t.espacio_trabajo_id,
    proyecto_id: t.proyectoId || t.proyecto_id,
    recurso_id: t.recursoId || t.recurso_id,
    espacio_trabajo: t.espacioTrabajo || t.espacio_trabajo,
    proyecto: t.proyecto,
    recurso: t.recurso
  };
};

export interface KanbanColumnaOperativa {
  id: string;
  agencia_id: string;
  nombre: string;
  orden: number;
  fecha_creacion: string;
}

export interface ParsedColumn {
  name: string;
  color: string;
  isUncompleted: boolean;
  isDone: boolean;
}

export function parseColumnName(rawName: string): ParsedColumn {
  if (!rawName) return { name: '', color: '#71717a', isUncompleted: false, isDone: false };
  if (rawName.includes('|')) {
    const [name, color, flags] = rawName.split('|');
    return {
      name,
      color: color || '#71717a',
      isUncompleted: flags?.includes('uncompleted') || false,
      isDone: flags?.includes('done') || false
    };
  }
  return {
    name: rawName,
    color: '#71717a',
    isUncompleted: rawName === 'No completado',
    isDone: rawName === 'Done' || rawName === 'Hecho'
  };
}

export interface WeeklyReport {
  id: string;
  agencia_id: string;
  fechaInicio: string;
  fechaFin: string;
  metricasJson: string;
  leccionesAprendidas: string;
  fecha_creacion: string;
}

export interface ContentPlan {
  id: string;
  agencia_id: string;
  agenciaId?: string;
  miembro_id: string;
  miembroId?: string;
  titulo: string;
  plataformas: string[];
  guion_plantilla?: string;
  guionPlantilla?: string;
  dialogo?: string;
  procedimiento_estandar?: string;
  procedimientoEstandar?: string;
  estado: string;
  notas_mejora?: string;
  notasMejora?: string;
  resumen_analitico?: any;
  resumenAnalitico?: any;
  fecha_publicacion?: string;
  fechaPublicacion?: string;
  fecha_creacion: string;
  fechaCreacion?: string;
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
  kanbanColumns: KanbanColumnaOperativa[];
  weeklyReports: WeeklyReport[];

  // Resources
  fetchResources: () => Promise<void>;
  createResource: (res: { titulo: string; contenido: string; tipo: string; etiquetas: string[]; roles_permitidos: string[]; categoria?: string; favorito?: boolean; cliente_id?: string }) => Promise<void>;
  updateResource: (id: string, res: { titulo: string; contenido: string; tipo: string; etiquetas: string[]; roles_permitidos: string[]; categoria?: string; favorito?: boolean; cliente_id?: string }) => Promise<void>;
  toggleResourceFavorite: (id: string, favorito: boolean) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;

  // Tasks
  fetchTasks: () => Promise<void>;
  createTask: (task: { titulo: string; descripcion: string; estado: string; fecha_planificada?: string; usuario_asignado_id?: string; espacioTrabajoId?: string; proyectoId?: string; recursoId?: string; espacio_trabajo_id?: string; proyecto_id?: string; recurso_id?: string }) => Promise<void>;
  updateTaskStatus: (id: string, estado: string, posicion?: string) => Promise<void>;
  updateTask: (id: string, task: { titulo: string; descripcion: string; estado: string; fecha_planificada?: string; usuario_asignado_id?: string; espacioTrabajoId?: string; proyectoId?: string; recursoId?: string; espacio_trabajo_id?: string; proyecto_id?: string; recurso_id?: string }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Contents
  fetchContents: () => Promise<void>;
  createContent: (content: { miembroId: string; titulo: string; plataformas: string[]; guionPlantilla: string; dialogo: string; procedimientoEstandar: string; estado: string; notasMejora: string; fechaPublicacion?: string }) => Promise<void>;
  updateContent: (id: string, content: { miembroId?: string; titulo: string; plataformas: string[]; guionPlantilla: string; dialogo: string; procedimientoEstandar: string; estado: string; notasMejora: string; resumenAnalitico?: any; fechaPublicacion?: string }) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;

  // Audit Logs
  fetchAuditLogs: () => Promise<void>;

  // Kanban Columns
  fetchKanbanColumns: () => Promise<void>;
  createKanbanColumn: (nombre: string, orden: number) => Promise<void>;
  updateKanbanColumnsOrder: (columnOrders: { key: string; value: number }[]) => Promise<void>;
  updateKanbanColumnName: (id: string, nombre: string) => Promise<void>;
  deleteKanbanColumn: (id: string) => Promise<void>;

  // Weekly Reports
  fetchWeeklyReports: () => Promise<void>;
  createWeeklyReport: (fechaInicio: string, fechaFin: string, leccionesAprendidas: string) => Promise<void>;
  deleteWeeklyReport: (id: string) => Promise<void>;
  generateWeeklyMetricsPreview: (fechaInicio: string, fechaFin: string) => Promise<any>;
}

export const useOperationsStore = create<OperationsState>((set) => ({
  resources: [],
  tasks: [],
  contents: [],
  auditLogs: [],
  kanbanColumns: [],
  weeklyReports: [],

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
      await api.post('/AgencyOperations/resources', res);
      const data = await api.get('/AgencyOperations/resources');
      set({ resources: data });
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  updateResource: async (id, res) => {
    try {
      await api.put(`/AgencyOperations/resources/${id}`, res);
      const data = await api.get('/AgencyOperations/resources');
      set({ resources: data });
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
      set({ tasks: (data || []).map(normalizeTask) });
    } catch (err) {
      console.error(err);
    }
  },
  createTask: async (task) => {
    try {
      const payload = {
        titulo: task.titulo,
        descripcion: task.descripcion,
        estado: task.estado,
        fechaPlanificada: task.fecha_planificada || (task as any).fechaPlanificada,
        usuarioAsignadoId: task.usuario_asignado_id || (task as any).usuarioAsignadoId,
        espacioTrabajoId: task.espacioTrabajoId || task.espacio_trabajo_id,
        proyectoId: task.proyectoId || task.proyecto_id,
        recursoId: task.recursoId || task.recurso_id
      };
      const data = await api.post('/AgencyOperations/tasks', payload);
      set(state => ({ tasks: [...state.tasks, normalizeTask(data)] }));
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
      const payload = {
        titulo: task.titulo,
        descripcion: task.descripcion,
        estado: task.estado,
        fechaPlanificada: task.fecha_planificada || (task as any).fechaPlanificada,
        usuarioAsignadoId: task.usuario_asignado_id || (task as any).usuarioAsignadoId,
        espacioTrabajoId: task.espacioTrabajoId || task.espacio_trabajo_id,
        proyectoId: task.proyectoId || task.proyecto_id,
        recursoId: task.recursoId || task.recurso_id
      };
      await api.put(`/AgencyOperations/tasks/${id}`, payload);
      // Refetch tasks to load includes correctly
      const data = await api.get('/AgencyOperations/tasks');
      set({ tasks: (data || []).map(normalizeTask) });
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
  },

  // Kanban Columns Actions
  fetchKanbanColumns: async () => {
    try {
      const data = await api.get('/AgencyOperationsUpdate/columns');
      set({ kanbanColumns: data });
    } catch (err) {
      console.error(err);
    }
  },
  createKanbanColumn: async (nombre, orden) => {
    try {
      const data = await api.post('/AgencyOperationsUpdate/columns', { nombre, orden });
      set(state => ({ kanbanColumns: [...state.kanbanColumns, data].sort((a, b) => a.orden - b.orden) }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  updateKanbanColumnsOrder: async (columnOrders) => {
    try {
      await api.put('/AgencyOperationsUpdate/columns/order', columnOrders);
      set(state => ({
        kanbanColumns: state.kanbanColumns.map(c => {
          const match = columnOrders.find(co => co.key === c.id);
          return match ? { ...c, orden: match.value } : c;
        }).sort((a, b) => a.orden - b.orden)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  updateKanbanColumnName: async (id, nombre) => {
    try {
      await api.put(`/AgencyOperationsUpdate/columns/${id}/name`, { nombre });
      set(state => ({
        kanbanColumns: state.kanbanColumns.map(c => c.id === id ? { ...c, nombre } : c)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteKanbanColumn: async (id) => {
    try {
      await api.delete(`/AgencyOperationsUpdate/columns/${id}`);
      set(state => ({ kanbanColumns: state.kanbanColumns.filter(c => c.id !== id) }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Weekly Reports Actions
  fetchWeeklyReports: async () => {
    try {
      const data = await api.get('/AgencyOperationsUpdate/reports');
      set({ weeklyReports: data });
    } catch (err) {
      console.error(err);
    }
  },
  createWeeklyReport: async (fechaInicio, fechaFin, leccionesAprendidas) => {
    try {
      const data = await api.post('/AgencyOperationsUpdate/reports', { fechaInicio, fechaFin, leccionesAprendidas });
      set(state => ({ weeklyReports: [data, ...state.weeklyReports] }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  deleteWeeklyReport: async (id) => {
    try {
      await api.delete(`/AgencyOperationsUpdate/reports/${id}`);
      set(state => ({ weeklyReports: state.weeklyReports.filter(r => r.id !== id) }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  generateWeeklyMetricsPreview: async (fechaInicio, fechaFin) => {
    try {
      return await api.get(`/AgencyOperationsUpdate/metrics-helper?start=${fechaInicio}&end=${fechaFin}`);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}));
