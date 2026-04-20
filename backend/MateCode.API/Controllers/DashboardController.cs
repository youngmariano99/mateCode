using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using System;
using System.Threading.Tasks;

namespace MateCode.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            if (!HttpContext.Items.TryGetValue("CurrentTenantId", out var tenantObj) || tenantObj is null)
                return Unauthorized("Espacio de trabajo no identificado.");

            var tenantId = (Guid)tenantObj;

            var activeProjectsCount = await _context.Proyectos
                .CountAsync(p => p.TenantId == tenantId);

            var pendingLeadsCount = await _context.Clientes
                .CountAsync(c => c.EspacioTrabajoId == tenantId && c.Estado == "potencial");

            var teamMembersCount = await _context.MiembrosEspacio
                .CountAsync(m => m.EspacioTrabajoId == tenantId);

            return Ok(new
            {
                ActiveProjects = activeProjectsCount,
                PendingLeads = pendingLeadsCount,
                TeamMembers = teamMembersCount
            });
        }
    }
}
