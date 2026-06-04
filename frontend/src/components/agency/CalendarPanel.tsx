import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Filter, CalendarDays, User } from 'lucide-react';
import { useCalendarStore, type CalendarEvent } from '../../store/useCalendarStore';
import { useCrmStore } from '../../store/useCrmStore';
import type { Member } from '../../store/useAgencyStore';
import { EventModal } from './EventModal';

interface CalendarPanelProps {
  agencyMembers: Member[];
}

export const CalendarPanel: React.FC<CalendarPanelProps> = ({ agencyMembers }) => {
  const { events, fetchEvents } = useCalendarStore();
  const { leads, fetchLeads } = useCrmStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchLeads();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper arrays
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Get index of first day of the month (0 = Sun, 1 = Mon ... 6 = Sat)
  // Shift so Monday is 0
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6; // Sunday becomes index 6

  const totalDays = lastDayOfMonth.getDate();
  
  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from({ length: startOffset }, (_, i) => ({
    day: prevMonthLastDay - startOffset + i + 1,
    isCurrentMonth: false,
    dateString: new Date(year, month - 1, prevMonthLastDay - startOffset + i + 1).toISOString().split('T')[0]
  }));

  // Current month days
  const currentMonthDays = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: true,
    dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
  }));

  // Next month padding to fill 42 cells (6 rows * 7 columns)
  const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: false,
    dateString: new Date(year, month + 1, i + 1).toISOString().split('T')[0]
  }));

  const allCells = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Filter events
  const filteredEvents = events.filter(e => {
    const matchesSearch = search.trim() === '' || 
      e.titulo.toLowerCase().includes(search.toLowerCase()) || 
      (e.descripcion && e.descripcion.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = typeFilter === '' || e.tipo === typeFilter;
    
    const matchesMember = memberFilter === '' || e.usuarioResponsableId === memberFilter;

    return matchesSearch && matchesType && matchesMember;
  });

  // Helper to extract unique projects from events
  const projects = Array.from(
    new Map(
      events.filter(e => e.proyecto).map(e => [e.proyectoId, e.proyecto])
    ).values()
  );

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="text-sky-400" />
            <span>Calendario Operativo</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Agenda centralizada de reuniones con clientes, hitos y actividades del equipo.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Controls */}
          <div className="flex items-center bg-zinc-900 border border-zinc-850 rounded-xl p-1 shadow-md">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-bold text-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          
          <button onClick={handleToday} className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-colors">
            Hoy
          </button>

          <button
            onClick={() => {
              setSelectedEvent(null);
              setSelectedDate(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/10"
          >
            <Plus size={14} />
            <span>Agendar Evento</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/40 border border-zinc-850/60 p-3 rounded-2xl backdrop-blur-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-950/60 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-zinc-700"
            placeholder="Buscar eventos..."
          />
        </div>

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-3 text-zinc-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-950/60 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-700 appearance-none"
          >
            <option value="">Todos los Tipos</option>
            <option value="Reunión Cliente">Reuniones con Cliente</option>
            <option value="Interna">Actividades Internas</option>
            <option value="Hito">Hitos del Proyecto</option>
            <option value="Otro">Otros</option>
          </select>
        </div>

        <div className="relative">
          <User size={14} className="absolute left-3 top-3 text-zinc-500" />
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-950/60 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-700 appearance-none"
          >
            <option value="">Todos los Responsables</option>
            {agencyMembers.map(m => (
              <option key={m.usuario_id} value={m.usuario_id}>
                {m.usuario?.nombre_completo || m.usuario?.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="flex-1 flex flex-col bg-zinc-950/80 border border-zinc-850 rounded-2xl overflow-hidden min-h-[450px]">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-zinc-850 bg-zinc-900/30 text-center py-2.5">
          {daysOfWeek.map((day) => (
            <span key={day} className="text-[10px] font-black uppercase tracking-wider text-zinc-550">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 flex-1">
          {allCells.map((cell, idx) => {
            const cellEvents = filteredEvents.filter(e => e.fechaInicio.split('T')[0] === cell.dateString);
            const isToday = cell.dateString === new Date().toISOString().split('T')[0];

            return (
              <div
                key={idx}
                className={`min-h-[70px] border-b border-r border-zinc-850 p-2 flex flex-col gap-1 transition-all ${
                  cell.isCurrentMonth ? 'bg-transparent' : 'bg-zinc-900/10 opacity-40'
                } hover:bg-zinc-900/20`}
              >
                {/* Day number */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday 
                        ? 'bg-sky-500 text-black shadow-md' 
                        : 'text-zinc-400'
                    }`}
                  >
                    {cell.day}
                  </span>
                  
                  {/* Click to add shortcut */}
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setSelectedDate(cell.dateString);
                      setIsModalOpen(true);
                    }}
                    className="opacity-0 hover:opacity-100 p-1 bg-zinc-900 rounded-md text-zinc-500 hover:text-white transition-opacity text-[8px] font-black"
                  >
                    +
                  </button>
                </div>

                {/* Day events list */}
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pt-1">
                  {cellEvents.slice(0, 3).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        setSelectedEvent(e);
                        setSelectedDate(null);
                        setIsModalOpen(true);
                      }}
                      style={{
                        backgroundColor: `${e.colorHex}15`,
                        borderLeft: `3px solid ${e.colorHex}`,
                        color: e.colorHex
                      }}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[8px] font-bold truncate hover:brightness-125 transition-all"
                      title={`${e.titulo} (${e.tipo})`}
                    >
                      {e.titulo}
                    </button>
                  ))}
                  {cellEvents.length > 3 && (
                    <span className="text-[7px] text-zinc-500 font-bold self-end pr-1">
                      +{cellEvents.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        eventToEdit={selectedEvent}
        initialDate={selectedDate}
        agencyMembers={agencyMembers}
        clients={leads}
        projects={projects}
      />
    </div>
  );
};
