using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface ICrmService
    {
        Task<Guid> CreateLeadAsync(Guid tenantId, string sourceUrl, JsonElement rawData);
        Task<Guid> ApproveLeadAsync(Guid leadId, Guid tenantId);
        Task<IEnumerable<Cliente>> GetLeadsAsync(Guid tenantId);
        Task<IEnumerable<Cliente>> GetClientsAsync(Guid tenantId);
    }
}
