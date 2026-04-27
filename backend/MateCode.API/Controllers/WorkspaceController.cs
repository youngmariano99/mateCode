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

        [HttpGet]
        public async Task<IActionResult> GetMyWorkspaces()
        {
            // El ID del usuario viene en el token de Supabase (sub)
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) 
                return Unauthorized("Usuario no identificado en el token.");

            var userId = Guid.Parse(userIdStr);
            
            // Sincronizar usuario antes de listar (por si es la primera vez)
            var email = User.FindFirstValue("email") ?? User.FindFirstValue(ClaimTypes.Email) ?? "";
            var name = User.FindFirstValue("full_name") ?? User.Identity?.Name ?? email;
            await _workspaceService.SyncUserAsync(userId, email, name);

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
            
            // Asegurar que el usuario existe en DB local antes de crear el espacio (FK constraint)
            var email = User.FindFirstValue("email") ?? User.FindFirstValue(ClaimTypes.Email) ?? "";
            var name = User.FindFirstValue("full_name") ?? User.Identity?.Name ?? email;
            await _workspaceService.SyncUserAsync(userId, email, name);

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
