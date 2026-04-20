using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public interface IPortfolioService
    {
        Task<IEnumerable<object>> GetCompletedProjectsAsync(Guid tenantId);
        Task<Guid> CreateExpressImportAsync(Guid tenantId, string projectName, string stack);
    }
}
