using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MateCode.Application.Services;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DesignController : ControllerBase
    {
        private readonly IPromptEngineService _promptEngine;
        private readonly IProjectService _projectService;
        private readonly IAgileService _agileService;

        private readonly IPromptLibraryService _promptLibrary;

        public DesignController(
            IPromptEngineService promptEngine, 
            IProjectService projectService, 
            IAgileService agileService,
            IPromptLibraryService promptLibrary)
        {
            _promptEngine = promptEngine;
            _projectService = projectService;
            _agileService = agileService;
            _promptLibrary = promptLibrary;
        }

        public class DesignGenerateRequest
        {
            public string Prompt { get; set; } = string.Empty;
            public string TipoDiagrama { get; set; } = "ERD";
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] DesignGenerateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
                return BadRequest("El prompt no puede estar vacío.");

            // Llamada al motor de IA (Mantenemos por si el usuario quiere probar, pero el foco es el prompt)
            var generatedCode = await _promptEngine.GenerateDesignCodeAsync(request.Prompt, request.TipoDiagrama);

            return Ok(new { code = generatedCode });
        }

        [HttpGet("project/{projectId:guid}/prompt")]
        public async Task<IActionResult> GetPrompt(Guid projectId, [FromQuery] string tipo, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            // 1. Buscar plantillas de Fase 2
            var templates = await _promptLibrary.GetTemplatesAsync(tenantId, "Fase 2");
            
            // 2. Mapeo inteligente (Buscamos coincidencias en título o etiquetas)
            var template = templates.FirstOrDefault(t => 
                t.Titulo.Contains(tipo, StringComparison.OrdinalIgnoreCase) || 
                t.EtiquetasJson.Contains(tipo, StringComparison.OrdinalIgnoreCase));

            // 3. Fallback al prompt maestro del motor si no hay plantillas específicas
            if (template == null)
            {
                var project = await _projectService.GetProjectByIdAsync(projectId);
                var stories = await _agileService.GetStoriesByProjectAsync(projectId);
                var genericPrompt = await _promptEngine.GetMasterDesignPromptAsync(project, stories, tipo);
                return Ok(new { prompt = genericPrompt, isGeneric = true });
            }

            // 4. Generar usando el nuevo motor dinámico
            var dynamicPrompt = await _promptEngine.GenerarPromptContextual(template.Id, projectId, null, tenantId);
            return Ok(new { prompt = dynamicPrompt, isGeneric = false });
        }
    }
}
