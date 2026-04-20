using Microsoft.AspNetCore.Mvc;
using MateCode.Application.Services;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/portal")]
    public class ClientPortalController : ControllerBase
    {
        private readonly IClientPortalService _portalService;

        public ClientPortalController(IClientPortalService portalService)
        {
            _portalService = portalService;
        }

        [HttpGet("proyecto/{token}")]
        public async Task<IActionResult> GetProject(string token)
        {
            var project = await _portalService.GetProjectByTokenAsync(token);
            if (project == null) return NotFound("Enlace mágico no válido o expirado.");
            return Ok(project);
        }

        [HttpPost("feedback/{token}")]
        public async Task<IActionResult> SubmitFeedback(string token, [FromBody] FeedbackRequest request)
        {
            try 
            {
                await _portalService.SendFeedbackAsync(token, request.Comentario);
                return Ok(new { Message = "Feedback recibido. ¡Gracias de parte del equipo de MateCode!" });
            }
            catch 
            {
                return Unauthorized();
            }
        }
    }

    public class FeedbackRequest
    {
        public string Comentario { get; set; } = string.Empty;
    }
}
