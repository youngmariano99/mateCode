using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IColabService
    {
        Task<Decision> CrearDecisionAsync(Guid proyectoId, Guid creadorId, string titulo, string descripcion, string[] etiquetas, Guid? reunionId = null);
        Task<List<Decision>> ObtenerDecisionesAsync(Guid proyectoId);
        Task VotarDecisionAsync(Guid decisionId, Guid usuarioId, bool isUpvote);
        
        Task<Bug> ReportarBugAsync(Guid proyectoId, Guid reportadorId, string titulo, string descripcion, string pasos);
        Task<List<Bug>> ObtenerBugsAsync(Guid proyectoId);
        Task<Guid> ConvertirBugATicketAsync(Guid bugId, Guid? sprintId, Guid tenantId);
        
        Task AsociarTicketABugAsync(Guid bugId, Guid ticketId);
        Task AsociarElementoADecisionAsync(Guid decisionId, string tipo, Guid elementoId, string nombreElemento);

        Task<Guid> IniciarReunionAsync(Guid proyectoId, Guid creadorId, string titulo, string? descripcion);
        Task FinalizarReunionAsync(Guid reunionId, string actaJson);
        Task<List<Reunion>> ObtenerReunionesAsync(Guid proyectoId);
    }
}
