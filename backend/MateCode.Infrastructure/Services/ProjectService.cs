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

        public async Task<IEnumerable<Proyecto>> GetAllProjectsAsync(Guid tenantId, Guid userId)
        {
            // Verificamos si el usuario es el dueño del espacio
            var workspace = await _context.EspaciosTrabajo.FindAsync(tenantId);
            bool isOwner = workspace != null && workspace.PropietarioId == userId;

            if (isOwner)
            {
                // El dueño ve todos los proyectos del espacio
                return await _context.Proyectos
                    .Where(p => p.TenantId == tenantId)
                    .OrderByDescending(p => p.FechaCreacion)
                    .ToListAsync();
            }
            else
            {
                // Un miembro solo ve los proyectos donde fue explícitamente asignado
                var assignedProjectIds = await _context.MiembrosProyecto
                    .Where(mp => mp.UsuarioId == userId)
                    .Select(mp => mp.ProyectoId)
                    .ToListAsync();

                return await _context.Proyectos
                    .Where(p => p.TenantId == tenantId && assignedProjectIds.Contains(p.Id))
                    .OrderByDescending(p => p.FechaCreacion)
                    .ToListAsync();
            }
        }

        public async Task<Proyecto> GetProjectByIdAsync(Guid projectId)
        {
            return await _context.Proyectos
                .FirstOrDefaultAsync(p => p.Id == projectId);
        }

        public async Task<Proyecto> CreateProjectAsync(Guid tenantId, string name, string description = "", Guid? plantillaStackId = null, Guid? clienteId = null, string? plantillaWeb = null)
        {
            var defaultJson = GetDefaultContextJson(name, plantillaWeb);
            var proyecto = new Proyecto
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ClienteId = clienteId,
                Nombre = name,
                Descripcion = description,
                FaseActual = "Fase 0 - Factibilidad",
                FechaCreacion = DateTime.UtcNow,
                ContextoJson = JsonSerializer.Deserialize<JsonElement>(defaultJson)
            };

            await _context.Set<Proyecto>().AddAsync(proyecto);

            if (clienteId.HasValue)
            {
                var client = await _context.Clientes.FindAsync(clienteId.Value);
                if (client != null && !client.EspacioTrabajoId.HasValue)
                {
                    client.EspacioTrabajoId = tenantId;
                }
            }
            
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

            // Sembrar backlog si viene plantilla web
            if (!string.IsNullOrEmpty(plantillaWeb))
            {
                SeedAgileTemplates(proyecto.Id, plantillaWeb);
            }

            await _context.SaveChangesAsync();

            // Inicializar columnas por defecto
            await _kanbanService.InitializeDefaultColumnsAsync(proyecto.Id, tenantId);

            return proyecto;
        }

        private void SeedAgileTemplates(Guid projectId, string plantillaWeb)
        {
            var epicas = new List<Epica>();
            var features = new List<Feature>();
            var historias = new List<Historia>();

            if (plantillaWeb.ToLower() == "landing")
            {
                var ep1 = new Epica { Id = Guid.NewGuid(), ProyectoId = projectId, Titulo = "Estructura & Diseño", ColorHex = "#10b981", OrdenPosicion = 0 };
                var ep2 = new Epica { Id = Guid.NewGuid(), ProyectoId = projectId, Titulo = "Conversión & SEO", ColorHex = "#3b82f6", OrdenPosicion = 1 };
                epicas.Add(ep1);
                epicas.Add(ep2);

                var f1 = new Feature { Id = Guid.NewGuid(), EpicaId = ep1.Id, Nombre = "Secciones Principales", ColorHex = "#10b981", OrdenPosicion = 0 };
                var f2 = new Feature { Id = Guid.NewGuid(), EpicaId = ep2.Id, Nombre = "Formulario & Analytics", ColorHex = "#3b82f6", OrdenPosicion = 0 };
                features.Add(f1);
                features.Add(f2);

                historias.Add(new Historia {
                    Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = f1.Id,
                    Titulo = "Diseñar e implementar sección Hero con propuesta de valor clara y CTA llamativo",
                    UsuarioNarrativo = "Visitante", Prioridad = "MVP", CriteriosBdd = "Given que visito la web, When carga, Then veo el CTA principal"
                });
                historias.Add(new Historia {
                    Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = f1.Id,
                    Titulo = "Crear sección de características y beneficios clave del producto",
                    UsuarioNarrativo = "Visitante", Prioridad = "MVP"
                });
                historias.Add(new Historia {
                    Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = f2.Id,
                    Titulo = "Implementar formulario de contacto con validación para captar leads",
                    UsuarioNarrativo = "Administrador", Prioridad = "MVP"
                });
            }
            else if (plantillaWeb.ToLower() == "institucional")
            {
                var ep1 = new Epica { Id = Guid.NewGuid(), ProyectoId = projectId, Titulo = "Arquitectura de Páginas", ColorHex = "#f59e0b", OrdenPosicion = 0 };
                var ep2 = new Epica { Id = Guid.NewGuid(), ProyectoId = projectId, Titulo = "Blog & Novedades", ColorHex = "#8b5cf6", OrdenPosicion = 1 };
                epicas.Add(ep1);
                epicas.Add(ep2);

                var f1 = new Feature { Id = Guid.NewGuid(), EpicaId = ep1.Id, Nombre = "Páginas Estáticas", ColorHex = "#f59e0b", OrdenPosicion = 0 };
                var f2 = new Feature { Id = Guid.NewGuid(), EpicaId = ep2.Id, Nombre = "CMS de Novedades", ColorHex = "#8b5cf6", OrdenPosicion = 0 };
                features.Add(f1);
                features.Add(f2);

                historias.Add(new Historia {
                    Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = f1.Id,
                    Titulo = "Desarrollar página 'Nosotros' detallando la visión, misión e integrantes de la empresa",
                    UsuarioNarrativo = "Visitante", Prioridad = "MVP"
                });
                historias.Add(new Historia {
                    Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = f1.Id,
                    Titulo = "Crear página de servicios destacados con acordeones de información",
                    UsuarioNarrativo = "Visitante", Prioridad = "MVP"
                });
                historias.Add(new Historia {
                    Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = f2.Id,
                    Titulo = "Publicar y administrar noticias o novedades desde panel administrador",
                    UsuarioNarrativo = "Editor", Prioridad = "MVP"
                });
            }
            else if (plantillaWeb.ToLower() == "tienda")
            {
                var ep1 = new Epica { Id = Guid.NewGuid(), ProyectoId = projectId, Titulo = "Catálogo & Compra", ColorHex = "#ec4899", OrdenPosicion = 0 };
                var ep2 = new Epica { Id = Guid.NewGuid(), ProyectoId = projectId, Titulo = "Pasarela de Pago & Checkout", ColorHex = "#f43f5e", OrdenPosicion = 1 };
                epicas.Add(ep1);
                epicas.Add(ep2);

                var f1 = new Feature { Id = Guid.NewGuid(), EpicaId = ep1.Id, Nombre = "Ficha & Carrito", ColorHex = "#ec4899", OrdenPosicion = 0 };
                var f2 = new Feature { Id = Guid.NewGuid(), EpicaId = ep2.Id, Nombre = "Checkout", ColorHex = "#f43f5e", OrdenPosicion = 0 };
                features.Add(f1);
                features.Add(f2);

                historias.Add(new Historia {
                    Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = f1.Id,
                    Titulo = "Desarrollar grilla de productos con filtros de categoría y ordenamiento por precio",
                    UsuarioNarrativo = "Cliente", Prioridad = "MVP"
                });
                historias.Add(new Historia {
                    Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = f1.Id,
                    Titulo = "Visualizar el detalle de producto, variante (color/talle) y añadirlo al carrito",
                    UsuarioNarrativo = "Cliente", Prioridad = "MVP"
                });
                historias.Add(new Historia {
                    Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = f2.Id,
                    Titulo = "Integrar checkout simplificado de cobro con pasarela de pagos (MercadoPago/Stripe)",
                    UsuarioNarrativo = "Cliente", Prioridad = "MVP"
                });
            }

            _context.Set<Epica>().AddRange(epicas);
            _context.Set<Feature>().AddRange(features);
            _context.Set<Historia>().AddRange(historias);
        }

        private string GetDefaultContextJson(string name, string? plantillaWeb)
        {
            string pagesJson = "";
            if (plantillaWeb?.ToLower() == "landing")
            {
                pagesJson = @"[
                    { ""id"": ""p1"", ""name"": ""Inicio / Landing"", ""route"": ""/"", ""sections"": [{ ""id"": ""s1"", ""title"": ""Hero Section"", ""description"": ""Presentación de propuesta de valor y CTA principal"" }, { ""id"": ""s2"", ""title"": ""Beneficios"", ""description"": ""Detalle de ventajas del producto"" }, { ""id"": ""s3"", ""title"": ""Contacto"", ""description"": ""Captura de leads"" }] }
                ]";
            }
            else if (plantillaWeb?.ToLower() == "institucional")
            {
                pagesJson = @"[
                    { ""id"": ""p1"", ""name"": ""Inicio"", ""route"": ""/"", ""sections"": [{ ""id"": ""s1"", ""title"": ""Hero Slider"", ""description"": ""Sliders principales e introducción"" }] },
                    { ""id"": ""p2"", ""name"": ""Nosotros"", ""route"": ""/nosotros"", ""sections"": [{ ""id"": ""s2"", ""title"": ""Misión & Visión"", ""description"": ""Misión, visión y valores de la empresa"" }] },
                    { ""id"": ""p3"", ""name"": ""Servicios"", ""route"": ""/servicios"", ""sections"": [{ ""id"": ""s3"", ""title"": ""Catálogo de Servicios"", ""description"": ""Detalle de servicios prestados"" }] },
                    { ""id"": ""p4"", ""name"": ""Contacto"", ""route"": ""/contacto"", ""sections"": [{ ""id"": ""s4"", ""title"": ""Formulario de Contacto"", ""description"": ""Formulario de contacto y mapa de sucursales"" }] }
                ]";
            }
            else if (plantillaWeb?.ToLower() == "tienda")
            {
                pagesJson = @"[
                    { ""id"": ""p1"", ""name"": ""Inicio / Tienda"", ""route"": ""/"", ""sections"": [{ ""id"": ""s1"", ""title"": ""Banner Principal"", ""description"": ""Destacados y promociones"" }] },
                    { ""id"": ""p2"", ""name"": ""Catálogo"", ""route"": ""/productos"", ""sections"": [{ ""id"": ""s2"", ""title"": ""Grilla de Productos"", ""description"": ""Filtros y paginación de catálogo"" }] },
                    { ""id"": ""p3"", ""name"": ""Detalle de Producto"", ""route"": ""/producto/:id"", ""sections"": [{ ""id"": ""s3"", ""title"": ""Ficha de Producto"", ""description"": ""Fotos, variantes y descripción"" }] },
                    { ""id"": ""p4"", ""name"": ""Carrito"", ""route"": ""/carrito"", ""sections"": [{ ""id"": ""s4"", ""title"": ""Resumen de Carrito"", ""description"": ""Detalle de items e importes"" }] },
                    { ""id"": ""p5"", ""name"": ""Pago"", ""route"": ""/checkout"", ""sections"": [{ ""id"": ""s5"", ""title"": ""Pasarela de Pagos"", ""description"": ""Dirección de envío y pasarela"" }] }
                ]";
            }
            else
            {
                pagesJson = @"[
                    { ""id"": ""p1"", ""name"": ""Inicio"", ""route"": ""/"", ""sections"": [{ ""id"": ""s1"", ""title"": ""Hero"", ""description"": ""Presentación del producto"" }] }
                ]";
            }

            return $$"""
            {
                "sitemap": {
                    "project_name": "{{name}}",
                    "pages": {{pagesJson}}
                },
                "branding": {
                    "identity": { "name": "{{name}}", "purpose": "", "slogan": "", "personality": "" },
                    "visuals": { 
                        "primaryHex": "#10b981", 
                        "secondaryHex": "#3b82f6", 
                        "accentHex": "#f59e0b", 
                        "backgroundHex": "#09090b",
                        "headingFont": "Outfit",
                        "bodyFont": "Inter",
                        "numberFont": "JetBrains Mono",
                        "imageStyle": "Minimalist"
                    },
                    "layout_rules": { "navbar_style": "sticky", "footer_style": "standard" },
                    "voice": { "tone": "Professional", "prohibited_words": [], "slang_allowed": false },
                    "restrictions": { "no_go_list": [] }
                }
            }
            """;
        }

        public async Task UpdateProjectAsync(Guid projectId, string name, string description, Guid? clienteId = null)
        {
            var project = await _context.Proyectos.FindAsync(projectId);
            if (project != null)
            {
                project.Nombre = name;
                project.Descripcion = description;
                if (clienteId.HasValue)
                {
                    project.ClienteId = clienteId;

                    var client = await _context.Clientes.FindAsync(clienteId.Value);
                    if (client != null && !client.EspacioTrabajoId.HasValue)
                    {
                        client.EspacioTrabajoId = project.TenantId;
                    }
                }
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteProjectAsync(Guid projectId)
        {
            var project = await _context.Proyectos.FindAsync(projectId);
            if (project != null)
            {
                _context.Proyectos.Remove(project);
                await _context.SaveChangesAsync();
            }
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
        public async Task<IEnumerable<Diagrama>> GetDiagramsByProjectAsync(Guid projectId)
        {
            return await _context.Diagramas
                .Where(d => d.ProyectoId == projectId)
                .OrderByDescending(d => d.FechaActualizacion)
                .ToListAsync();
        }

        public async Task SaveDiagramAsync(Guid projectId, string tipo, string codigo)
        {
            var existing = await _context.Diagramas
                .FirstOrDefaultAsync(d => d.ProyectoId == projectId && d.Tipo == tipo);

            if (existing != null)
            {
                existing.ContenidoCodigo = codigo;
                existing.FechaActualizacion = DateTime.UtcNow;
            }
            else
            {
                _context.Diagramas.Add(new Diagrama
                {
                    Id = Guid.NewGuid(),
                    ProyectoId = projectId,
                    Tipo = tipo,
                    ContenidoCodigo = codigo,
                    FechaActualizacion = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task UpdateProjectSyncConfigAsync(Guid projectId, string url, string key, string type)
        {
            var project = await _context.Proyectos.FindAsync(projectId);
            if (project != null)
            {
                project.ExternalSyncUrl = url;
                project.ExternalSyncKey = key;
                project.ExternalSyncType = type;
                await _context.SaveChangesAsync();
            }
        }
    }
}
