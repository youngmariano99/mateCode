using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public partial class AgencyService
    {
        // --- COLUMNAS KANBAN DINÁMICAS ---
        public async Task<IEnumerable<KanbanColumnaOperativa>> GetKanbanColumnsAsync(Guid agencyId)
        {
            return await _context.KanbanColumnasOperativas
                .Where(c => c.AgenciaId == agencyId)
                .OrderBy(c => c.Orden)
                .ToListAsync();
        }

        public async Task<KanbanColumnaOperativa> CreateKanbanColumnAsync(Guid agencyId, string nombre, int orden)
        {
            var column = new KanbanColumnaOperativa
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                Nombre = nombre,
                Orden = orden,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.KanbanColumnasOperativas.AddAsync(column);
            await _context.SaveChangesAsync();
            return column;
        }

        public async Task<bool> UpdateKanbanColumnsOrderAsync(Guid agencyId, IEnumerable<KeyValuePair<Guid, int>> columnOrders)
        {
            var columns = await _context.KanbanColumnasOperativas
                .Where(c => c.AgenciaId == agencyId)
                .ToListAsync();

            foreach (var order in columnOrders)
            {
                var col = columns.FirstOrDefault(c => c.Id == order.Key);
                if (col != null)
                {
                    col.Orden = order.Value;
                }
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateKanbanColumnNameAsync(Guid columnId, string nombre)
        {
            var column = await _context.KanbanColumnasOperativas.FindAsync(columnId);
            if (column == null) return false;

            column.Nombre = nombre;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteKanbanColumnAsync(Guid columnId)
        {
            var column = await _context.KanbanColumnasOperativas.FindAsync(columnId);
            if (column == null) return false;

            _context.KanbanColumnasOperativas.Remove(column);
            return await _context.SaveChangesAsync() > 0;
        }

        // --- INFORMES SEMANALES ---
        public async Task<IEnumerable<InformeSemanal>> GetWeeklyReportsAsync(Guid agencyId)
        {
            return await _context.InformesSemanales
                .Where(r => r.AgenciaId == agencyId)
                .OrderByDescending(r => r.FechaInicio)
                .ToListAsync();
        }

        public async Task<InformeSemanal> CreateWeeklyReportAsync(Guid agencyId, DateTime fechaInicio, DateTime fechaFin, string leccionesAprendidas)
        {
            var metricsObj = await GenerateWeeklyMetricsPreviewAsync(agencyId, fechaInicio, fechaFin);
            var metricsJson = JsonSerializer.Serialize(metricsObj);

            var report = new InformeSemanal
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                FechaInicio = DateTime.SpecifyKind(fechaInicio, DateTimeKind.Utc),
                FechaFin = DateTime.SpecifyKind(fechaFin, DateTimeKind.Utc),
                MetricasJson = metricsJson,
                LeccionesAprendidas = leccionesAprendidas,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.InformesSemanales.AddAsync(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<bool> DeleteWeeklyReportAsync(Guid reportId)
        {
            var report = await _context.InformesSemanales.FindAsync(reportId);
            if (report == null) return false;

            _context.InformesSemanales.Remove(report);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<object> GenerateWeeklyMetricsPreviewAsync(Guid agencyId, DateTime fechaInicio, DateTime fechaFin)
        {
            var start = DateTime.SpecifyKind(fechaInicio, DateTimeKind.Utc);
            var end = DateTime.SpecifyKind(fechaFin, DateTimeKind.Utc);

            // 1. Tareas
            var tasks = await _context.TareasOperativas
                .Where(t => t.AgenciaId == agencyId)
                .ToListAsync();

            var tareasCreadas = tasks.Count(t => t.FechaCreacion >= start && t.FechaCreacion <= end);
            var tareasCompletadas = tasks.Count(t => 
                (t.Estado.ToLower() == "done" || t.Estado.ToLower() == "completada" || t.Estado.ToLower() == "completado" || t.Estado.ToLower() == "terminado") &&
                t.FechaCreacion >= start && t.FechaCreacion <= end); // O si se completó en ese rango, simplificado por fecha de creación o planificada en rango
            
            // 2. Contenidos
            var contents = await _context.PlanificadorContenidos
                .Where(c => c.AgenciaId == agencyId)
                .ToListAsync();

            var contenidosPlanificados = contents.Count(c => c.FechaCreacion >= start && c.FechaCreacion <= end);
            var contenidosPublicados = contents.Count(c => 
                c.Estado.ToLower() == "publicado" && 
                c.FechaPublicacion.HasValue && 
                c.FechaPublicacion.Value >= start && 
                c.FechaPublicacion.Value <= end);

            // 3. Finanzas
            var transactions = await _context.TransaccionesAgencia
                .Where(t => t.AgenciaId == agencyId && t.Fecha >= start && t.Fecha <= end)
                .ToListAsync();

            var ingresos = transactions.Where(t => t.Tipo == "ingreso").Sum(t => t.Monto);
            var egresos = transactions.Where(t => t.Tipo == "egreso" || t.Tipo == "costo_fijo" || t.Tipo == "costo_variable").Sum(t => t.Monto);
            var balanceNeto = ingresos - egresos;

            // 4. CRM Leads
            var leads = await _context.Clientes
                .Where(c => c.AgenciaId == agencyId && c.FechaCreacion >= start && c.FechaCreacion <= end)
                .ToListAsync();

            var leadsNuevos = leads.Count;

            return new
            {
                tareasCreadas,
                tareasCompletadas,
                contenidosPlanificados,
                contenidosPublicados,
                ingresos = (double)ingresos,
                egresos = (double)egresos,
                balanceNeto = (double)balanceNeto,
                leadsNuevos
            };
        }
    }
}
