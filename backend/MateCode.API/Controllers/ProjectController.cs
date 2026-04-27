using Microsoft.AspNetCore.Mvc;
using MateCode.Application.Services;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] 
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IPromptEngineService _promptEngine;

        public ProjectController(IProjectService projectService, IPromptEngineService promptEngine)
        {
            _projectService = projectService;
            _promptEngine = promptEngine;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenantHeader = Request.Headers["X-Tenant-Id"].ToString();
            if (!Guid.TryParse(tenantHeader, out Guid tenantId)) return BadRequest("Invalid Tenant");

            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            // Si no hay token (dev mode), usamos el owner del tenant como fallback para no romper nada
            Guid userId;
            if (string.IsNullOrEmpty(userIdStr)) 
            {
                // Fallback para desarrollo sin JWT configurado todavía
                userId = Guid.Empty; 
            }
            else 
            {
                userId = Guid.Parse(userIdStr);
            }

            var projects = await _projectService.GetAllProjectsAsync(tenantId, userId);
            return Ok(projects);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null) return NotFound();
            return Ok(project);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JsonElement body)
        {
            var tenantHeader = Request.Headers["X-Tenant-Id"].ToString();
            if (!Guid.TryParse(tenantHeader, out Guid tenantId)) return BadRequest("Invalid Tenant");

            var name = body.GetProperty("Nombre").GetString() ?? "Nuevo Proyecto";
            Guid? templateId = null;
            if (body.TryGetProperty("PlantillaStackId", out var tId) && tId.ValueKind != JsonValueKind.Null) {
                if (Guid.TryParse(tId.GetString(), out var gId)) templateId = gId;
            }

            var project = await _projectService.CreateProjectAsync(tenantId, name, templateId);
            return Ok(project);
        }

        [HttpPut("{id}/feasibility")]
        public async Task<IActionResult> UpdateFeasibility(Guid id, [FromBody] JsonElement feasibilityData)
        {
            try
            {
                // El TenantId se obtiene del contexto (Auth/RLS)
                // Para este MVP lo extraemos de un header o lo dejamos que el repo lo maneje.
                // Usaremos un Guid placeholder si no hay middleware de extracción de Claims listo, 
                // pero lo ideal es usar el ID del usuario/espacio.
                
                var tenantHeader = Request.Headers["X-Tenant-Id"].ToString();
                if (!Guid.TryParse(tenantHeader, out Guid tenantId))
                {
                    return BadRequest("X-Tenant-Id header is missing or invalid.");
                }

                await _projectService.UpdateProjectFeasibilityAsync(id, tenantId, feasibilityData);
                return Ok(new { message = "ADN del Proyecto consolidado con éxito." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}/context-summary")]
        public async Task<IActionResult> GetContextSummary(Guid id)
        {
            var summary = await _projectService.GetContextSummaryAsync(id);
            if (summary == null) return NotFound();
            return Ok(summary);
        }

        [HttpGet("{id}/master-prompt")]
        public async Task<IActionResult> GetMasterPrompt(Guid id)
        {
            var prompt = await _promptEngine.GenerarMasterPromptAsync(id);
            return Ok(new { prompt });
        }

        [HttpGet("{id}/phase1-prompt")]
        public async Task<IActionResult> GetPhase1Prompt(Guid id)
        {
            var prompt = await _promptEngine.GenerarPromptFase1Async(id);
            return Ok(new { prompt });
        }
    }
}
