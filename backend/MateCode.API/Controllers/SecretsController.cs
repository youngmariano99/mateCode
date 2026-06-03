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
    public class SecretsController : ControllerBase
    {
        private readonly IAgencyService _agencyService;

        public SecretsController(IAgencyService agencyService)
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

        private string GetUserName()
        {
            return User.FindFirstValue("full_name") ?? User.Identity?.Name ?? User.FindFirstValue("email") ?? "Usuario";
        }

        [HttpGet]
        public async Task<IActionResult> GetSecrets()
        {
            try {
                var agencyId = GetAgencyId();
                var secrets = await _agencyService.GetSecretsListAsync(agencyId);
                return Ok(secrets);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPost("reveal/{id}")]
        public async Task<IActionResult> Reveal(Guid id)
        {
            try {
                var userId = GetUserId();
                var userName = GetUserName();
                var plaintextPassword = await _agencyService.RevealSecretAsync(id, userId, userName);
                return Ok(new { password = plaintextPassword });
            }
            catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateSecretRequest
        {
            public string Servicio { get; set; } = string.Empty;
            public string Usuario { get; set; } = string.Empty;
            public string PasswordPlano { get; set; } = string.Empty;
            public string UrlAcceso { get; set; } = string.Empty;
            public JsonElement RolesPermitidos { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSecretRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var secret = await _agencyService.CreateSecretAsync(
                    agencyId, req.Servicio, req.Usuario, req.PasswordPlano, req.UrlAcceso, req.RolesPermitidos);
                return Ok(secret);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try {
                var success = await _agencyService.DeleteSecretAsync(id);
                return success ? Ok() : NotFound("Credencial no encontrada.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
