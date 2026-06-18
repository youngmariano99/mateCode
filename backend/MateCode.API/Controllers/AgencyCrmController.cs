using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MateCode.Application.Services;
using System;
using System.Threading.Tasks;
using System.Text.Json;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AgencyCrmController : ControllerBase
    {
        private readonly IAgencyService _agencyService;

        public AgencyCrmController(IAgencyService agencyService)
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

        [HttpGet]
        public async Task<IActionResult> GetLeads()
        {
            try {
                var agencyId = GetAgencyId();
                var leads = await _agencyService.GetLeadsAsync(agencyId);
                return Ok(leads);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("rubros")]
        public async Task<IActionResult> GetUniqueRubros()
        {
            try {
                var agencyId = GetAgencyId();
                var rubros = await _agencyService.GetUniqueRubrosAsync(agencyId);
                return Ok(rubros);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateLeadRequest
        {
            public string Nombre { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Categoria { get; set; } = "Lead";
            public string Calificacion { get; set; } = "Calificado";
            public string OrigenContacto { get; set; } = string.Empty;
            public string MotivoContacto { get; set; } = string.Empty;
            public string Descripcion { get; set; } = string.Empty;
            
            // geoClientes fields
            public string? Rubro { get; set; }
            public string? DireccionTexto { get; set; }
            public double? Latitud { get; set; }
            public double? Longitud { get; set; }
            public string[]? EtiquetasRapidas { get; set; }
            public string? TipoSoftwareTiene { get; set; }
            public string? TipoSoftwareQuiere { get; set; }
            public string? DoloresNotas { get; set; }
            public JsonElement? BitacoraContactos { get; set; }
            public JsonElement? LinksRecursos { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLeadRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var lead = await _agencyService.CreateLeadAsync(
                    agencyId, req.Nombre, req.Email, req.Categoria, req.Calificacion, req.OrigenContacto, req.MotivoContacto, req.Descripcion,
                    req.Rubro, req.DireccionTexto, req.Latitud, req.Longitud, req.EtiquetasRapidas, req.TipoSoftwareTiene, req.TipoSoftwareQuiere, req.DoloresNotas, req.BitacoraContactos, req.LinksRecursos);
                return Ok(lead);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdateLeadStatusRequest
        {
            public string Categoria { get; set; } = string.Empty;
            public string Posicion { get; set; } = "a";
        }

        [HttpPut("status/{id}")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateLeadStatusRequest req)
        {
            try {
                var success = await _agencyService.UpdateLeadStatusAsync(id, req.Categoria, req.Posicion);
                return success ? Ok() : NotFound("Lead no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdateLeadRequest
        {
            public string Nombre { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Categoria { get; set; } = "Lead";
            public string Calificacion { get; set; } = "Calificado";
            public string OrigenContacto { get; set; } = string.Empty;
            public string MotivoContacto { get; set; } = string.Empty;
            public string Descripcion { get; set; } = string.Empty;
            public JsonElement Notas { get; set; }

            // geoClientes fields
            public string? Rubro { get; set; }
            public string? DireccionTexto { get; set; }
            public double? Latitud { get; set; }
            public double? Longitud { get; set; }
            public string[]? EtiquetasRapidas { get; set; }
            public string? TipoSoftwareTiene { get; set; }
            public string? TipoSoftwareQuiere { get; set; }
            public string? DoloresNotas { get; set; }
            public JsonElement? BitacoraContactos { get; set; }
            public JsonElement? LinksRecursos { get; set; }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLeadRequest req)
        {
            try {
                var success = await _agencyService.UpdateLeadAsync(
                    id, req.Nombre, req.Email, req.Categoria, req.Calificacion, req.OrigenContacto, req.MotivoContacto, req.Descripcion, req.Notas,
                    req.Rubro, req.DireccionTexto, req.Latitud, req.Longitud, req.EtiquetasRapidas, req.TipoSoftwareTiene, req.TipoSoftwareQuiere, req.DoloresNotas, req.BitacoraContactos, req.LinksRecursos);
                return success ? Ok() : NotFound("Lead no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try {
                var success = await _agencyService.DeleteLeadAsync(id);
                return success ? Ok() : NotFound("Lead no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("columnas")]
        public async Task<IActionResult> GetColumns()
        {
            try {
                var agencyId = GetAgencyId();
                var cols = await _agencyService.GetCrmColumnsAsync(agencyId);
                return Ok(cols);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateCrmColumnRequest
        {
            public string Key { get; set; } = string.Empty;
            public string Label { get; set; } = string.Empty;
            public int Orden { get; set; }
        }

        [HttpPost("columnas")]
        public async Task<IActionResult> CreateColumn([FromBody] CreateCrmColumnRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var col = await _agencyService.CreateCrmColumnAsync(agencyId, req.Key, req.Label, req.Orden);
                return Ok(col);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdateCrmColumnRequest
        {
            public string Label { get; set; } = string.Empty;
            public int Orden { get; set; }
        }

        [HttpPut("columnas/{id}")]
        public async Task<IActionResult> UpdateColumn(Guid id, [FromBody] UpdateCrmColumnRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var col = await _agencyService.UpdateCrmColumnAsync(agencyId, id, req.Label, req.Orden);
                return col != null ? Ok(col) : NotFound("Columna no encontrada.");
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("columnas/{id}")]
        public async Task<IActionResult> DeleteColumn(Guid id)
        {
            try {
                var agencyId = GetAgencyId();
                var success = await _agencyService.DeleteCrmColumnAsync(agencyId, id);
                return success ? Ok() : NotFound("Columna no encontrada.");
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
