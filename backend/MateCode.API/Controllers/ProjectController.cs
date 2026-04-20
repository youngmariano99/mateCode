using Microsoft.AspNetCore.Mvc;
using MateCode.Application.Services;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // Temporalmente desactivado hasta configurar JWT Secret en appsettings.json
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenantHeader = Request.Headers["X-Tenant-Id"].ToString();
            if (!Guid.TryParse(tenantHeader, out Guid tenantId)) return BadRequest("Invalid Tenant");

            var projects = await _projectService.GetAllProjectsAsync(tenantId);
            return Ok(projects);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JsonElement body)
        {
            var tenantHeader = Request.Headers["X-Tenant-Id"].ToString();
            if (!Guid.TryParse(tenantHeader, out Guid tenantId)) return BadRequest("Invalid Tenant");

            var name = body.GetProperty("Nombre").GetString() ?? "Nuevo Proyecto";
            var project = await _projectService.CreateProjectAsync(tenantId, name);
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
    }
}
