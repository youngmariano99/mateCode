using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MateCode.Application.Services;
using System;
using System.Threading.Tasks;
using System.Security.Claims;
using System.Text.Json;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AgencyController : ControllerBase
    {
        private readonly IAgencyService _agencyService;
        private readonly IWorkspaceService _workspaceService;

        public AgencyController(IAgencyService agencyService, IWorkspaceService workspaceService)
        {
            _agencyService = agencyService;
            _workspaceService = workspaceService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) throw new UnauthorizedAccessException("Usuario no identificado.");
            return Guid.Parse(userIdStr);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyAgencies()
        {
            try {
                var userId = GetUserId();
                var agencies = await _agencyService.GetAgenciesByUserAsync(userId);
                return Ok(agencies);
            }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateAgencyRequest
        {
            public string Nombre { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAgencyRequest req)
        {
            try {
                var userId = GetUserId();
                var agency = await _agencyService.CreateAgencyAsync(req.Nombre, userId);
                return Ok(agency);
            }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}/members")]
        public async Task<IActionResult> GetMembers(Guid id)
        {
            try {
                var members = await _agencyService.GetAgencyMembersAsync(id);
                return Ok(members);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class InviteMemberRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Rol { get; set; } = "Colaborador";
            public JsonElement? Permisos { get; set; }
        }

        [HttpPost("{id}/invite")]
        public async Task<IActionResult> Invite(Guid id, [FromBody] InviteMemberRequest req)
        {
            try {
                var success = await _agencyService.InviteMemberToAgencyAsync(id, req.Email, req.Rol, req.Permisos);
                return success ? Ok(new { message = "Invitación enviada con éxito." }) : BadRequest("No se pudo invitar al usuario (¿no existe en el sistema?).");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdatePermissionsRequest
        {
            public string Rol { get; set; } = string.Empty;
            public JsonElement Permisos { get; set; }
        }

        [HttpPut("{id}/members/{userId}")]
        public async Task<IActionResult> UpdatePermissions(Guid id, Guid userId, [FromBody] UpdatePermissionsRequest req)
        {
            try {
                var success = await _agencyService.UpdateMemberPermissionsAsync(id, userId, req.Rol, req.Permisos);
                return success ? Ok(new { message = "Permisos actualizados." }) : BadRequest("No se pudo actualizar permisos.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdateAgencyProfileRequest
        {
            [System.Text.Json.Serialization.JsonPropertyName("nombre")]
            public string Nombre { get; set; } = string.Empty;

            [System.Text.Json.Serialization.JsonPropertyName("redes_sociales")]
            public JsonElement RedesSociales { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("branding")]
            public JsonElement Branding { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("mision")]
            public string Mision { get; set; } = string.Empty;

            [System.Text.Json.Serialization.JsonPropertyName("vision")]
            public string Vision { get; set; } = string.Empty;

            [System.Text.Json.Serialization.JsonPropertyName("datos_marketing")]
            public JsonElement DatosMarketing { get; set; }
        }

        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateAgencyProfileRequest req)
        {
            try {
                var success = await _agencyService.UpdateAgencyProfileAsync(id, req.Nombre, req.RedesSociales, req.Branding, req.Mision, req.Vision, req.DatosMarketing);
                return success ? Ok(new { message = "Perfil de la agencia actualizado correctamente." }) : BadRequest("No se pudo actualizar el perfil de la agencia.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("invitations")]
        public async Task<IActionResult> GetInvitations()
        {
            try {
                var userId = GetUserId();
                var invites = await _agencyService.GetPendingInvitationsAsync(userId);
                return Ok(invites);
            }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPost("{id}/accept")]
        public async Task<IActionResult> Accept(Guid id)
        {
            try {
                var userId = GetUserId();
                var success = await _agencyService.AcceptInvitationAsync(userId, id);
                return success ? Ok() : BadRequest("No se pudo aceptar la invitación.");
            }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(Guid id)
        {
            try {
                var userId = GetUserId();
                var success = await _agencyService.RejectInvitationAsync(userId, id);
                return success ? Ok() : BadRequest("No se pudo rechazar la invitación.");
            }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}/workspaces")]
        public async Task<IActionResult> GetWorkspaces(Guid id)
        {
            try {
                var workspaces = await _agencyService.GetWorkspacesByAgencyAsync(id);
                return Ok(workspaces);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}/workspaces-with-projects")]
        public async Task<IActionResult> GetWorkspacesWithProjects(Guid id)
        {
            try {
                var list = await _agencyService.GetWorkspacesWithProjectsAsync(id);
                return Ok(list);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateWorkspaceInAgencyRequest
        {
            public string Nombre { get; set; } = string.Empty;
        }

        [HttpPost("{id}/workspaces")]
        public async Task<IActionResult> CreateWorkspace(Guid id, [FromBody] CreateWorkspaceInAgencyRequest req)
        {
            try {
                var userId = GetUserId();
                var workspace = await _workspaceService.CreateWorkspaceAsync(userId, req.Nombre, id);
                return Ok(workspace);
            }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
