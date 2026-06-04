using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MateCode.Application.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;
using MateCode.Core.Entities;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AgencyOperationsUpdateController : ControllerBase
    {
        private readonly IAgencyService _agencyService;

        public AgencyOperationsUpdateController(IAgencyService agencyService)
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

        // ====================================================================================
        // COLUMNAS KANBAN DINÁMICAS
        // ====================================================================================
        [HttpGet("columns")]
        public async Task<IActionResult> GetColumns()
        {
            try {
                var agencyId = GetAgencyId();
                var columns = await _agencyService.GetKanbanColumnsAsync(agencyId);
                return Ok(columns);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateColumnRequest
        {
            public string Nombre { get; set; } = string.Empty;
            public int Orden { get; set; }
        }

        [HttpPost("columns")]
        public async Task<IActionResult> CreateColumn([FromBody] CreateColumnRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var col = await _agencyService.CreateKanbanColumnAsync(agencyId, req.Nombre, req.Orden);
                return Ok(col);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("columns/order")]
        public async Task<IActionResult> UpdateColumnsOrder([FromBody] List<KeyValuePair<Guid, int>> req)
        {
            try {
                var agencyId = GetAgencyId();
                var success = await _agencyService.UpdateKanbanColumnsOrderAsync(agencyId, req);
                return success ? Ok() : BadRequest("No se pudo reordenar las columnas.");
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdateNameRequest
        {
            public string Nombre { get; set; } = string.Empty;
        }

        [HttpPut("columns/{id}/name")]
        public async Task<IActionResult> UpdateColumnName(Guid id, [FromBody] UpdateNameRequest req)
        {
            try {
                var success = await _agencyService.UpdateKanbanColumnNameAsync(id, req.Nombre);
                return success ? Ok() : NotFound("Columna no encontrada.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("columns/{id}")]
        public async Task<IActionResult> DeleteColumn(Guid id)
        {
            try {
                var success = await _agencyService.DeleteKanbanColumnAsync(id);
                return success ? Ok() : NotFound("Columna no encontrada.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        // ====================================================================================
        // INFORMES SEMANALES
        // ====================================================================================
        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            try {
                var agencyId = GetAgencyId();
                var reports = await _agencyService.GetWeeklyReportsAsync(agencyId);
                return Ok(reports);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateReportRequest
        {
            public DateTime FechaInicio { get; set; }
            public DateTime FechaFin { get; set; }
            public string LeccionesAprendidas { get; set; } = string.Empty;
        }

        [HttpPost("reports")]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var report = await _agencyService.CreateWeeklyReportAsync(agencyId, req.FechaInicio, req.FechaFin, req.LeccionesAprendidas);
                return Ok(report);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("reports/{id}")]
        public async Task<IActionResult> DeleteReport(Guid id)
        {
            try {
                var success = await _agencyService.DeleteWeeklyReportAsync(id);
                return success ? Ok() : NotFound("Informe no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("metrics-helper")]
        public async Task<IActionResult> GetMetricsHelper([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            try {
                var agencyId = GetAgencyId();
                var metrics = await _agencyService.GenerateWeeklyMetricsPreviewAsync(agencyId, start, end);
                return Ok(metrics);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
