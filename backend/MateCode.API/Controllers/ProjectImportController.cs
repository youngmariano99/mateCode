using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using MateCode.Application.Dtos;
using MateCode.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Protegido, requiere token JWT
    public class ProjectImportController : ControllerBase
    {
        private readonly IProjectImportService _importService;

        public ProjectImportController(IProjectImportService importService)
        {
            _importService = importService;
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> ImportBulkData([FromBody] ProjectImportRequestDto request)
        {
            if (request == null || request.ProyectoId == Guid.Empty)
            {
                return BadRequest("El ProyectoId es obligatorio para la importación.");
            }

            try
            {
                var result = await _importService.ImportProjectDataAsync(request);
                
                if (result)
                {
                    return Ok(new { message = "Importación masiva completada con éxito." });
                }
                
                return StatusCode(500, "No se pudo completar la importación.");
            }
            catch (Exception ex)
            {
                // En un entorno real, loguearíamos el error detallado aquí
                return StatusCode(500, new { 
                    error = "Falla en la transacción atómica", 
                    details = ex.Message 
                });
            }
        }
    }
}
