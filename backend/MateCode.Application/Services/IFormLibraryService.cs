using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IFormLibraryService
    {
        Task<IEnumerable<FormularioPlantilla>> GetFormsAsync(Guid tenantId, string? tipo = null);
        Task<FormularioPlantilla> GetFormByIdAsync(Guid id, Guid tenantId);
        Task<FormularioPlantilla> CreateFormAsync(FormularioPlantilla form);
        Task UpdateFormAsync(FormularioPlantilla form);
    }
}
