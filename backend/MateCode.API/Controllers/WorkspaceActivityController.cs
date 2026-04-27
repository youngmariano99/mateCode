using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkspaceActivityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkspaceActivityController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{projectId}/logs")]
        public async Task<IActionResult> GetActivityLogs(string projectId, [FromQuery] int limit = 20)
        {
            if (!Guid.TryParse(projectId, out var pId)) return BadRequest("Invalid Project ID format");

            var logs = await _context.LogsActividad
                .Where(l => l.ProyectoId == pId)
                .OrderByDescending(l => l.Fecha)
                .Take(limit)
                .Select(l => new {
                    l.TipoEvento,
                    l.NombreUsuario,
                    l.Detalles,
                    l.Fecha
                })
                .ToListAsync();

            return Ok(logs);
        }

        [HttpGet("{projectId}/chat")]
        public async Task<IActionResult> GetGlobalChat(string projectId, [FromQuery] int limit = 50)
        {
            if (!Guid.TryParse(projectId, out var pId)) return BadRequest("Invalid Project ID format");

            var mensajes = await _context.MensajesGlobales
                .Where(m => m.ProyectoId == pId)
                .OrderByDescending(m => m.Fecha)
                .Take(limit)
                .Select(m => new {
                    m.NombreUsuario,
                    m.Contenido,
                    m.Fecha,
                    m.UsuarioId
                })
                .ToListAsync();

            return Ok(mensajes.OrderBy(m => m.Fecha)); // Devolvemos en orden cronológico para el chat
        }
    }
}
