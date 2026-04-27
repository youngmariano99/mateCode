using Microsoft.AspNetCore.Mvc;
using MateCode.Application.Services;
using System;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeamController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTeam()
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;
            var members = await _teamService.GetTeamMembersAsync(tenantId);
            return Ok(members);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string q)
        {
            var users = await _teamService.SearchUsersAsync(q);
            return Ok(users);
        }

        public class InviteRequest 
        { 
            public string? Email { get; set; } 
            public Guid? UsuarioId { get; set; }
            public string EtiquetaRol { get; set; } = string.Empty;
        }

        [HttpPost("invite")]
        public async Task<IActionResult> InviteMember([FromBody] InviteRequest request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;

            if (request.UsuarioId.HasValue)
            {
                var success = await _teamService.AddMemberToWorkspaceAsync(tenantId, request.UsuarioId.Value, request.EtiquetaRol);
                if (success) return Ok(new { Message = "Miembro añadido correctamente." });
                return BadRequest("El usuario ya es miembro o no pudo ser añadido.");
            }

            if (!string.IsNullOrEmpty(request.Email))
            {
                var result = await _teamService.InviteMemberAsync(tenantId, request.Email!);
                if (result) return Ok(new { Message = "Invitación enviada con éxito." });
            }
            
            return BadRequest("Datos de invitación inválidos.");
        }

        public class UpdateMemberRequest
        {
            public Guid UsuarioId { get; set; }
            public string EtiquetaRol { get; set; } = string.Empty;
            public System.Collections.Generic.List<Guid> ProjectIds { get; set; } = new();
        }

        [HttpPut("member-setup")]
        public async Task<IActionResult> UpdateMemberSetup([FromBody] UpdateMemberRequest request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;
            await _teamService.UpdateMemberAccessAsync(tenantId, request.UsuarioId, request.EtiquetaRol, request.ProjectIds);
            
            return Ok(new { Message = "Configuración de miembro actualizada." });
        }
    }
}
