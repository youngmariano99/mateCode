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

        [HttpGet]
        public async Task<IActionResult> GetForms([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromQuery] string? tipo)
        {
            var forms = await _formLibrary.GetFormsAsync(tenantId, tipo);
            return Ok(forms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFormById(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            var form = await _formLibrary.GetFormByIdAsync(id, tenantId);
            if (form == null) return NotFound();
            return Ok(form);
        }

        [HttpPost]
        public async Task<IActionResult> CreateForm([FromBody] FormularioPlantilla form, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            form.TenantId = tenantId;
            var created = await _formLibrary.CreateFormAsync(form);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateForm(Guid id, [FromBody] FormularioPlantilla form, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            form.Id = id;
            form.TenantId = tenantId;
            await _formLibrary.UpdateFormAsync(form);
            return Ok();
        }

        [HttpPost("generate-brainstorming")]
        public async Task<IActionResult> GenerateBrainstorming([FromBody] BrainstormingRequest req, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            var prompt = await _promptEngine.GenerarPromptBrainstormingAsync(req.Idea, req.FormularioId, tenantId);
            return Ok(new { prompt });
        }

        public class BrainstormingRequest
        {
            public string Idea { get; set; } = string.Empty;
            public Guid FormularioId { get; set; }
        }
    }
}
