using MateCode.Application.Services;
using MateCode.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PromptLibraryController : ControllerBase
    {
        private readonly IPromptLibraryService _promptLibrary;
        private readonly IPromptEngineService _promptEngine;

        public PromptLibraryController(IPromptLibraryService promptLibrary, IPromptEngineService promptEngine)
        {
            _promptLibrary = promptLibrary;
            _promptEngine = promptEngine;
        }

        [HttpGet]
        public async Task<IActionResult> GetTemplates([FromQuery] string? fase, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            var templates = await _promptLibrary.GetTemplatesAsync(tenantId, fase);
            return Ok(templates);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTemplate([FromBody] PlantillaPrompt template, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            template.TenantId = tenantId;
            var created = await _promptLibrary.CreateTemplateAsync(template);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTemplate(Guid id, [FromBody] PlantillaPrompt template, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            if (id != template.Id) return BadRequest();
            template.TenantId = tenantId;
            await _promptLibrary.UpdateTemplateAsync(template);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTemplate(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            await _promptLibrary.DeleteTemplateAsync(id, tenantId);
            return Ok();
        }

        [HttpPost("generate-contextual")]
        public async Task<IActionResult> GenerateContextual([FromBody] GenerateContextualRequest req, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
        {
            var prompt = await _promptEngine.GenerarPromptContextual(
                req.TemplateId, 
                req.ProjectId, 
                req.TicketId, 
                tenantId,
                req.OverrideAdn,
                req.OverrideBdd,
                req.OverrideStack);
            return Ok(new { prompt });
        }

        public class GenerateContextualRequest
        {
            public Guid TemplateId { get; set; }
            public Guid ProjectId { get; set; }
            public Guid? TicketId { get; set; }
            public bool? OverrideAdn { get; set; }
            public bool? OverrideBdd { get; set; }
            public bool? OverrideStack { get; set; }
        }
    }
}
