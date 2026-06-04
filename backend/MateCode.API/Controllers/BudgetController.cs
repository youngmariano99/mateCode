using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

namespace MateCode.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BudgetController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{projectId}")]
        public async Task<IActionResult> GetByProject(Guid projectId)
        {
            try
            {
                var list = await _context.Presupuestos
                    .Where(p => p.ProyectoId == projectId)
                    .ToListAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        public class SaveBudgetDto
        {
            public Guid? Id { get; set; }
            public Guid ProyectoId { get; set; }
            public Guid PerfilId { get; set; }
            public JsonElement AlcanceJson { get; set; }
            public decimal MontoTotal { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] SaveBudgetDto dto)
        {
            try
            {
                Presupuesto budget;
                if (dto.Id.HasValue && dto.Id.Value != Guid.Empty)
                {
                    budget = await _context.Presupuestos.FindAsync(dto.Id.Value);
                    if (budget == null)
                    {
                        return NotFound("Presupuesto no encontrado.");
                    }

                    budget.AlcanceJson = dto.AlcanceJson;
                    budget.MontoTotal = dto.MontoTotal;
                    budget.PerfilId = dto.PerfilId;
                }
                else
                {
                    budget = new Presupuesto
                    {
                        Id = Guid.NewGuid(),
                        ProyectoId = dto.ProyectoId,
                        PerfilId = dto.PerfilId == Guid.Empty ? Guid.NewGuid() : dto.PerfilId,
                        AlcanceJson = dto.AlcanceJson,
                        MontoTotal = dto.MontoTotal
                    };
                    await _context.Presupuestos.AddAsync(budget);
                }

                await _context.SaveChangesAsync();
                return Ok(budget);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var budget = await _context.Presupuestos.FindAsync(id);
                if (budget == null)
                {
                    return NotFound("Presupuesto no encontrado.");
                }

                _context.Presupuestos.Remove(budget);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
