import { create } from 'zustand';
import { api } from '../lib/apiClient';

export interface CalendarEvent {
  id: string;
  agenciaId: string;
  clienteId?: string;
  proyectoId?: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: string; // Reunión Cliente, Reunión Interna, Hito, Otro
  colorHex?: string;
  usuarioResponsableId?: string;
  fechaCreacion: string;
  cliente?: { id: string; nombre: string; email?: string };
  proyecto?: { id: string; nombre: string };
  usuarioResponsable?: { id: string; nombreCompleto: string };
}

interface CalendarState {
  events: CalendarEvent[];
  fetchEvents: () => Promise<void>;
  createEvent: (ev: Omit<CalendarEvent, 'id' | 'agenciaId' | 'fechaCreacion'>) => Promise<void>;
  updateEvent: (id: string, ev: Omit<CalendarEvent, 'id' | 'agenciaId' | 'fechaCreacion'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  fetchEvents: async () => {
    try {
      const data = await api.get('/AgencyCalendar');
      set({ events: data });
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    }
  },
  createEvent: async (ev) => {
    try {
      const data = await api.post('/AgencyCalendar', ev);
      set((state) => ({ events: [...state.events, data] }));
    } catch (err) {
      console.error('Error creating calendar event:', err);
      throw err;
    }
  },
  updateEvent: async (id, ev) => {
    try {
      await api.put(`/AgencyCalendar/${id}`, ev);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...ev } : e)),
      }));
    } catch (err) {
      console.error('Error updating calendar event:', err);
      throw err;
    }
  },
  deleteEvent: async (id) => {
    try {
      await api.delete(`/AgencyCalendar/${id}`);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
    } catch (err) {
      console.error('Error deleting calendar event:', err);
      throw err;
    }
  },
}));
