using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MateCode.Application.Services;
using System;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class KanbanController : ControllerBase
    {
        private readonly IKanbanService _kanbanService;

        public KanbanController(IKanbanService kanbanService)
        {
            _kanbanService = kanbanService;
        }

        [HttpGet("tickets/{proyectoId:guid}")]
        public async Task<IActionResult> GetTickets(Guid proyectoId)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            var tickets = await _kanbanService.GetTicketsByProyectoAsync(proyectoId, (Guid)tenantObj);
            return Ok(tickets);
        }

        [HttpPut("tickets/{ticketId:guid}/move")]
        public async Task<IActionResult> MoveTicket(Guid ticketId, [FromBody] MoveRequest request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            var ticket = await _kanbanService.UpdateTicketStatusAndRankAsync(ticketId, request.Estado, request.Rango, (Guid)tenantObj);
            return Ok(ticket);
        }

        [HttpGet("tickets/{ticketId:guid}/prompt")]
        public async Task<IActionResult> GetMagicPrompt(Guid ticketId)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            var prompt = await _kanbanService.GetMagicPromptAsync(ticketId, (Guid)tenantObj);
            return Ok(new { prompt });
        }

        [HttpPost("testing/report-bug")]
        public async Task<IActionResult> ReportBug([FromBody] BugReportRequest request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            var bug = await _kanbanService.CreateBugFromTestingAsync(request.ProyectoId, request.HistoriaId, request.Descripcion, (Guid)tenantObj);
            return Ok(bug);
        }
    }

    public class MoveRequest
    {
        public string Estado { get; set; } = string.Empty;
        public string Rango { get; set; } = string.Empty;
    }

    public class BugReportRequest
    {
        public Guid ProyectoId { get; set; }
        public Guid HistoriaId { get; set; }
        public string Descripcion { get; set; } = string.Empty;
    }
}
