using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using System.Linq;
using System.Security.Claims;
using System.Net.Http;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StackController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;

        public StackController(AppDbContext context)
        {
            _context = context;
            _httpClient = new HttpClient();
        }

        public class SupabaseSyncRequest {
            public string? Url { get; set; }
            public string? Key { get; set; }
        }

        [HttpPost("sync/supabase")]
        public async Task<IActionResult> SyncSupabase([FromBody] SupabaseSyncRequest request)
        {
            if (string.IsNullOrEmpty(request.Url) || string.IsNullOrEmpty(request.Key))
                return BadRequest("URL y Key son obligatorios.");

            try
            {
                var url = request.Url?.Trim() ?? "";
                var key = request.Key?.Trim() ?? "";

                // Limpiamos la URL por si viene con slash al final
                var baseUrl = url.TrimEnd('/') + "/rest/v1/";
                
                var httpRequest = new HttpRequestMessage(HttpMethod.Get, baseUrl);
                httpRequest.Headers.Add("apikey", key);
                httpRequest.Headers.Add("Authorization", $"Bearer {key}");

                var response = await _httpClient.SendAsync(httpRequest);
                if (!response.IsSuccessStatusCode)
                {
                    var errorDetail = await response.Content.ReadAsStringAsync();
                    return BadRequest($"Supabase rechazó la conexión ({response.StatusCode}). Verificá que estés usando la Service Role Key si la Anon Key está restringida.");
                }

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                
                JsonElement tablesElement;
                bool found = false;

                // Intentamos con 'definitions' (Swagger 2.0)
                if (doc.RootElement.TryGetProperty("definitions", out tablesElement))
                {
                    found = true;
                }
                // Si no, intentamos con 'components/schemas' (OpenAPI 3.0)
                else if (doc.RootElement.TryGetProperty("components", out var components) && 
                         components.TryGetProperty("schemas", out tablesElement))
                {
                    found = true;
                }

                if (!found)
                {
                    return BadRequest("No se encontraron definiciones de tablas (definitions o components/schemas) en la API de Supabase. Asegurate de tener tablas públicas.");
                }

                var tables = tablesElement.EnumerateObject().Select(table => new {
                    name = table.Name,
                    description = table.Value.TryGetProperty("description", out var desc) ? desc.GetString() : "",
                    columns = table.Value.TryGetProperty("properties", out var props) 
                        ? props.EnumerateObject().Select(col => (object)new {
                            name = col.Name,
                            data_type = col.Value.TryGetProperty("type", out var type) ? type.GetString() : "text",
                            description = col.Value.TryGetProperty("description", out var colDesc) ? colDesc.GetString() : ""
                        }).ToList() 
                        : new System.Collections.Generic.List<object>()
                }).ToList();

                return Ok(new { tables });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(userIdStr) ? Guid.Empty : Guid.Parse(userIdStr);
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
            var userId = GetUserId();
            var templates = await _context.PlantillasStack
                .Where(p => (p.TenantId == tenantId || p.CreadorId == userId) && p.Activo)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
            return Ok(templates);
        }

        [HttpPost("templates")]
        public async Task<IActionResult> CreateTemplate([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] PlantillaStack template)
        {
            template.Id = Guid.NewGuid();
            template.TenantId = tenantId;
            template.CreadorId = GetUserId();
            template.FechaCreacion = DateTime.UtcNow;
            template.Activo = true;
            _context.PlantillasStack.Add(template);
            await _context.SaveChangesAsync();
            return Ok(template);
        }

        [HttpPut("templates/{id:guid}")]
        public async Task<IActionResult> UpdateTemplate(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] PlantillaStack templateUpdate)
        {
            var userId = GetUserId();
            var existing = await _context.PlantillasStack.FirstOrDefaultAsync(p => p.Id == id && (p.TenantId == tenantId || p.CreadorId == userId));
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
            var userId = GetUserId();
            var template = await _context.PlantillasStack.FirstOrDefaultAsync(p => p.Id == id && (p.TenantId == tenantId || p.CreadorId == userId));
            if (template == null) return NotFound();
            
            template.Activo = false;
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}
