using MateCode.Application.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using System.Text.Json;

namespace MateCode.Infrastructure.Services
{
    public class PortfolioService : IPortfolioService
    {
        private readonly AppDbContext _context;

        public PortfolioService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<object>> GetCompletedProjectsAsync(Guid tenantId)
        {
            // Retornamos tanto proyectos naturales completados como los importados express
            return await _context.Proyectos
                .Where(p => p.TenantId == tenantId && p.FaseActual == "Completado")
                .Select(p => new {
                    p.Id,
                    p.Nombre,
                    p.FechaCreacion,
                    Stack = "Importado" // Simplificación para el MVP
                })
                .ToListAsync();
        }

        public async Task<Guid> CreateExpressImportAsync(Guid tenantId, string projectName, string stack)
        {
            var project = new Proyecto
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Nombre = projectName,
                FaseActual = "Completado",
                FechaCreacion = DateTime.UtcNow,
                ContextoJson = JsonSerializer.Deserialize<JsonElement>($"{{\"stack\": \"{stack}\"}}")
            };

            await _context.Proyectos.AddAsync(project);
            await _context.SaveChangesAsync();
            return project.Id;
        }
    }
}
