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
                .Where(t => t.Activo && (t.TenantId == null || t.TenantId == tenantId))
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
            var existing = await _context.TecnologiasCatalogo.FirstOrDefaultAsync(t => t.Id == id && (t.TenantId == tenantId || t.TenantId == null));
            if (existing == null) return NotFound();

            // Permitimos desactivar globales para quitarlas del catálogo sin romper integridad
            existing.Activo = false;
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPut("catalog/{id:guid}")]
        public async Task<IActionResult> UpdateTech(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] TecnologiaCatalogo techUpdate)
        {
            var existing = await _context.TecnologiasCatalogo.FirstOrDefaultAsync(t => t.Id == id && (t.TenantId == tenantId || t.TenantId == null));
            if (existing == null) return NotFound();

            if (existing.TenantId == null) return BadRequest("No se pueden editar tecnologías globales.");

            existing.Nombre = techUpdate.Nombre;
            existing.CategoriaPrincipal = techUpdate.CategoriaPrincipal;
            existing.CategoriaSecundaria = techUpdate.CategoriaSecundaria;
            existing.UrlDocumentacion = techUpdate.UrlDocumentacion;
            existing.ColorHex = techUpdate.ColorHex;

            await _context.SaveChangesAsync();
            return Ok(existing);
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
            var templates = await _context.PlantillasStack
                .Where(p => p.TenantId == tenantId && p.Activo)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
            return Ok(templates);
        }

        [HttpPost("templates")]
        public async Task<IActionResult> CreateTemplate([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] PlantillaStack template)
        {
            template.Id = Guid.NewGuid();
            template.TenantId = tenantId;
            template.FechaCreacion = DateTime.UtcNow;
            template.Activo = true;
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

        [HttpDelete("templates/{id:guid}")]
        public async Task<IActionResult> DeleteTemplate(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            var template = await _context.PlantillasStack.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (template == null) return NotFound();
            
            template.Activo = false;
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}
