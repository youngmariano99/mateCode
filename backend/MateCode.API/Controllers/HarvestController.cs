using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using MateCode.Application.Services;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HarvestController : ControllerBase
    {
        private readonly IHarvestService _harvestService;

        public HarvestController(IHarvestService harvestService)
        {
            _harvestService = harvestService;
        }

        public class ExportRequest
        {
            public JsonElement SourcePayload { get; set; }
        }

        [HttpPost("projects/{projectId:guid}/export")]
        public async Task<IActionResult> ExportProject(Guid projectId, [FromBody] ExportRequest request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var vaultId = await _harvestService.ExportToVaultAsync(projectId, (Guid)tenantObj, request.SourcePayload);

            return Ok(new { 
               VaultId = vaultId, 
               Message = "¡Cosecha exitosa! 🌾 El proyecto es ahora un activo limpio y sanitizado en tu Bóveda." 
            });
        }
    }
}
