export interface Historia {
  id: string;
  proyectoId: string;
  epicaId: string;
  titulo: string;
  criteriosBdd?: string;
  rangoLexicografico?: string;
}

export interface Epica {
  id: string;
  proyectoId: string;
  titulo: string;
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
