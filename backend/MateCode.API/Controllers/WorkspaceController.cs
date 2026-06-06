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
    public class WorkspaceController : ControllerBase
    {
        private readonly IWorkspaceService _workspaceService;

        public WorkspaceController(IWorkspaceService workspaceService)
        {
            _workspaceService = workspaceService;
        }

        private (string email, string name, string username) GetUserInfoFromToken()
        {
            var email = User.FindFirstValue("email") ?? User.FindFirstValue(ClaimTypes.Email) ?? "";
            string name = "";
            string username = "";

            var userMetadataStr = User.FindFirstValue("user_metadata");
            if (!string.IsNullOrEmpty(userMetadataStr))
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(userMetadataStr);
                    if (doc.RootElement.TryGetProperty("full_name", out var fnProp))
                        name = fnProp.GetString() ?? "";
                    if (doc.RootElement.TryGetProperty("username", out var unProp))
                        username = unProp.GetString() ?? "";
                }
                catch {}
            }

            if (string.IsNullOrEmpty(name))
            {
                name = User.FindFirstValue("full_name") ?? User.Identity?.Name ?? email;
            }

            return (email, name, username);
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) 
                return Unauthorized("Usuario no identificado en el token.");

            var userId = Guid.Parse(userIdStr);
            var (email, name, username) = GetUserInfoFromToken();
            
            await _workspaceService.SyncUserAsync(userId, email, name, username);

            return Ok(new { id = userId, email, nombreCompleto = name, nombreUsuario = username });
        }

        public class UpdateProfileRequest
        {
            public string NombreCompleto { get; set; } = string.Empty;
            public string NombreUsuario { get; set; } = string.Empty;
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) 
                return Unauthorized("Usuario no identificado en el token.");

            var userId = Guid.Parse(userIdStr);
            var email = User.FindFirstValue("email") ?? User.FindFirstValue(ClaimTypes.Email) ?? "";

            if (string.IsNullOrEmpty(req.NombreUsuario))
            {
                return BadRequest("El nombre de usuario no puede estar vacío.");
            }

            await _workspaceService.SyncUserAsync(userId, email, req.NombreCompleto, req.NombreUsuario);

            return Ok(new { id = userId, email, nombreCompleto = req.NombreCompleto, nombreUsuario = req.NombreUsuario });
        }

        [HttpGet]
        public async Task<IActionResult> GetMyWorkspaces()
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) 
                return Unauthorized("Usuario no identificado en el token.");

            var userId = Guid.Parse(userIdStr);
            
            var (email, name, username) = GetUserInfoFromToken();
            await _workspaceService.SyncUserAsync(userId, email, name, username);

            var workspaces = await _workspaceService.GetWorkspacesByUserAsync(userId);
            return Ok(workspaces);
        }

        public class CreateWorkspaceRequest
        {
            public string Nombre { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateWorkspaceRequest req)
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) 
                return Unauthorized();

            var userId = Guid.Parse(userIdStr);
            
            var (email, name, username) = GetUserInfoFromToken();
            await _workspaceService.SyncUserAsync(userId, email, name, username);

            var workspace = await _workspaceService.CreateWorkspaceAsync(userId, req.Nombre);
            return Ok(workspace);
        }

        [HttpGet("invitations")]
        public async Task<IActionResult> GetInvitations()
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = Guid.Parse(userIdStr);
            var invitations = await _workspaceService.GetPendingInvitationsAsync(userId);
            return Ok(invitations);
        }

        [HttpPost("accept/{workspaceId}")]
        public async Task<IActionResult> Accept(Guid workspaceId)
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = Guid.Parse(userIdStr);
            var success = await _workspaceService.AcceptInvitationAsync(userId, workspaceId);
            return success ? Ok() : BadRequest("No se pudo aceptar la invitación.");
        }

        [HttpPost("reject/{workspaceId}")]
        public async Task<IActionResult> Reject(Guid workspaceId)
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = Guid.Parse(userIdStr);
            var success = await _workspaceService.RejectInvitationAsync(userId, workspaceId);
            return success ? Ok() : BadRequest("No se pudo rechazar la invitación.");
        }
    }
}
