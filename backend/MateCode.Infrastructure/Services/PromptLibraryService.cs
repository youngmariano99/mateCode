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

        public async Task<IEnumerable<PlantillaPrompt>> GetTemplatesAsync(Guid tenantId, Guid userId, string? fase = null)
        {
            var globalId = Guid.Empty;
            
            // 1. Verificar si ya existen plantillas para este tenant
            var hasTemplates = await _context.PlantillasPrompt
                .AnyAsync(t => t.TenantId == tenantId && t.FaseObjetivo == "Fase 2");

            // 2. Si es un tenant nuevo, sembramos las por defecto
            if (!hasTemplates && tenantId != globalId)
            {
                await SeedDefaultTemplatesAsync(tenantId);
            }

            // 3. Consultar todas las plantillas accesibles
            var query = _context.PlantillasPrompt
                .Where(p => p.TenantId == tenantId || p.TenantId == globalId || p.CreadorId == userId);

            if (!string.IsNullOrEmpty(fase))
            {
                query = query.Where(p => p.FaseObjetivo == fase);
            }

            var templates = await query.ToListAsync();
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
            // El CreadorId ya debería venir seteado desde el controlador o lo seteamos aquí si se prefiere.
            await _context.PlantillasPrompt.AddAsync(template);
            await _context.SaveChangesAsync();
            return template;
        }

        public async Task UpdateTemplateAsync(PlantillaPrompt template)
        {
            _context.Entry(template).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteTemplateAsync(Guid id, Guid tenantId, Guid userId)
        {
            var template = await _context.PlantillasPrompt.FirstOrDefaultAsync(p => p.Id == id && (p.TenantId == tenantId || p.CreadorId == userId));
            if (template != null)
            {
                _context.PlantillasPrompt.Remove(template);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<PlantillaPrompt> GetTemplateByIdAsync(Guid id, Guid tenantId, Guid userId)
        {
            var globalId = Guid.Empty;
            return await _context.PlantillasPrompt
                .FirstOrDefaultAsync(p => p.Id == id && (p.TenantId == tenantId || p.TenantId == globalId || p.CreadorId == userId));
        }
    }
}
