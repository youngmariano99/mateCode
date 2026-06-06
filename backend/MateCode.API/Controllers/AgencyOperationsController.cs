using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MateCode.Application.Services;
using System;
using System.Threading.Tasks;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AgencyOperationsController : ControllerBase
    {
        private readonly IAgencyService _agencyService;

        public AgencyOperationsController(IAgencyService agencyService)
        {
            _agencyService = agencyService;
        }

        private Guid GetAgencyId()
        {
            var agencyHeader = Request.Headers["X-Agency-Id"].ToString();
            if (string.IsNullOrEmpty(agencyHeader) || !Guid.TryParse(agencyHeader, out var agencyId))
                throw new ArgumentException("X-Agency-Id header es requerido e inválido.");
            return agencyId;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) throw new UnauthorizedAccessException("Usuario no identificado.");
            return Guid.Parse(userIdStr);
        }

        // ====================================================================================
        // RECURSOS COMPARTIDOS (VAULT)
        // ====================================================================================
        [HttpGet("resources")]
        public async Task<IActionResult> GetResources()
        {
            try {
                var agencyId = GetAgencyId();
                var resources = await _agencyService.GetResourcesAsync(agencyId);
                return Ok(resources);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateResourceRequest
        {
            [JsonPropertyName("titulo")]
            public string Titulo { get; set; } = string.Empty;

            [JsonPropertyName("contenido")]
            public string Contenido { get; set; } = string.Empty;

            [JsonPropertyName("tipo")]
            public string Tipo { get; set; } = "prompt";

            [JsonPropertyName("etiquetas")]
            public JsonElement Etiquetas { get; set; }

            [JsonPropertyName("roles_permitidos")]
            public JsonElement RolesPermitidos { get; set; }

            [JsonPropertyName("categoria")]
            public string Categoria { get; set; } = "General";

            [JsonPropertyName("favorito")]
            public bool Favorito { get; set; } = false;

            [JsonPropertyName("cliente_id")]
            public Guid? ClienteId { get; set; }
        }

        [HttpPost("resources")]
        public async Task<IActionResult> CreateResource([FromBody] CreateResourceRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var userId = GetUserId();
                var resource = await _agencyService.CreateResourceAsync(
                    agencyId, userId, req.Titulo, req.Contenido, req.Tipo, req.Etiquetas, req.RolesPermitidos, req.Categoria, req.ClienteId);
                return Ok(resource);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("resources/{id}")]
        public async Task<IActionResult> UpdateResource(Guid id, [FromBody] CreateResourceRequest req)
        {
            try {
                var success = await _agencyService.UpdateResourceAsync(
                    id, req.Titulo, req.Contenido, req.Tipo, req.Etiquetas, req.RolesPermitidos, req.Categoria, req.Favorito, req.ClienteId);
                return success ? Ok() : NotFound("Recurso no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("resources/{id}/favorite")]
        public async Task<IActionResult> ToggleResourceFavorite(Guid id, [FromBody] ToggleFavoriteRequest req)
        {
            try {
                var success = await _agencyService.ToggleResourceFavoriteAsync(id, req.Favorito);
                return success ? Ok() : NotFound("Recurso no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("resources/{id}")]
        public async Task<IActionResult> DeleteResource(Guid id)
        {
            try {
                var success = await _agencyService.DeleteResourceAsync(id);
                return success ? Ok() : NotFound("Recurso no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class ToggleFavoriteRequest
        {
            public bool Favorito { get; set; }
        }

        // ====================================================================================
        // TAREAS OPERATIVAS (EXTRA-DESARROLLO)
        // ====================================================================================
        [HttpGet("tasks")]
        public async Task<IActionResult> GetTasks()
        {
            try {
                var agencyId = GetAgencyId();
                var tasks = await _agencyService.GetTasksAsync(agencyId);
                return Ok(tasks);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateTaskRequest
        {
            public string Titulo { get; set; } = string.Empty;
            public string Descripcion { get; set; } = string.Empty;
            public string Estado { get; set; } = "Todo";
            public DateTime? FechaPlanificada { get; set; }
            public Guid? UsuarioAsignadoId { get; set; }
            public Guid? EspacioTrabajoId { get; set; }
            public Guid? ProyectoId { get; set; }
            public Guid? RecursoId { get; set; }
        }

        [HttpPost("tasks")]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var task = await _agencyService.CreateTaskAsync(
                    agencyId, req.Titulo, req.Descripcion, req.Estado, req.FechaPlanificada, req.UsuarioAsignadoId, req.EspacioTrabajoId, req.ProyectoId, req.RecursoId);
                return Ok(task);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdateTaskStatusRequest
        {
            public string Estado { get; set; } = string.Empty;
            public string Posicion { get; set; } = "a";
        }

        [HttpPut("tasks/status/{id}")]
        public async Task<IActionResult> UpdateTaskStatus(Guid id, [FromBody] UpdateTaskStatusRequest req)
        {
            try {
                var success = await _agencyService.UpdateTaskStatusAsync(id, req.Estado, req.Posicion);
                return success ? Ok() : NotFound("Tarea no encontrada.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("tasks/{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, [FromBody] CreateTaskRequest req)
        {
            try {
                var success = await _agencyService.UpdateTaskAsync(
                    id, req.Titulo, req.Descripcion, req.Estado, req.FechaPlanificada, req.UsuarioAsignadoId, req.EspacioTrabajoId, req.ProyectoId, req.RecursoId);
                return success ? Ok() : NotFound("Tarea no encontrada.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("tasks/{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            try {
                var success = await _agencyService.DeleteTaskAsync(id);
                return success ? Ok() : NotFound("Tarea no encontrada.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        // ====================================================================================
        // PLANIFICADOR DE CONTENIDOS
        // ====================================================================================
        [HttpGet("contents")]
        public async Task<IActionResult> GetContents()
        {
            try {
                var agencyId = GetAgencyId();
                var contents = await _agencyService.GetContentsAsync(agencyId);
                return Ok(contents);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateContentRequest
        {
            public Guid MiembroId { get; set; }
            public string Titulo { get; set; } = string.Empty;
            public JsonElement Plataformas { get; set; }
            public string GuionPlantilla { get; set; } = string.Empty;
            public string Dialogo { get; set; } = string.Empty;
            public string ProcedimientoEstandar { get; set; } = string.Empty;
            public string Estado { get; set; } = "Idea";
            public string NotasMejora { get; set; } = string.Empty;
            public DateTime? FechaPublicacion { get; set; }
        }

        [HttpPost("contents")]
        public async Task<IActionResult> CreateContent([FromBody] CreateContentRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var content = await _agencyService.CreateContentAsync(
                    agencyId, req.MiembroId, req.Titulo, req.Plataformas, req.GuionPlantilla, req.Dialogo, req.ProcedimientoEstandar, req.Estado, req.NotasMejora, req.FechaPublicacion);
                return Ok(content);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdateContentRequest
        {
            public string Titulo { get; set; } = string.Empty;
            public JsonElement Plataformas { get; set; }
            public string GuionPlantilla { get; set; } = string.Empty;
            public string Dialogo { get; set; } = string.Empty;
            public string ProcedimientoEstandar { get; set; } = string.Empty;
            public string Estado { get; set; } = "Idea";
            public string NotasMejora { get; set; } = string.Empty;
            public JsonElement ResumenAnalitico { get; set; }
            public DateTime? FechaPublicacion { get; set; }
        }

        [HttpPut("contents/{id}")]
        public async Task<IActionResult> UpdateContent(Guid id, [FromBody] UpdateContentRequest req)
        {
            try {
                var success = await _agencyService.UpdateContentAsync(
                    id, req.Titulo, req.Plataformas, req.GuionPlantilla, req.Dialogo, req.ProcedimientoEstandar, req.Estado, req.NotasMejora, req.ResumenAnalitico, req.FechaPublicacion);
                return success ? Ok() : NotFound("Contenido no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("contents/{id}")]
        public async Task<IActionResult> DeleteContent(Guid id)
        {
            try {
                var success = await _agencyService.DeleteContentAsync(id);
                return success ? Ok() : NotFound("Contenido no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
