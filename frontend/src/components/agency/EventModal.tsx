import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock, User, Briefcase, FileText } from 'lucide-react';
import { useCalendarStore, type CalendarEvent } from '../../store/useCalendarStore';
import type { Member } from '../../store/useAgencyStore';
import type { Lead } from '../../store/useCrmStore';
import Swal from 'sweetalert2';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: CalendarEvent | null;
  initialDate: string | null; // format YYYY-MM-DD
  agencyMembers: Member[];
  clients: Lead[];
  projects: any[]; // List of projects
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  initialDate,
  agencyMembers,
  clients,
  projects,
}) => {
  const { createEvent, updateEvent, deleteEvent } = useCalendarStore();
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    tipo: 'Interna',
    colorHex: '#3b82f6',
    usuarioResponsableId: '',
    clienteId: '',
    proyectoId: '',
  });

  useEffect(() => {
    if (eventToEdit) {
      setForm({
        titulo: eventToEdit.titulo,
        descripcion: eventToEdit.descripcion ?? '',
        fechaInicio: eventToEdit.fechaInicio.substring(0, 16), // YYYY-MM-DDThh:mm
        fechaFin: eventToEdit.fechaFin.substring(0, 16),
        tipo: eventToEdit.tipo,
        colorHex: eventToEdit.colorHex ?? '#3b82f6',
        usuarioResponsableId: eventToEdit.usuarioResponsableId ?? '',
        clienteId: eventToEdit.clienteId ?? '',
        proyectoId: eventToEdit.proyectoId ?? '',
      });
    } else {
      const start = initialDate ? `${initialDate}T09:00` : new Date().toISOString().substring(0, 16);
      const end = initialDate ? `${initialDate}T10:00` : new Date(Date.now() + 3600000).toISOString().substring(0, 16);
      setForm({
        titulo: '',
        descripcion: '',
        fechaInicio: start,
        fechaFin: end,
        tipo: 'Interna',
        colorHex: '#3b82f6',
        usuarioResponsableId: '',
        clienteId: '',
        proyectoId: '',
      });
    }
  }, [eventToEdit, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      Swal.fire({ title: 'Aviso', text: 'El título es requerido.', icon: 'warning', background: '#09090b', color: '#f4f4f5' });
      return;
    }

    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || undefined,
      fechaInicio: new Date(form.fechaInicio).toISOString(),
      fechaFin: new Date(form.fechaFin).toISOString(),
      tipo: form.tipo,
      colorHex: form.colorHex,
      usuarioResponsableId: form.usuarioResponsableId || undefined,
      clienteId: form.clienteId || undefined,
      proyectoId: form.proyectoId || undefined,
    };

    try {
      if (eventToEdit) {
        await updateEvent(eventToEdit.id, payload);
      } else {
        await createEvent(payload);
      }
      onClose();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#09090b', color: '#f4f4f5' });
    }
  };

  const handleDelete = async () => {
    if (!eventToEdit) return;
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar evento?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (isConfirmed) {
      try {
        await deleteEvent(eventToEdit.id);
        onClose();
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#09090b', color: '#f4f4f5' });
      }
    }
  };

  const EVENT_TYPES = [
    { value: 'Reunión Cliente', label: 'Reunión con Cliente', color: '#0ea5e9' },
    { value: 'Interna', label: 'Actividad Interna', color: '#10b981' },
    { value: 'Hito', label: 'Hito del Proyecto', color: '#f59e0b' },
    { value: 'Otro', label: 'Otro', color: '#8b5cf6' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <Calendar size={18} />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              {eventToEdit ? 'Editar Evento' : 'Agendar Evento'}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
          {/* Título */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Título del Evento</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              placeholder="Ej: Kickoff de Proyecto, Demo Semanal..."
            />
          </div>

          {/* Tipo de Evento & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => {
                  const val = e.target.value;
                  const color = EVENT_TYPES.find((t) => t.value === val)?.color ?? '#3b82f6';
                  setForm({ ...form, tipo: val, colorHex: color });
                }}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Color de Etiqueta</label>
              <div className="flex items-center gap-2 py-1">
                <input
                  type="color"
                  value={form.colorHex}
                  onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
                  className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                />
                <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase">{form.colorHex}</span>
              </div>
            </div>
          </div>

          {/* Fecha Inicio & Fin */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                <Clock size={10} /> Inicio
              </label>
              <input
                type="datetime-local"
                value={form.fechaInicio}
                onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                <Clock size={10} /> Fin
              </label>
              <input
                type="datetime-local"
                value={form.fechaFin}
                onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Descripción / Detalles</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              placeholder="Enlace de videollamada, temas a tratar..."
            />
          </div>

          {/* Responsable de Equipo */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
              <User size={10} /> Miembro Responsable
            </label>
            <select
              value={form.usuarioResponsableId}
              onChange={(e) => setForm({ ...form, usuarioResponsableId: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="">-- Sin asignar --</option>
              {agencyMembers.map((m) => (
                <option key={m.usuario_id} value={m.usuario_id}>
                  {m.usuario?.nombre_completo || m.usuario?.email} {m.usuario?.nombre_usuario ? `(@${m.usuario.nombre_usuario})` : ''} ({m.rol})
                </option>
              ))}
            </select>
          </div>

          {/* Cliente (CRM) & Proyecto (Opcionales) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                <FileText size={10} /> Cliente CRM
              </label>
              <select
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="">-- Ninguno --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                <Briefcase size={10} /> Proyecto
              </label>
              <select
                value={form.proyectoId}
                onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="">-- Ninguno --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-between items-center pt-4 border-t border-zinc-800/80">
            {eventToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Eliminar</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-xs font-bold rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
