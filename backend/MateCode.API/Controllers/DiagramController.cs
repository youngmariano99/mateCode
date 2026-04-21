using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DiagramController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DiagramController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("project/{projectId:guid}")]
        public async Task<IActionResult> GetDiagrams(Guid projectId)
        {
            var diagrams = await _context.Diagramas
                .Where(d => d.ProyectoId == projectId)
                .ToListAsync();
            return Ok(diagrams);
        }

        [HttpPut("project/{projectId:guid}/{tipo}")]
        public async Task<IActionResult> SaveDiagram(Guid projectId, string tipo, [FromBody] DiagramSaveRequest req)
        {
            var diagram = await _context.Diagramas
                .FirstOrDefaultAsync(d => d.ProyectoId == projectId && d.Tipo == tipo);

            if (diagram == null)
            {
                diagram = new Diagrama
                {
                    Id = Guid.NewGuid(),
                    ProyectoId = projectId,
                    Tipo = tipo,
                    ContenidoCodigo = req.Codigo,
                    FechaActualizacion = DateTime.UtcNow
                };
                await _context.Diagramas.AddAsync(diagram);
            }
            else
            {
                diagram.ContenidoCodigo = req.Codigo;
                diagram.FechaActualizacion = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(diagram);
        }

        public class DiagramSaveRequest
        {
            public string Codigo { get; set; } = string.Empty;
        }
    }
}
