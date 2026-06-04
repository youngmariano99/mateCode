using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MateCode.Application.Services;
using System.Security.Claims;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FormLibraryController : ControllerBase
    {
        private readonly IFormLibraryService _formLibrary;
        private readonly IPromptEngineService _promptEngine;

        public FormLibraryController(IFormLibraryService formLibrary, IPromptEngineService promptEngine)
        {
            _formLibrary = formLibrary;
            _promptEngine = promptEngine;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(userIdStr) ? Guid.Empty : Guid.Parse(userIdStr);
        }

        private Guid? GetAgencyIdHeader()
        {
            var header = Request.Headers["X-Agency-Id"].ToString();
            if (string.IsNullOrEmpty(header) || !Guid.TryParse(header, out var agencyId))
                return null;
            return agencyId;
        }

        private Guid? GetTenantIdHeader()
        {
            var header = Request.Headers["X-Tenant-Id"].ToString();
            if (string.IsNullOrEmpty(header) || !Guid.TryParse(header, out var tenantId))
                return null;
            return tenantId;
        }

        [HttpGet]
        public async Task<IActionResult> GetForms([FromQuery] string? tipo)
        {
            var forms = await _formLibrary.GetFormsAsync(GetTenantIdHeader(), GetAgencyIdHeader(), GetUserId(), tipo);
            return Ok(forms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFormById(Guid id)
        {
            var form = await _formLibrary.GetFormByIdAsync(id, GetTenantIdHeader(), GetAgencyIdHeader(), GetUserId());
            if (form == null) return NotFound();
            return Ok(form);
        }

        [HttpPost]
        public async Task<IActionResult> CreateForm([FromBody] FormularioPlantilla form)
        {
            form.TenantId = GetTenantIdHeader();
            form.AgenciaId = GetAgencyIdHeader();
            form.CreadorId = GetUserId();
            var created = await _formLibrary.CreateFormAsync(form);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateForm(Guid id, [FromBody] FormularioPlantilla form)
        {
            form.Id = id;
            form.TenantId = GetTenantIdHeader();
            form.AgenciaId = GetAgencyIdHeader();
            form.CreadorId = GetUserId();
            await _formLibrary.UpdateFormAsync(form);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteForm(Guid id)
        {
            await _formLibrary.DeleteFormAsync(id, GetTenantIdHeader(), GetAgencyIdHeader(), GetUserId());
            return Ok();
        }

        [HttpPost("generate-brainstorming")]
        public async Task<IActionResult> GenerateBrainstorming([FromBody] BrainstormingRequest req)
        {
            var tenantId = GetTenantIdHeader() ?? Guid.Empty;
            var prompt = await _promptEngine.GenerarPromptBrainstormingAsync(req.Idea, req.FormularioId, tenantId, GetUserId());
            return Ok(new { prompt });
        }

        public class BrainstormingRequest
        {
            public string Idea { get; set; } = string.Empty;
            public Guid FormularioId { get; set; }
        }
    }
}
