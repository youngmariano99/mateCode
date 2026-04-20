using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using MateCode.Application.Services;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CrmController : ControllerBase
    {
        private readonly ICrmService _crmService;

        public CrmController(ICrmService crmService)
        {
            _crmService = crmService;
        }

        public class LeadPostRequest
        {
            public Guid TenantId { get; set; }
            public string SourceUrl { get; set; } = string.Empty;
            public JsonElement RawData { get; set; }
        }

        [HttpGet("leads")]
        public async Task<IActionResult> GetLeads()
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");
                
            var tenantId = (Guid)tenantObj;
            var leads = await _crmService.GetLeadsAsync(tenantId);
            return Ok(leads);
        }

        [HttpGet("clients")]
        public async Task<IActionResult> GetClients()
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;
            var clients = await _crmService.GetClientsAsync(tenantId);
            return Ok(clients);
        }

        // Endpoint Público (Iframe de SurveyJS)
        [HttpPost("leads")]
        public async Task<IActionResult> CreateLead([FromBody] LeadPostRequest request)
        {
            var id = await _crmService.CreateLeadAsync(request.TenantId, request.SourceUrl, request.RawData);
            return Ok(new { LeadId = id });
        }

        // Endpoint Protegido (Transición de Estado)
        [HttpPost("leads/{leadId:guid}/approve")]
        public async Task<IActionResult> ApproveLead(Guid leadId)
        {
            // Extraer Tenant desde el Middleware
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");
                
            var tenantId = (Guid)tenantObj;

            var projectId = await _crmService.ApproveLeadAsync(leadId, tenantId);
            return Ok(new { ProjectId = projectId, Message = "Lead aprobado con éxito. Proyecto y contexto creado." });
        }
    }
}
