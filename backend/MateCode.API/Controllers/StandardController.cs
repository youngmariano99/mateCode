using Microsoft.AspNetCore.Mvc;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StandardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StandardController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene el catálogo completo de estándares disponibles (Globales + Tenant).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCatalog([FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            var catalog = await _context.EstandaresCatalogo
                .Where(e => (e.EspacioTrabajoId == null || e.EspacioTrabajoId == tenantId) && e.Activo)
                .OrderBy(e => e.Categoria)
                .ThenBy(e => e.Nombre)
                .ToListAsync();

            return Ok(catalog);
        }

        /// <summary>
        /// Crea un nuevo estándar on-the-fly.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EstandarCatalogo estandar)
        {
            var tenantHeader = Request.Headers["X-Tenant-Id"].ToString();
            if (!Guid.TryParse(tenantHeader, out Guid tenantId)) return BadRequest("X-Tenant-Id es requerido.");

            estandar.Id = Guid.NewGuid();
            estandar.EspacioTrabajoId = tenantId;
            estandar.EliminadoEn = null;
            estandar.Activo = true;

            _context.EstandaresCatalogo.Add(estandar);
            await _context.SaveChangesAsync();

            return Ok(estandar);
        }

        /// <summary>
        /// Eliminación lógica (Soft Delete).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var standard = await _context.EstandaresCatalogo.FindAsync(id);
            if (standard == null) return NotFound();

            standard.Activo = false;
            standard.EliminadoEn = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        /// <summary>
        /// Actualiza un estándar existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] EstandarCatalogo model)
        {
            var estandar = await _context.EstandaresCatalogo.FindAsync(id);
            if (estandar == null) return NotFound();

            estandar.Nombre = model.Nombre;
            estandar.Categoria = model.Categoria;
            estandar.DescripcionDidactica = model.DescripcionDidactica;
            estandar.ColorHex = model.ColorHex;

            await _context.SaveChangesAsync();
            return Ok(estandar);
        }

        /// <summary>
        /// Eliminación masiva lógica.
        /// </summary>
        [HttpPost("bulk-delete")]
        public async Task<IActionResult> BulkDelete([FromBody] List<Guid> ids)
        {
            var items = await _context.EstandaresCatalogo.Where(e => ids.Contains(e.Id)).ToListAsync();

            foreach (var item in items)
            {
                item.Activo = false;
                item.EliminadoEn = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, count = items.Count });
        }

        /// <summary>
        /// Importación masiva de estándares.
        /// </summary>
        [HttpPost("bulk-import")]
        public async Task<IActionResult> BulkImport([FromBody] List<EstandarCatalogo> standards)
        {
            var tenantHeader = Request.Headers["X-Tenant-Id"].ToString();
            if (!Guid.TryParse(tenantHeader, out Guid tenantId)) return BadRequest("X-Tenant-Id es requerido.");

            foreach (var item in standards)
            {
                item.Id = Guid.NewGuid();
                item.EspacioTrabajoId = tenantId;
                item.EliminadoEn = null;
                item.Activo = true;
                _context.EstandaresCatalogo.Add(item);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"{standards.Count} estándares importados exitosamente." });
        }

        /// <summary>
        /// Obtiene los estándares asignados a un proyecto.
        /// </summary>
        [HttpGet("/api/Project/{projectId}/standards")]
        public async Task<IActionResult> GetProjectStandards(Guid projectId)
        {
            var standards = await _context.ProyectosEstandares
                .Include(pe => pe.Estandar)
                .Where(pe => pe.ProyectoId == projectId)
                .Select(pe => pe.Estandar)
                .ToListAsync();
            return Ok(standards);
        }

        /// <summary>
        /// Toggle: Asigna o desasigna un estándar a un proyecto.
        /// </summary>
        [HttpPost("/api/Project/{projectId}/standards/toggle")]
        public async Task<IActionResult> ToggleProjectStandard(Guid projectId, [FromBody] Guid standardId)
        {
            var existing = await _context.ProyectosEstandares
                .FirstOrDefaultAsync(pe => pe.ProyectoId == projectId && pe.EstandarId == standardId);

            if (existing != null)
            {
                _context.ProyectosEstandares.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { active = false });
            }
            else
            {
                var mapping = new ProyectoEstandar { ProyectoId = projectId, EstandarId = standardId };
                _context.ProyectosEstandares.Add(mapping);
                await _context.SaveChangesAsync();
                return Ok(new { active = true });
            }
        }
    }
}
