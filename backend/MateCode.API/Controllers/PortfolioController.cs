using Microsoft.AspNetCore.Mvc;
using MateCode.Application.Services;
using System;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PortfolioController : ControllerBase
    {
        private readonly IPortfolioService _portfolioService;

        public PortfolioController(IPortfolioService portfolioService)
        {
            _portfolioService = portfolioService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPortfolio()
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;
            var projects = await _portfolioService.GetCompletedProjectsAsync(tenantId);
            return Ok(projects);
        }

        public class ExpressImportRequest 
        { 
            public string Nombre { get; set; } = string.Empty; 
            public string Stack { get; set; } = string.Empty;
        }

        [HttpPost("express")]
        public async Task<IActionResult> ExpressImport([FromBody] ExpressImportRequest request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;
            var id = await _portfolioService.CreateExpressImportAsync(tenantId, request.Nombre, request.Stack);
            
            return Ok(new { ProjectId = id, Message = "Importación Express completada con éxito." });
        }
    }
}
