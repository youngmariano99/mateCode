using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Security.Claims;
using MateCode.Application.Services;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/colab")]
    public class ColabController : ControllerBase
    {
        private readonly IColabService _colabService;

        public ColabController(IColabService colabService)
        {
            _colabService = colabService;
        }

        [HttpPost("decisions")]
        public async Task<IActionResult> CreateDecision([FromBody] DecisionRequest req)
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = Guid.Parse(userIdStr);

            var decision = await _colabService.CrearDecisionAsync(req.ProyectoId, userId, req.Titulo, req.Descripcion, req.Etiquetas);
            return Ok(decision);
        }

        [HttpGet("decisions/{proyectoId:guid}")]
        public async Task<IActionResult> GetDecisions(Guid proyectoId)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            var decisions = await _colabService.ObtenerDecisionesAsync(proyectoId);
            return Ok(decisions);
        }

        [HttpPost("decisions/{id:guid}/vote")]
        public async Task<IActionResult> VoteDecision(Guid id, [FromBody] VoteRequest req)
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = Guid.Parse(userIdStr);

            await _colabService.VotarDecisionAsync(id, userId, req.EsUpvote);
            return Ok();
        }

        [HttpPost("bugs")]
        public async Task<IActionResult> ReportBug([FromBody] BugRequest req)
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = Guid.Parse(userIdStr);

            var bug = await _colabService.ReportarBugAsync(req.ProyectoId, userId, req.Titulo, req.Descripcion, req.PasosReproduccion);
            return Ok(bug);
        }

        [HttpGet("bugs/{proyectoId:guid}")]
        public async Task<IActionResult> GetBugs(Guid proyectoId)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            var bugs = await _colabService.ObtenerBugsAsync(proyectoId);
            return Ok(bugs);
        }

        [HttpPut("bugs/{id:guid}/associate")]
        public async Task<IActionResult> AssociateBug(Guid id, [FromBody] AssociateBugRequest req)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            await _colabService.AsociarTicketABugAsync(id, req.TicketId);
            return Ok();
        }

        [HttpPut("decisions/{id:guid}/associate")]
        public async Task<IActionResult> AssociateDecision(Guid id, [FromBody] AssociateDecisionRequest req)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            await _colabService.AsociarElementoADecisionAsync(id, req.Tipo, req.ElementoId, req.Nombre);
            return Ok();
        }

        [HttpPost("bugs/{id:guid}/convert")]
        public async Task<IActionResult> ConvertBug(Guid id, [FromBody] ConvertBugRequest req)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            var ticketId = await _colabService.ConvertirBugATicketAsync(id, req.SprintId, (Guid)tenantObj);
            return Ok(new { TicketId = ticketId });
        }
    }

    public class DecisionRequest { public Guid ProyectoId { get; set; } public string Titulo { get; set; } public string Descripcion { get; set; } public string[] Etiquetas { get; set; } }
    public class VoteRequest { public bool EsUpvote { get; set; } }
    public class BugRequest { public Guid ProyectoId { get; set; } public string Titulo { get; set; } public string Descripcion { get; set; } public string PasosReproduccion { get; set; } }
    public class ConvertBugRequest { public Guid? SprintId { get; set; } }
    public class AssociateBugRequest { public Guid TicketId { get; set; } }
    public class AssociateDecisionRequest { public string Tipo { get; set; } public Guid ElementoId { get; set; } public string Nombre { get; set; } }
}
