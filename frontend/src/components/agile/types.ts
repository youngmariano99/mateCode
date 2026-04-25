export interface Historia {
  id: string;
  proyectoId: string;
  epicaId: string;
  titulo: string;
  user?: string; // Ej: Colono, Administrador
  criteriosBdd?: string;
  prioridad?: string; // MVP, Iteración 1, etc.
  tareasTecnicasJson?: any;
  ticketStatus?: string; // Sync con Kanban
  rangoLexicografico?: string;
}

export interface Epica {
  id: string;
  proyectoId: string;
  titulo: string;
  actividad?: string;
  historias: Historia[];
}

export interface Ticket {
  id: string;
  proyectoId: string;
  historiaId?: string;
  sprintId?: string;
  origenHistoriaId?: string;
  epicTag?: string;
  prioridad?: string;
  criteriosJson?: any;
  tareasJson?: any;
  fechaInicioReal?: string;
  fechaFinReal?: string;
  tipo: 'Tarea' | 'Bug' | 'DeudaTécnica';
  titulo: string;
  estado: string; // 'Backlog', 'To Do', 'In Progress', 'Done'
  responsableId?: string;
  rangoLexicografico: string;
}

export interface Sprint {
  id: string;
  proyectoId: string;
  nombre: string;
  objetivo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string; // 'Planificado', 'Activo', 'Cerrado'
}

export interface MetricaSprint {
  id: string;
  sprintId: string;
  ticketsCompletados: number;
  ticketsIncompletos: number;
  promedioCycleTimeHoras: number;
  notasRetrospectiva: string;
  fechaCierre: string;
}

export type TicketStatus = string;
