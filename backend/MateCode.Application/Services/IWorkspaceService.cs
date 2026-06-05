using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IWorkspaceService
    {
        Task<IEnumerable<EspacioTrabajo>> GetWorkspacesByUserAsync(Guid userId);
        Task<EspacioTrabajo> CreateWorkspaceAsync(Guid ownerId, string name, Guid? agencyId = null);
        Task SyncUserAsync(Guid userId, string email, string nombreCompleto, string nombreUsuario);
        Task<IEnumerable<object>> GetPendingInvitationsAsync(Guid userId);
        Task<bool> AcceptInvitationAsync(Guid userId, Guid workspaceId);
        Task<bool> RejectInvitationAsync(Guid userId, Guid workspaceId);
    }
}
