using MateCode.Application.Services;
using MateCode.Core.Entities;
using MateCode.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MateCode.Infrastructure.Services
{
    public class PromptLibraryService : IPromptLibraryService
    {
        private readonly AppDbContext _context;

        public PromptLibraryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PlantillaPrompt>> GetTemplatesAsync(Guid tenantId, string? fase = null)
        {
            var globalId = Guid.Empty;
            var templates = await _context.PlantillasPrompt
                .Where(p => p.TenantId == tenantId || p.TenantId == globalId)
                .ToListAsync();

            // Si es un tenant nuevo y no tiene las plantillas maestras de diagramas, las creamos
            if (!templates.Any(t => t.TenantId == tenantId && t.FaseObjetivo == "Fase 2"))
            {
                await SeedDefaultTemplatesAsync(tenantId);
                return await GetTemplatesAsync(tenantId, fase); // Re-consultar
            }
            
            if (!string.IsNullOrEmpty(fase))
            {
                templates = templates.Where(p => p.FaseObjetivo == fase).ToList();
            }

            return templates.OrderByDescending(p => p.FechaCreacion);
        }

        private async Task SeedDefaultTemplatesAsync(Guid tenantId)
        {
            var defaults = new List<PlantillaPrompt>
            {
                new PlantillaPrompt {
                    Id = Guid.NewGuid(), TenantId = tenantId, FaseObjetivo = "Fase 2", TipoDiagrama = "ERD",
                    Titulo = "Diseño de Base de Datos (ERD)",
                    Descripcion = "Genera el modelo relacional completo basado en el ADN y las historias de usuario.",
                    BloquePersona = "Actúa como un Arquitecto de Software Senior y Experto en Modelado de Datos.",
                    BloqueTarea = "Tu tarea es analizar el contexto del sistema y generar el Diagrama de Entidad-Relación (ERD) profesional.",
                    InyectaAdn = true, InyectaBdd = true, InyectaStack = true
                },
                new PlantillaPrompt {
                    Id = Guid.NewGuid(), TenantId = tenantId, FaseObjetivo = "Fase 2", TipoDiagrama = "SITEMAP",
                    Titulo = "Arquitectura de Información (Sitemap)",
                    Descripcion = "Define la navegación, rutas y roles de acceso del sistema.",
                    BloquePersona = "Actúa como un Arquitecto UX/UI y Experto en Arquitectura de Información.",
                    BloqueTarea = "Tu tarea es generar el Sitemap (Mapa de Navegación) del sistema basándote en el contexto del proyecto y los roles identificados.",
                    InyectaAdn = true, InyectaBdd = true, InyectaStack = false
                },
                new PlantillaPrompt {
                    Id = Guid.NewGuid(), TenantId = tenantId, FaseObjetivo = "Fase 2", TipoDiagrama = "UML",
                    Titulo = "Diagrama de Secuencia y Lógica (UML)",
                    Descripcion = "Visualiza el flujo de mensajes y la interacción entre componentes.",
                    BloquePersona = "Actúa como un Arquitecto de Software Senior experto en Patrones de Diseño.",
                    BloqueTarea = "Tu tarea es generar la lógica de interacción detallada usando diagramas PlantUML.",
                    InyectaAdn = true, InyectaBdd = true, InyectaStack = true
                },
                new PlantillaPrompt {
                    Id = Guid.NewGuid(), TenantId = tenantId, FaseObjetivo = "Fase 2", TipoDiagrama = "ROLES",
                    Titulo = "Matriz de Roles y Seguridad",
                    Descripcion = "Cruza las funcionalidades con los permisos de cada tipo de usuario.",
                    BloquePersona = "Actúa como un Especialista en Ciberseguridad y Gestión de Accesos (IAM).",
                    BloqueTarea = "Tu tarea es generar la matriz de permisos y roles basándote en los actores del sistema.",
                    InyectaAdn = true, InyectaBdd = true, InyectaStack = false
                }
            };

            await _context.PlantillasPrompt.AddRangeAsync(defaults);
            await _context.SaveChangesAsync();
        }

        public async Task<PlantillaPrompt> CreateTemplateAsync(PlantillaPrompt template)
        {
            template.Id = Guid.NewGuid();
            template.FechaCreacion = DateTime.UtcNow;
            await _context.PlantillasPrompt.AddAsync(template);
            await _context.SaveChangesAsync();
            return template;
        }

        public async Task UpdateTemplateAsync(PlantillaPrompt template)
        {
            _context.Entry(template).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteTemplateAsync(Guid id, Guid tenantId)
        {
            var template = await _context.PlantillasPrompt.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (template != null)
            {
                _context.PlantillasPrompt.Remove(template);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<PlantillaPrompt> GetTemplateByIdAsync(Guid id, Guid tenantId)
        {
            var globalId = Guid.Empty;
            return await _context.PlantillasPrompt
                .FirstOrDefaultAsync(p => p.Id == id && (p.TenantId == tenantId || p.TenantId == globalId));
        }
    }
}
