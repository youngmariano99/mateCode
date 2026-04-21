using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IKanbanService
    {
        Task<IEnumerable<Ticket>> GetTicketsByProyectoAsync(Guid proyectoId, Guid tenantId);
        Task<Ticket> UpdateTicketStatusAndRankAsync(Guid ticketId, string nuevoEstado, string nuevoRango, Guid tenantId);
        Task<string> GetMagicPromptAsync(Guid ticketId, Guid tenantId);
        Task<Ticket> CreateBugFromTestingAsync(Guid proyectoId, Guid historiaId, string descripcionBug, Guid tenantId);
        
        // Nuevos métodos para Columnas Dinámicas
        Task<IEnumerable<KanbanColumna>> GetColumnsByProyectoAsync(Guid proyectoId, Guid tenantId);
        Task<KanbanColumna> CreateColumnAsync(Guid proyectoId, string nombre, Guid tenantId);
        Task InitializeDefaultColumnsAsync(Guid proyectoId, Guid tenantId);
        Task UpdateColumnsOrderAsync(Guid proyectoId, List<Guid> columnIds, Guid tenantId);
    }
}
