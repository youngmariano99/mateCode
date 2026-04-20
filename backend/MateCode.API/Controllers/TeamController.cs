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

        public class InviteRequest { public string Email { get; set; } = string.Empty; }

        [HttpPost("invite")]
        public async Task<IActionResult> InviteMember([FromBody] InviteRequest request)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;
            var result = await _teamService.InviteMemberAsync(tenantId, request.Email);
            
            if (result)
                return Ok(new { Message = "Invitación enviada con éxito." });
            
            return BadRequest("No se pudo enviar la invitación.");
        }
    }
}
