using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IBacklogService
    {
        Task<string> GenerarPromptGroomingAsync(Guid proyectoId);
        Task<string> GenerarPromptTicketUnitarioTemplateAsync(Guid proyectoId);
        Task<IEnumerable<Sprint>> ObtenerSprintsAsync(Guid proyectoId);
        Task<IEnumerable<Ticket>> BulkImportTicketsAsync(Guid proyectoId, JsonElement payload);
        Task<Sprint> IniciarSprintAsync(Guid proyectoId, string nombre, string objetivo, int duracionDias, List<Guid> ticketIds, DateTime? fechaInicio = null);
        Task<Sprint> UpdateSprintAsync(Guid sprintId, Sprint sprintUpdate);
        Task SoftDeleteSprintAsync(Guid sprintId);
        Task<MetricaSprint> FinalizarSprintAsync(Guid sprintId, List<Guid> ticketsAlBacklog, List<Guid> ticketsDescartados);
        Task<string> ExportarEstadoTicketsAsync(Guid proyectoId);
        Task<IEnumerable<object>> ObtenerHistorialSprintsAsync(Guid proyectoId);
    }
}
