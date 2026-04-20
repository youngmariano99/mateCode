using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using MateCode.Application.Services;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgileController : ControllerBase
    {
        private readonly IAgileService _agileService;

        public AgileController(IAgileService agileService)
        {
            _agileService = agileService;
        }

        public class UpdateBddRequest
        {
            public JsonElement BddCriteria { get; set; }
        }

        [HttpPost("projects/{projectId:guid}/mapa-historias/importar")]
        public async Task<IActionResult> ImportarMapaHistorias(Guid projectId, [FromBody] JsonElement request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");
                
            await _agileService.SaveFullStoryMapAsync(projectId, (Guid)tenantObj, request);
            return Ok(new { Message = "Mapa de Historias importado con éxito." });
        }

        [HttpPut("historias/{historiaId:guid}/bdd")]
        public async Task<IActionResult> UpdateBddCriteria(Guid historiaId, [FromBody] UpdateBddRequest request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            await _agileService.UpdateBddCriteriaAsync(historiaId, (Guid)tenantObj, request.BddCriteria);
            return Ok(new { Message = "Criterios BDD guardados." });
        }
    }
}
