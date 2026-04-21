using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Application.Services;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public class KanbanService : IKanbanService
    {
        private readonly AppDbContext _context;

        public KanbanService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByProyectoAsync(Guid proyectoId, Guid tenantId)
        {
            return await _context.Tickets
                .Join(_context.Proyectos,
                    t => t.ProyectoId,
                    p => p.Id,
                    (t, p) => new { t, p })
                .Where(x => x.t.ProyectoId == proyectoId && x.p.TenantId == tenantId)
                .Select(x => x.t)
                .OrderBy(t => t.RangoLexicografico)
                .ToListAsync();
        }

        public async Task<Ticket> UpdateTicketStatusAndRankAsync(Guid ticketId, string nuevoEstado, string nuevoRango, Guid tenantId)
        {
            var ticket = await _context.Tickets
                .Join(_context.Proyectos,
                    t => t.ProyectoId,
                    p => p.Id,
                    (t, p) => new { t, p })
                .Where(x => x.t.Id == ticketId && x.p.TenantId == tenantId)
                .Select(x => x.t)
                .FirstOrDefaultAsync();

            if (ticket == null) throw new UnauthorizedAccessException("Ticket no encontrado o sin permisos.");

            ticket.Estado = nuevoEstado;
            ticket.RangoLexicografico = nuevoRango;
            
            await _context.SaveChangesAsync();
            return ticket;
        }

        public async Task<string> GetMagicPromptAsync(Guid ticketId, Guid tenantId)
        {
            var data = await (from ticket in _context.Tickets
                              join historia in _context.Historias on ticket.HistoriaId equals historia.Id into hGroup
                              from historia in hGroup.DefaultIfEmpty()
                              join proyecto in _context.Proyectos on ticket.ProyectoId equals proyecto.Id
                              where ticket.Id == ticketId && proyecto.TenantId == tenantId
                              select new { ticket, historia, proyecto }).FirstOrDefaultAsync();

            if (data == null) return "Error: No se encontró el contexto del ticket.";

            var sb = new StringBuilder();
            sb.AppendLine("### MATECODE MAGIC PROMPT - FASE 3 (TRINCHERA) ###");
            sb.AppendLine();
            sb.AppendLine($"**TAREAS ACTUAL:** {data.ticket.Titulo}");
            sb.AppendLine($"**TIPO:** {data.ticket.Tipo}");
            sb.AppendLine();
            
            sb.AppendLine("--- CONTEXTO ADN (FASE 0) ---");
            sb.AppendLine(data.proyecto.ContextoJson.GetRawText());
            sb.AppendLine();

            if (data.historia != null)
            {
                sb.AppendLine("--- CRITERIOS BDD (FASE 1) ---");
                sb.AppendLine(data.historia.CriteriosBdd);
                sb.AppendLine();
            }

            sb.AppendLine("--- INSTRUCCIONES PARA LA IA ---");
            sb.AppendLine("Actuá como un experto desarrollador. Analizá el ADN del proyecto y los criterios BDD.");
            sb.AppendLine("Generá el código necesario siguiendo el Stack Tecnológico definido en el contexto.");

            return sb.ToString();
        }

        public async Task<Ticket> CreateBugFromTestingAsync(Guid proyectoId, Guid historiaId, string descripcionBug, Guid tenantId)
        {
            // Validar propiedad del proyecto
            var proyectoData = await _context.Proyectos.AnyAsync(p => p.Id == proyectoId && p.TenantId == tenantId);
            if (!proyectoData) throw new UnauthorizedAccessException();

            var bugTicket = new Ticket
            {
                Id = Guid.NewGuid(),
                ProyectoId = proyectoId,
                HistoriaId = historiaId,
                Tipo = "Bug",
                Titulo = $"QA FAIL: {descripcionBug}",
                Estado = "Pendiente",
                RangoLexicografico = "0" // Forzamos prioridad al inicio
            };

            _context.Tickets.Add(bugTicket);
            await _context.SaveChangesAsync();
            return bugTicket;
        }

        public async Task<IEnumerable<KanbanColumna>> GetColumnsByProyectoAsync(Guid proyectoId, Guid tenantId)
        {
            return await _context.KanbanColumnas
                .Where(c => c.ProyectoId == proyectoId && c.TenantId == tenantId)
                .OrderBy(c => c.OrdenPosicion)
                .ToListAsync();
        }

        public async Task<KanbanColumna> CreateColumnAsync(Guid proyectoId, string nombre, Guid tenantId)
        {
            var maxOrden = await _context.KanbanColumnas
                .Where(c => c.ProyectoId == proyectoId && c.TenantId == tenantId)
                .Select(c => (int?)c.OrdenPosicion)
                .MaxAsync() ?? -1;

            var columna = new KanbanColumna
            {
                Id = Guid.NewGuid(),
                ProyectoId = proyectoId,
                TenantId = tenantId,
                Nombre = nombre,
                OrdenPosicion = maxOrden + 1
            };

            await _context.KanbanColumnas.AddAsync(columna);
            await _context.SaveChangesAsync();
            return columna;
        }

        public async Task InitializeDefaultColumnsAsync(Guid proyectoId, Guid tenantId)
        {
            var defaults = new[] { "Por hacer", "En progreso", "En espera", "Completado" };
            for (int i = 0; i < defaults.Length; i++)
            {
                _context.KanbanColumnas.Add(new KanbanColumna
                {
                    Id = Guid.NewGuid(),
                    ProyectoId = proyectoId,
                    TenantId = tenantId,
                    Nombre = defaults[i],
                    OrdenPosicion = i
                });
            }
            await _context.SaveChangesAsync();
        }

        public async Task UpdateColumnsOrderAsync(Guid proyectoId, List<Guid> columnIds, Guid tenantId)
        {
            var columns = await _context.KanbanColumnas
                .Where(c => c.ProyectoId == proyectoId && c.TenantId == tenantId)
                .ToListAsync();

            foreach (var col in columns)
            {
                int index = columnIds.IndexOf(col.Id);
                if (index != -1)
                {
                    col.OrdenPosicion = index;
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
