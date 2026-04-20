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
    }
}
