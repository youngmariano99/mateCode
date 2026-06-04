using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MateCode.Application.Services;
using MateCode.Core.Entities;
using System;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AgencyContractController : ControllerBase
    {
        private readonly IAgencyService _agencyService;

        public AgencyContractController(IAgencyService agencyService)
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
        public async Task<IActionResult> GetContracts()
        {
            try {
                var agencyId = GetAgencyId();
                var contracts = await _agencyService.GetContractsAsync(agencyId);
                return Ok(contracts);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetContractById(Guid id)
        {
            try {
                var agencyId = GetAgencyId();
                var contract = await _agencyService.GetContractByIdAsync(id, agencyId);
                if (contract == null) return NotFound("Contrato no encontrado.");
                return Ok(contract);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class CreateContractRequest
        {
            public Guid ClienteId { get; set; }
            public string Titulo { get; set; } = string.Empty;
            public string Contenido { get; set; } = string.Empty;
            public string Estado { get; set; } = "Borrador";
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateContractRequest req)
        {
            try {
                var agencyId = GetAgencyId();
                var contract = await _agencyService.CreateContractAsync(agencyId, req.ClienteId, req.Titulo, req.Contenido, req.Estado);
                return Ok(contract);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class UpdateContractRequest
        {
            public string Titulo { get; set; } = string.Empty;
            public string Contenido { get; set; } = string.Empty;
            public string Estado { get; set; } = "Borrador";
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateContractRequest req)
        {
            try {
                var success = await _agencyService.UpdateContractAsync(id, req.Titulo, req.Contenido, req.Estado);
                return success ? Ok() : NotFound("Contrato no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try {
                var success = await _agencyService.DeleteContractAsync(id);
                return success ? Ok() : NotFound("Contrato no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        public class SignContractRequest
        {
            public string HuellaCriptografica { get; set; } = string.Empty;
        }

        [HttpPost("{id}/sign")]
        public async Task<IActionResult> Sign(Guid id, [FromBody] SignContractRequest req)
        {
            try {
                var success = await _agencyService.SignContractAsync(id, DateTime.UtcNow, req.HuellaCriptografica);
                return success ? Ok() : NotFound("Contrato no encontrado.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
