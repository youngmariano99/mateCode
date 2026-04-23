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
        private readonly IKanbanService _kanbanService;

        public ProjectService(AppDbContext context, IKanbanService kanbanService)
        {
            _context = context;
            _kanbanService = kanbanService;
        }

        public async Task<IEnumerable<Proyecto>> GetAllProjectsAsync(Guid tenantId)
        {
            return await _context.Proyectos
                .Where(p => p.TenantId == tenantId)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        public async Task<Proyecto> GetProjectByIdAsync(Guid projectId)
        {
            return await _context.Proyectos
                .FirstOrDefaultAsync(p => p.Id == projectId);
        }

        public async Task<Proyecto> CreateProjectAsync(Guid tenantId, string name, Guid? plantillaStackId = null)
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
            
            // Si viene una plantilla, clonamos el stack
            if (plantillaStackId.HasValue)
            {
                var template = await _context.PlantillasStack.FindAsync(plantillaStackId.Value);
                if (template != null)
                {
                    try {
                        var techIds = JsonSerializer.Deserialize<List<Guid>>(template.TecnologiasIdsJson.GetRawText());
                        if (techIds != null)
                        {
                            foreach (var tid in techIds)
                            {
                                _context.ProyectosStack.Add(new ProyectoStack
                                {
                                    Id = Guid.NewGuid(),
                                    ProyectoId = proyecto.Id,
                                    TecnologiaId = tid
                                });
                            }
                        }
                    } catch { }
                }
            }

            await _context.SaveChangesAsync();

            // Inicializar columnas por defecto
            await _kanbanService.InitializeDefaultColumnsAsync(proyecto.Id, tenantId);

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

        public async Task<IEnumerable<EstandarCatalogo>> GetProjectStandardsAsync(Guid projectId)
        {
            return await _context.ProyectosEstandares
                .Where(pe => pe.ProyectoId == projectId)
                .Include(pe => pe.Estandar)
                .Select(pe => pe.Estandar!)
                .ToListAsync();
        }

        public async Task<IEnumerable<ProyectoStack>> GetProjectStackAsync(Guid projectId)
        {
            return await _context.ProyectosStack
                .Where(ps => ps.ProyectoId == projectId)
                .Include(ps => ps.Tecnologia)
                .ToListAsync();
        }

        public async Task<object> GetContextSummaryAsync(Guid projectId)
        {
            var project = await _context.Proyectos.FindAsync(projectId);
            if (project == null) return null;

            var stackCount = await _context.ProyectosStack.CountAsync(ps => ps.ProyectoId == projectId);
            var standardsCount = await _context.ProyectosEstandares.CountAsync(pe => pe.ProyectoId == projectId);
            var storiesCount = await _context.Historias.CountAsync(h => h.ProyectoId == projectId);
            var diagramsCount = await _context.Diagramas.CountAsync(d => d.ProyectoId == projectId);
            var activeTickets = await _context.Tickets.CountAsync(t => t.ProyectoId == projectId && t.Estado != "Completado");

            // ADN se considera completo si el JSON no está vacío y tiene la propiedad 'adn'
            bool hasAdn = false;
            try {
                if (project.ContextoJson.ValueKind != JsonValueKind.Null && project.ContextoJson.ValueKind != JsonValueKind.Undefined) {
                    hasAdn = project.ContextoJson.TryGetProperty("adn", out _);
                }
            } catch { }

            return new {
                tieneAdn = hasAdn,
                tieneStack = stackCount > 0,
                tieneBlueprint = standardsCount > 0,
                cantidadRequisitos = storiesCount,
                diagramasGenerados = diagramsCount,
                ticketsActivos = activeTickets,
                faseActual = project.FaseActual
            };
        }
    }
}
