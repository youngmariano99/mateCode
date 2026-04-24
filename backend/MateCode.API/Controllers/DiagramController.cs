using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MateCode.Application.Services;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagramController : ControllerBase
    {
        private readonly IDatabaseSyncService _dbSyncService;
        private readonly IPromptEngineService _promptEngine;
        private readonly IProjectService _projectService;
        private readonly IAgileService _agileService;
        private readonly IPromptLibraryService _promptLibrary;

        public DiagramController(
            IDatabaseSyncService dbSyncService, 
            IPromptEngineService promptEngine,
            IProjectService projectService,
            IAgileService agileService,
            IPromptLibraryService promptLibrary)
        {
            _dbSyncService = dbSyncService;
            _promptEngine = promptEngine;
            _projectService = projectService;
            _agileService = agileService;
            _promptLibrary = promptLibrary;
        }

        [HttpGet("project/{projectId:guid}")]
        public async Task<IActionResult> GetDiagrams(Guid projectId)
        {
            var diagrams = await _projectService.GetDiagramsByProjectAsync(projectId);
            return Ok(diagrams);
        }

        [HttpPut("project/{projectId:guid}/{tipo}")]
        public async Task<IActionResult> SaveDiagram(Guid projectId, string tipo, [FromBody] DiagramSaveRequest req)
        {
            await _projectService.SaveDiagramAsync(projectId, tipo, req.Codigo);
            return Ok(new { Message = "Diagrama guardado exitosamente." });
        }

        [HttpGet("project/{projectId:guid}/prompt")]
        public async Task<IActionResult> GetPrompt(Guid projectId, [FromQuery] string tipo, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            var templates = await _promptLibrary.GetTemplatesAsync(tenantId, "Fase 2");
            var template = templates.FirstOrDefault(t => 
                t.Titulo.Contains(tipo, StringComparison.OrdinalIgnoreCase) || 
                t.EtiquetasJson.Contains(tipo, StringComparison.OrdinalIgnoreCase));

            if (template == null)
            {
                var project = await _projectService.GetProjectByIdAsync(projectId);
                var stories = await _agileService.GetStoriesByProjectAsync(projectId);
                var genericPrompt = await _promptEngine.GetMasterDesignPromptAsync(project, stories, tipo);
                return Ok(new { prompt = genericPrompt, isGeneric = true });
            }

            var dynamicPrompt = await _promptEngine.GenerarPromptContextual(template.Id, projectId, null, tenantId);
            return Ok(new { prompt = dynamicPrompt, isGeneric = false });
        }

        [HttpPost("project/{projectId:guid}/sync-external-db")]
        public async Task<IActionResult> SyncExternalDb(Guid projectId, [FromBody] SyncRequest request)
        {
            if (string.IsNullOrEmpty(request.ConnectionString))
                return BadRequest("Connection string is required.");

            var dbml = await _dbSyncService.GetDbmlFromPostgresAsync(request.ConnectionString);
            
            if (dbml.StartsWith("// Error"))
                return BadRequest(new { Message = dbml });

            await _projectService.SaveDiagramAsync(projectId, "ERD", dbml);
            
            return Ok(new { 
                Message = "Esquema sincronizado exitosamente desde base de datos externa.",
                dbml 
            });
        }

        public class DiagramSaveRequest { public string Codigo { get; set; } = string.Empty; }
        public class SyncRequest { public string ConnectionString { get; set; } = string.Empty; }
    }
}
