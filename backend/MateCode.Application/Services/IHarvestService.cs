using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public interface IHarvestService
    {
        Task<Guid> ExportToVaultAsync(Guid projectId, Guid tenantId, JsonElement projectPayload);
    }
}
