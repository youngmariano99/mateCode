using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface ITeamService
    {
        Task<IEnumerable<object>> GetTeamMembersAsync(Guid tenantId);
        Task<bool> InviteMemberAsync(Guid tenantId, string email);
        Task<IEnumerable<object>> SearchUsersAsync(string query);
        Task<bool> AddMemberToWorkspaceAsync(Guid tenantId, Guid userId, string roleTag);
        Task UpdateMemberAccessAsync(Guid tenantId, Guid userId, string roleTag, List<Guid> projectIds);
    }
}
