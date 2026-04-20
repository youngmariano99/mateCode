using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IFinanceService
    {
        Task<IEnumerable<PerfilEmpresa>> GetPerfilesAsync(Guid tenantId);
        Task<Presupuesto> CreatePresupuestoAsync(Presupuesto presupuesto, Guid tenantId);
        Task<Presupuesto?> GetPresupuestoByProyectoAsync(Guid proyectoId, Guid tenantId);
    }
}
