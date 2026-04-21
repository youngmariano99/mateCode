using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PublicController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("form/{tenantId:guid}")]
        public async Task<IActionResult> GetForm(Guid tenantId, [FromQuery] string tipo = "lead")
        {
            // Busca el formulario por defecto para ese tenant y tipo
            var form = await _context.FormulariosPlantilla
                .Where(f => (f.TenantId == tenantId || f.TenantId == Guid.Empty) && f.Tipo == tipo)
                .OrderByDescending(f => f.TenantId) // Prioriza el del tenant sobre el global
                .FirstOrDefaultAsync();

            if (form == null) return NotFound();
            return Ok(form);
        }

        [HttpGet("project-form/{projectId:guid}")]
        public async Task<IActionResult> GetProjectForm(Guid projectId)
        {
            var project = await _context.Proyectos.FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null) return NotFound();

            // Intentamos extraer el plantillaId del JSON
            try {
                using var doc = JsonDocument.Parse(project.ContextoJson.GetRawText());
                if (doc.RootElement.TryGetProperty("lead", out var lead) && lead.TryGetProperty("plantillaId", out var pid))
                {
                    var id = pid.GetGuid();
                    var form = await _context.FormulariosPlantilla.FindAsync(id);
                    if (form != null) return Ok(form);
                }
            } catch { }

            // Fallback: Si no hay plantilla asignada, buscamos la global por defecto
            var defaultForm = await _context.FormulariosPlantilla
                .Where(f => f.Tipo == "lead")
                .OrderBy(f => f.TenantId)
                .FirstOrDefaultAsync();

            return Ok(defaultForm);
        }

        [HttpPost("lead/{tenantId:guid}")]
        public async Task<IActionResult> SubmitLead(Guid tenantId, [FromBody] JsonElement responses)
        {
            var cliente = new Cliente
            {
                Id = Guid.NewGuid(),
                EspacioTrabajoId = tenantId,
                Nombre = responses.TryGetProperty("nombre", out var n) ? n.GetString() : "Lead Público",
                Email = responses.TryGetProperty("email", out var e) ? e.GetString() : "",
                Estado = "potencial",
                TokenEnlaceMagico = Guid.NewGuid().ToString(),
                ContextoJson = JsonDocument.Parse(JsonSerializer.Serialize(responses)).RootElement
            };

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, clienteId = cliente.Id });
        }

        [HttpPost("project-lead/{projectId:guid}")]
        public async Task<IActionResult> SubmitProjectLead(Guid projectId, [FromBody] JsonElement responses)
        {
            var project = await _context.Proyectos.FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null) return NotFound();

            // Lógica de actualización de JSON semi-estructurado
            var currentJson = project.ContextoJson.GetRawText();
            using var doc = JsonDocument.Parse(currentJson);
            
            // Creamos un diccionario para manipular los datos
            var dict = JsonSerializer.Deserialize<System.Collections.Generic.Dictionary<string, object>>(currentJson) 
                      ?? new System.Collections.Generic.Dictionary<string, object>();

            if (!dict.ContainsKey("lead")) dict["lead"] = new System.Collections.Generic.Dictionary<string, object>();
            
            var leadDict = JsonSerializer.Deserialize<System.Collections.Generic.Dictionary<string, object>>(JsonSerializer.Serialize(dict["lead"])) 
                          ?? new System.Collections.Generic.Dictionary<string, object>();
            
            leadDict["data"] = responses;
            dict["lead"] = leadDict;

            project.ContextoJson = JsonDocument.Parse(JsonSerializer.Serialize(dict)).RootElement;
            
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}
