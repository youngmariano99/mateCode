using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MateCode.Application.Services;
using System;
using System.Threading.Tasks;
using System.Security.Claims;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GoalsController : ControllerBase
    {
        private readonly IAgencyService _agencyService;

        public GoalsController(IAgencyService agencyService)
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

        [HttpGet]
        public async Task<IActionResult> GetGoals([FromQuery] Guid? userId)
        {
            try {
                var agencyId = GetAgencyId();
                var goals = await _agencyService.GetGoalsAsync(agencyId, userId);
                return Ok(goals);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateGoalRequest
        {
            public Guid UsuarioAsignadoId { get; set; }
            public string Titulo { get; set; } = string.Empty;
            public string Descripcion { get; set; } = string.Empty;
            public string TipoPeriodo { get; set; } = "Semanal";
            public DateTime? FechaLimite { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGoalRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var creatorId = GetUserId();
                var goal = await _agencyService.CreateGoalAsync(
                    agencyId, req.UsuarioAsignadoId, creatorId, req.Titulo, req.Descripcion, req.TipoPeriodo, req.FechaLimite);
                return Ok(goal);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class ToggleGoalRequest
        {
            public bool Completado { get; set; }
        }

        [HttpPut("{id}/toggle")]
        public async Task<IActionResult> Toggle(Guid id, [FromBody] ToggleGoalRequest req)
        {
            try {
                var success = await _agencyService.ToggleGoalAsync(id, req.Completado);
                return success ? Ok() : NotFound("Objetivo no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdateGoalRequest
        {
            public Guid UsuarioAsignadoId { get; set; }
            public string Titulo { get; set; } = string.Empty;
            public string Descripcion { get; set; } = string.Empty;
            public string TipoPeriodo { get; set; } = "Semanal";
            public DateTime? FechaLimite { get; set; }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGoalRequest req)
        {
            try {
                var updated = await _agencyService.UpdateGoalAsync(
                    id, req.UsuarioAsignadoId, req.Titulo, req.Descripcion, req.TipoPeriodo, req.FechaLimite);
                return updated != null ? Ok(updated) : NotFound("Objetivo no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try {
                var success = await _agencyService.DeleteGoalAsync(id);
                return success ? Ok() : NotFound("Objetivo no encontrado o ya eliminado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
