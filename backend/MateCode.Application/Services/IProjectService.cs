using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<MateCode.Core.Entities.Proyecto>> GetAllProjectsAsync(Guid tenantId);
        Task<MateCode.Core.Entities.Proyecto> CreateProjectAsync(Guid tenantId, string name);
        Task UpdateProjectFeasibilityAsync(Guid projectId, Guid tenantId, JsonElement feasibilityData);
    }
}
