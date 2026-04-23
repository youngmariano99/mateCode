using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public interface IAgileService
    {
        Task SaveFullStoryMapAsync(Guid projectId, Guid tenantId, JsonElement storyMapData);
        Task UpdateBddCriteriaAsync(Guid storyId, Guid tenantId, JsonElement bddCriteria);
        Task<IEnumerable<MateCode.Core.Entities.Historia>> GetStoriesByProjectAsync(Guid projectId);
        Task<IEnumerable<MateCode.Core.Entities.Ticket>> GetTicketsByProjectAsync(Guid projectId);
        Task<object> GetFullStoryMapAsync(Guid projectId);
        Task<int> SyncBacklogAsync(Guid projectId, Guid tenantId, bool cleanSync);
    }
}
