using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IFormLibraryService
    {
        Task<IEnumerable<FormularioPlantilla>> GetFormsAsync(Guid tenantId, Guid userId, string? tipo = null);
        Task<FormularioPlantilla> GetFormByIdAsync(Guid id, Guid tenantId, Guid userId);
        Task<FormularioPlantilla> CreateFormAsync(FormularioPlantilla form);
        Task UpdateFormAsync(FormularioPlantilla form);
        Task DeleteFormAsync(Guid id, Guid tenantId, Guid userId);
    }
}
