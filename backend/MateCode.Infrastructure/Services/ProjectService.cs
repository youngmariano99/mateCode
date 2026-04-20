using MateCode.Application.Services;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _context;

        public ProjectService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Proyecto>> GetAllProjectsAsync(Guid tenantId)
        {
            return await _context.Set<Proyecto>()
                .Where(p => p.TenantId == tenantId)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        public async Task<Proyecto> CreateProjectAsync(Guid tenantId, string name)
        {
            var proyecto = new Proyecto
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Nombre = name,
                FaseActual = "Fase 0 - Factibilidad",
                FechaCreacion = DateTime.UtcNow,
                ContextoJson = JsonSerializer.Deserialize<JsonElement>("{}")
            };

            await _context.Set<Proyecto>().AddAsync(proyecto);
            await _context.SaveChangesAsync();
            return proyecto;
        }

        public async Task UpdateProjectFeasibilityAsync(Guid projectId, Guid tenantId, JsonElement feasibilityData)
        {
            var engineeringStandards = new
            {
                arquitectura = "Clean Architecture (Capas + Inversión de dependencias)",
                principios = "SOLID estrictos",
                patrones_sugeridos = new[] { 
                    "Singleton", "Factory Method", "Abstract Factory", 
                    "Adapter", "Decorator", "Proxy", 
                    "Observer", "Strategy", "State" 
                },
                reglas_calidad = new[] {
                    "Nomenclatura clara",
                    "Métodos extraídos (Una sola cosa)",
                    "Cláusulas de guarda (Guard Clauses)",
                    "Código autodocumentado",
                    "Sin booleanos como parámetros (Flag Arguments)"
                }
            };

            var combinedData = new Dictionary<string, object>();
            foreach (var property in feasibilityData.EnumerateObject())
            {
                combinedData[property.Name] = property.Value.Clone();
            }

            combinedData["estandares_ingenieria"] = engineeringStandards;
            var finalJson = JsonSerializer.Serialize(combinedData);

            var sql = @"
                UPDATE proyectos.proyectos 
                SET contexto_json = {0}::jsonb 
                WHERE id = {1} AND tenant_id = {2}";

            await _context.Database.ExecuteSqlRawAsync(sql, finalJson, projectId, tenantId);
        }
    }
}
