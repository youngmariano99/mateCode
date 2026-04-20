using Microsoft.AspNetCore.Mvc;
using MateCode.Application.Services;
using System;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaultController : ControllerBase
    {
        private readonly IVaultService _vaultService;

        public VaultController(IVaultService vaultService)
        {
            _vaultService = vaultService;
        }

        [HttpGet("templates")]
        public async Task<IActionResult> GetTemplates()
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;
            var templates = await _vaultService.GetTemplatesAsync(tenantId);
            return Ok(templates);
        }

        [HttpDelete("templates/{id:guid}")]
        public async Task<IActionResult> DeleteTemplate(Guid id)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;
            var result = await _vaultService.DeleteTemplateAsync(id, tenantId);

            if (result) return Ok(new { Message = "Plantilla eliminada de la Bóveda." });
            return NotFound("La plantilla no existe o no pertenece a este espacio.");
        }
    }
}
