using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public interface IAgileService
    {
        Task SaveFullStoryMapAsync(Guid projectId, Guid tenantId, JsonElement storyMapData);
        Task UpdateBddCriteriaAsync(Guid storyId, Guid tenantId, JsonElement bddCriteria);
    }
}
