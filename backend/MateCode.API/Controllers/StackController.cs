using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using System.Linq;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StackController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StackController(AppDbContext context)
        {
            _context = context;
        }

        // --- CATÁLOGO ---
        [HttpGet("catalog")]
        public async Task<IActionResult> GetCatalog([FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            var catalog = await _context.TecnologiasCatalogo
                .Where(t => t.TenantId == null || t.TenantId == tenantId)
                .OrderBy(t => t.CategoriaPrincipal)
                .ThenBy(t => t.Nombre)
                .ToListAsync();
            return Ok(catalog);
        }

        [HttpPost("catalog")]
        public async Task<IActionResult> CreateTech([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] TecnologiaCatalogo tech)
        {
            tech.Id = Guid.NewGuid();
            tech.TenantId = tenantId;
            tech.FechaCreacion = DateTime.UtcNow;
            _context.TecnologiasCatalogo.Add(tech);
            await _context.SaveChangesAsync();
            return Ok(tech);
        }

        [HttpDelete("catalog/{id:guid}")]
        public async Task<IActionResult> DeleteTech(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            var tech = await _context.TecnologiasCatalogo.FirstOrDefaultAsync(t => t.Id == id && (t.TenantId == tenantId || t.TenantId == null));
            if (tech == null) return NotFound();

            if (tech.TenantId == null) return BadRequest("No se pueden eliminar tecnologías globales.");

            _context.TecnologiasCatalogo.Remove(tech);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // --- PROYECTO STACK ---
        [HttpGet("project/{projectId:guid}")]
        public async Task<IActionResult> GetProjectStack(Guid projectId)
        {
            var stack = await _context.ProyectosStack
                .Include(s => s.Tecnologia)
                .Where(s => s.ProyectoId == projectId)
                .ToListAsync();
            return Ok(stack);
        }

        [HttpPost("project/{projectId:guid}")]
        public async Task<IActionResult> UpdateProjectStack(Guid projectId, [FromBody] System.Collections.Generic.List<Guid> techIds)
        {
            var current = await _context.ProyectosStack.Where(s => s.ProyectoId == projectId).ToListAsync();
            _context.ProyectosStack.RemoveRange(current);

            foreach (var tid in techIds)
            {
                _context.ProyectosStack.Add(new ProyectoStack
                {
                    Id = Guid.NewGuid(),
                    ProyectoId = projectId,
                    TecnologiaId = tid
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // --- PLANTILLAS (VOULE/BÓVEDA) ---
        [HttpGet("templates")]
        public async Task<IActionResult> GetTemplates([FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            return Ok(await _context.PlantillasStack.Where(p => p.TenantId == tenantId).ToListAsync());
        }

        [HttpPost("templates")]
        public async Task<IActionResult> CreateTemplate([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] PlantillaStack template)
        {
            template.Id = Guid.NewGuid();
            template.TenantId = tenantId;
            template.FechaCreacion = DateTime.UtcNow;
            _context.PlantillasStack.Add(template);
            await _context.SaveChangesAsync();
            return Ok(template);
        }

        [HttpPut("templates/{id:guid}")]
        public async Task<IActionResult> UpdateTemplate(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] PlantillaStack templateUpdate)
        {
            var existing = await _context.PlantillasStack.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (existing == null) return NotFound();

            existing.Nombre = templateUpdate.Nombre;
            existing.Descripcion = templateUpdate.Descripcion;
            existing.TecnologiasIdsJson = templateUpdate.TecnologiasIdsJson;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }
    }
}
