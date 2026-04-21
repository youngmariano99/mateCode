using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IVaultService
    {
        Task<IEnumerable<PlantillaStack>> GetTemplatesAsync(Guid tenantId);
        Task<bool> DeleteTemplateAsync(Guid id, Guid tenantId);
        Task<Guid> SaveStackToVaultAsync(Guid tenantId, string nombre, JsonElement tecnologiasIdsJson);
    }
}
