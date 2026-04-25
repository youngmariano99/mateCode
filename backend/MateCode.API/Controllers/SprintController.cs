using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MateCode.Application.Services;
using MateCode.Core.Entities;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/projects/{proyectoId}/sprints")]
    public class SprintController : ControllerBase
    {
        private readonly IBacklogService _backlogService;

        public SprintController(IBacklogService backlogService)
        {
            _backlogService = backlogService;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerSprints(Guid proyectoId)
        {
            try
            {
                var sprints = await _backlogService.ObtenerSprintsAsync(proyectoId);
                return Ok(sprints);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpGet("grooming-prompt")]
        public async Task<IActionResult> GenerarPromptGrooming(Guid proyectoId)
        {
            try
            {
                var prompt = await _backlogService.GenerarPromptGroomingAsync(proyectoId);
                return Ok(new { prompt });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpGet("exportar-estado")]
        public async Task<IActionResult> ExportarEstadoTickets(Guid proyectoId)
        {
            try
            {
                var export = await _backlogService.ExportarEstadoTicketsAsync(proyectoId);
                return Ok(new { export });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpPost("bulk-import")]
        public async Task<IActionResult> BulkImportTickets(Guid proyectoId, [FromBody] JsonElement payload)
        {
            try
            {
                var tickets = await _backlogService.BulkImportTicketsAsync(proyectoId, payload);
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        public class IniciarSprintRequest
        {
            public string Nombre { get; set; } = string.Empty;
            public string Objetivo { get; set; } = string.Empty;
            public int DuracionDias { get; set; }
            public List<Guid> TicketIds { get; set; } = new();
        }

        [HttpPost("start")]
        public async Task<IActionResult> IniciarSprint(Guid proyectoId, [FromBody] IniciarSprintRequest request)
        {
            try
            {
                var sprint = await _backlogService.IniciarSprintAsync(proyectoId, request.Nombre, request.Objetivo, request.DuracionDias, request.TicketIds);
                return Ok(sprint);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        public class FinalizarSprintRequest
        {
            public List<Guid> TicketsAlBacklog { get; set; } = new();
            public List<Guid> TicketsDescartados { get; set; } = new();
        }

        [HttpPost("{sprintId}/close")]
        public async Task<IActionResult> FinalizarSprint(Guid proyectoId, Guid sprintId, [FromBody] FinalizarSprintRequest request)
        {
            try
            {
                var metrica = await _backlogService.FinalizarSprintAsync(sprintId, request.TicketsAlBacklog, request.TicketsDescartados);
                return Ok(metrica);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }
    }
}
