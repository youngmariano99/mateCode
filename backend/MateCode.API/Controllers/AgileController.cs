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
            var tenantHeader = Request.Headers["X-Tenant-Id"].ToString();
            if (!Guid.TryParse(tenantHeader, out Guid tenantId)) return BadRequest("Invalid Tenant");
                
            await _agileService.SaveFullStoryMapAsync(projectId, tenantId, request);
            return Ok(new { Message = "Mapa de Historias importado con éxito." });
        }

        [HttpGet("projects/{projectId:guid}/mapa-historias")]
        public async Task<IActionResult> GetMapaHistorias(Guid projectId)
        {
            try {
                var data = await _agileService.GetFullStoryMapAsync(projectId);
                return Ok(data);
            } catch (Exception ex) {
                return StatusCode(500, new { message = ex.Message, stack = ex.StackTrace });
            }
        }

        [HttpPost("projects/{projectId:guid}/sincronizar-backlog")]
        public async Task<IActionResult> SyncBacklog(Guid projectId, [FromQuery] bool cleanSync = false)
        {
            var tenantHeader = Request.Headers["X-Tenant-Id"].ToString();
            if (!Guid.TryParse(tenantHeader, out Guid tenantId)) return BadRequest("Invalid Tenant");

            var created = await _agileService.SyncBacklogAsync(projectId, tenantId, cleanSync);
            return Ok(new { Message = $"Backlog sincronizado. Se crearon {created} tickets nuevos.", count = created });
        }

        [HttpPut("historias/{historiaId:guid}/bdd")]
        public async Task<IActionResult> UpdateBddCriteria(Guid historiaId, [FromBody] UpdateBddRequest request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            await _agileService.UpdateBddCriteriaAsync(historiaId, (Guid)tenantObj, request.BddCriteria);
            return Ok(new { Message = "Criterios BDD guardados." });
        }

        [HttpGet("projects/{projectId:guid}/stories")]
        public async Task<IActionResult> GetStories(Guid projectId)
        {
            var stories = await _agileService.GetStoriesByProjectAsync(projectId);
            return Ok(stories);
        }
    }
}
