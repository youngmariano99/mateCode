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
  tipo: 'Tarea' | 'Bug' | 'DeudaTécnica';
  titulo: string;
  estado: string; // Ahora dinámico por las columnas de la base de datos
  responsableId?: string;
  rangoLexicografico: string;
}

export type TicketStatus = string;
