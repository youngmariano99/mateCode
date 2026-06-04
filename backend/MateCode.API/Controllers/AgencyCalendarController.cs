using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MateCode.Application.Services;
using System;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AgencyCalendarController : ControllerBase
    {
        private readonly IAgencyService _agencyService;

        public AgencyCalendarController(IAgencyService agencyService)
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
        public async Task<IActionResult> GetEvents()
        {
            try {
                var agencyId = GetAgencyId();
                var events = await _agencyService.GetCalendarEventsAsync(agencyId);
                return Ok(events);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateEventRequest
        {
            public string Titulo { get; set; } = string.Empty;
            public string? Descripcion { get; set; }
            public DateTime FechaInicio { get; set; }
            public DateTime FechaFin { get; set; }
            public string Tipo { get; set; } = "Interna"; // Reunion Cliente, Interna, Hito, Otro
            public string? ColorHex { get; set; }
            public Guid? UsuarioResponsableId { get; set; }
            public Guid? ClienteId { get; set; }
            public Guid? ProyectoId { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var ev = await _agencyService.CreateCalendarEventAsync(
                    agencyId, req.Titulo, req.Descripcion, req.FechaInicio, req.FechaFin, req.Tipo, req.ColorHex, req.UsuarioResponsableId, req.ClienteId, req.ProyectoId);
                return Ok(ev);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateEventRequest req)
        {
            try {
                var success = await _agencyService.UpdateCalendarEventAsync(
                    id, req.Titulo, req.Descripcion, req.FechaInicio, req.FechaFin, req.Tipo, req.ColorHex, req.UsuarioResponsableId, req.ClienteId, req.ProyectoId);
                return success ? Ok() : NotFound("Evento no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try {
                var success = await _agencyService.DeleteCalendarEventAsync(id);
                return success ? Ok() : NotFound("Evento no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
