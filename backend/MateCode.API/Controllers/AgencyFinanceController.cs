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
    public class AgencyFinanceController : ControllerBase
    {
        private readonly IAgencyService _agencyService;

        public AgencyFinanceController(IAgencyService agencyService)
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
        public async Task<IActionResult> GetDashboard()
        {
            try {
                var agencyId = GetAgencyId();
                var data = await _agencyService.GetFinanceDashboardAsync(agencyId);
                return Ok(data);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateTransactionRequest
        {
            public string Tipo { get; set; } = "egreso"; // ingreso, egreso, costo_fijo, costo_variable
            public decimal Monto { get; set; }
            public string Concepto { get; set; } = string.Empty;
            public string Descripcion { get; set; } = string.Empty;
            public DateTime Fecha { get; set; } = DateTime.UtcNow;
            public string Categoria { get; set; } = string.Empty;
            public Guid? ProyectoId { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTransactionRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var tx = await _agencyService.CreateTransactionAsync(
                    agencyId, req.Tipo, req.Monto, req.Concepto, req.Descripcion, req.Fecha, req.Categoria, req.ProyectoId);
                return Ok(tx);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try {
                var success = await _agencyService.DeleteTransactionAsync(id);
                return success ? Ok() : NotFound("Transacción no encontrada.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
