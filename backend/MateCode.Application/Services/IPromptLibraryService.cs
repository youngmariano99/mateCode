using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IPromptLibraryService
    {
        Task<IEnumerable<PlantillaPrompt>> GetTemplatesAsync(Guid tenantId, string? fase = null);
        Task<PlantillaPrompt> CreateTemplateAsync(PlantillaPrompt template);
        Task UpdateTemplateAsync(PlantillaPrompt template);
        Task DeleteTemplateAsync(Guid id, Guid tenantId);
        Task<PlantillaPrompt> GetTemplateByIdAsync(Guid id, Guid tenantId);
    }
}
