using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public partial class AgencyService
    {
        public async Task<IEnumerable<EventoCalendario>> GetCalendarEventsAsync(Guid agencyId)
        {
            return await _context.EventosCalendario
                .Include(e => e.Cliente)
                .Include(e => e.Proyecto)
                .Include(e => e.UsuarioResponsable)
                .Where(e => e.AgenciaId == agencyId)
                .OrderBy(e => e.FechaInicio)
                .ToListAsync();
        }

        public async Task<EventoCalendario> CreateCalendarEventAsync(
            Guid agencyId, 
            string titulo, 
            string? descripcion, 
            DateTime fechaInicio, 
            DateTime fechaFin, 
            string tipo, 
            string? colorHex, 
            Guid? usuarioResponsableId, 
            Guid? clienteId, 
            Guid? proyectoId)
        {
            var ev = new EventoCalendario
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                Titulo = titulo,
                Descripcion = descripcion,
                FechaInicio = DateTime.SpecifyKind(fechaInicio, DateTimeKind.Utc),
                FechaFin = DateTime.SpecifyKind(fechaFin, DateTimeKind.Utc),
                Tipo = tipo,
                ColorHex = colorHex ?? "#3b82f6",
                UsuarioResponsableId = usuarioResponsableId,
                ClienteId = clienteId,
                ProyectoId = proyectoId,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.EventosCalendario.AddAsync(ev);
            await _context.SaveChangesAsync();

            // Cargar datos de navegación para respuesta completa
            if (ev.ClienteId.HasValue)
                await _context.Entry(ev).Reference(e => e.Cliente).LoadAsync();
            if (ev.ProyectoId.HasValue)
                await _context.Entry(ev).Reference(e => e.Proyecto).LoadAsync();
            if (ev.UsuarioResponsableId.HasValue)
                await _context.Entry(ev).Reference(e => e.UsuarioResponsable).LoadAsync();

            return ev;
        }

        public async Task<bool> UpdateCalendarEventAsync(
            Guid eventId, 
            string titulo, 
            string? descripcion, 
            DateTime fechaInicio, 
            DateTime fechaFin, 
            string tipo, 
            string? colorHex, 
            Guid? usuarioResponsableId, 
            Guid? clienteId, 
            Guid? proyectoId)
        {
            var ev = await _context.EventosCalendario.FindAsync(eventId);
            if (ev == null) return false;

            ev.Titulo = titulo;
            ev.Descripcion = descripcion;
            ev.FechaInicio = DateTime.SpecifyKind(fechaInicio, DateTimeKind.Utc);
            ev.FechaFin = DateTime.SpecifyKind(fechaFin, DateTimeKind.Utc);
            ev.Tipo = tipo;
            ev.ColorHex = colorHex ?? "#3b82f6";
            ev.UsuarioResponsableId = usuarioResponsableId;
            ev.ClienteId = clienteId;
            ev.ProyectoId = proyectoId;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteCalendarEventAsync(Guid eventId)
        {
            var ev = await _context.EventosCalendario.FindAsync(eventId);
            if (ev == null) return false;

            _context.EventosCalendario.Remove(ev);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
