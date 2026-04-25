using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using MateCode.Application.Services;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/oracle")]
    public class OracleController : ControllerBase
    {
        private readonly IOracleService _oracleService;

        public OracleController(IOracleService oracleService)
        {
            _oracleService = oracleService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized();

            var results = await _oracleService.BuscarAsync(query, (Guid)tenantObj);
            return Ok(results);
        }
    }
}
