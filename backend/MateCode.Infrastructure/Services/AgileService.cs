using MateCode.Application.Services;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using System.Collections.Generic;
using System.Linq;

namespace MateCode.Infrastructure.Services
{
    public class AgileService : IAgileService
    {
        private readonly AppDbContext _context;

        public AgileService(AppDbContext context)
        {
            _context = context;
        }

        public async Task SaveFullStoryMapAsync(Guid projectId, Guid tenantId, JsonElement storyMapData)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Limpiar datos anteriores del proyecto
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM agil.personas_proyecto WHERE proyecto_id = {0}", projectId);
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM agil.releases WHERE proyecto_id = {0}", projectId);
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM agil.historias WHERE proyecto_id = {0}", projectId);
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM agil.features WHERE epica_id IN (SELECT id FROM agil.epicas WHERE proyecto_id = {0})", projectId);
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM agil.epicas WHERE proyecto_id = {0}", projectId);

                // 2. Guardar Personas
                if (storyMapData.TryGetProperty("personas", out var personasNode))
                {
                    foreach (var p in personasNode.EnumerateArray())
                    {
                        var persona = new PersonaProyecto {
                            Id = Guid.NewGuid(),
                            ProyectoId = projectId,
                            Nombre = p.GetProperty("nombre").GetString() ?? "Anon",
                            Rol = p.GetProperty("rol").GetString() ?? "Usuario"
                        };
                        _context.PersonasProyecto.Add(persona);
                    }
                }

                // 3. Guardar Releases
                var releaseIdMap = new Dictionary<string, Guid>();
                if (storyMapData.TryGetProperty("releases", out var releasesNode))
                {
                    int idx = 0;
                    foreach (var r in releasesNode.EnumerateArray())
                    {
                        var rid = Guid.NewGuid();
                        var rname = r.GetProperty("nombre").GetString() ?? "V1";
                        var rKey = r.TryGetProperty("id", out var idNode) ? idNode.GetString() : rname;
                        
                        var release = new Release {
                            Id = rid,
                            ProyectoId = projectId,
                            Nombre = rname,
                            Descripcion = r.TryGetProperty("descripcion", out var d) ? d.GetString() : "",
                            OrdenPosicion = idx++
                        };
                        _context.Releases.Add(release);
                        if (rKey != null) releaseIdMap[rKey] = rid;
                    }
                }

                // Guardar cambios parciales para que los Releases existan antes de las historias (evitar error de FK)
                await _context.SaveChangesAsync();

                // 4. Guardar Jerarquía Epics -> Features -> Stories
                if (storyMapData.TryGetProperty("epics", out var epicsNode))
                {
                    int epicIdx = 0;
                    foreach (var epicNode in epicsNode.EnumerateArray())
                    {
                        var epicId = Guid.NewGuid();
                        var epic = new Epica {
                            Id = epicId,
                            ProyectoId = projectId,
                            Titulo = epicNode.GetProperty("nombre").GetString() ?? "Sin Título",
                            ColorHex = epicNode.TryGetProperty("color", out var c) ? c.GetString() : "#10b981",
                            OrdenPosicion = epicIdx++
                        };
                        _context.Epicas.Add(epic);

                        if (epicNode.TryGetProperty("features", out var featuresNode))
                        {
                            int featIdx = 0;
                            foreach (var featNode in featuresNode.EnumerateArray())
                            {
                                var featId = Guid.NewGuid();
                                var feature = new Feature {
                                    Id = featId,
                                    EpicaId = epicId,
                                    Nombre = featNode.GetProperty("nombre").GetString() ?? "Feature",
                                    ColorHex = featNode.TryGetProperty("color", out var fc) ? fc.GetString() : epic.ColorHex,
                                    OrdenPosicion = featIdx++
                                };
                                _context.Features.Add(feature);

                                if (featNode.TryGetProperty("user_stories", out var storiesNode))
                                {
                                    foreach (var storyNode in storiesNode.EnumerateArray())
                                    {
                                        var rKey = storyNode.TryGetProperty("release_id", out var rNode) ? rNode.GetString() : null;
                                        var rid = rKey != null && releaseIdMap.ContainsKey(rKey) ? releaseIdMap[rKey] : (Guid?)null;

                                        var historia = new Historia {
                                            Id = Guid.NewGuid(),
                                            FeatureId = featId,
                                            ReleaseId = rid,
                                            ProyectoId = projectId,
                                            Titulo = storyNode.GetProperty("titulo").GetString() ?? "US",
                                            UsuarioNarrativo = storyNode.TryGetProperty("user", out var u) ? u.GetString() : "Usuario",
                                            Prioridad = storyNode.TryGetProperty("prioridad", out var prio) ? prio.GetString() : "MVP",
                                            CriteriosAceptacion = storyNode.TryGetProperty("criterios_aceptacion", out var ca) ? ca : (JsonElement?)null,
                                            CriteriosBdd = storyNode.TryGetProperty("bdd", out var bdd) ? bdd.GetString() : ""
                                        };
                                        _context.Historias.Add(historia);
                                    }
                                }
                            }
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<object> GetFullStoryMapAsync(Guid projectId)
        {
            var epicas = await _context.Epicas.Where(e => e.ProyectoId == projectId).OrderBy(e => e.OrdenPosicion).ToListAsync();
            var stories = await _context.Historias.Where(h => h.ProyectoId == projectId).ToListAsync();
            var epicIds = epicas.Select(e => e.Id).ToList();
            var features = await _context.Features.Where(f => epicIds.Contains(f.EpicaId)).OrderBy(f => f.OrdenPosicion).ToListAsync();
            var releases = await _context.Releases.Where(r => r.ProyectoId == projectId).OrderBy(r => r.OrdenPosicion).ToListAsync();
            var personas = await _context.PersonasProyecto.Where(p => p.ProyectoId == projectId).ToListAsync();
            var tickets = await _context.Tickets.Where(t => t.ProyectoId == projectId).ToListAsync();

            return new {
                proyectoId = projectId,
                personas = personas.Select(p => new { id = p.Id, nombre = p.Nombre, rol = p.Rol }),
                releases = releases.Select(r => new { id = r.Id, nombre = r.Nombre, descripcion = r.Descripcion }),
                epics = epicas.Select(e => new {
                    id = e.Id,
                    nombre = e.Titulo,
                    color = e.ColorHex ?? "#10b981",
                    features = features.Where(f => f.EpicaId == e.Id).Select(f => new {
                        id = f.Id,
                        nombre = f.Nombre,
                        color = f.ColorHex ?? e.ColorHex ?? "#10b981",
                        user_stories = stories.Where(s => s.FeatureId == f.Id).Select(s => new {
                            id = s.Id,
                            titulo = s.Titulo,
                            user = s.UsuarioNarrativo,
                            release_id = s.ReleaseId,
                            priority = s.Prioridad,
                            ticketStatus = tickets.FirstOrDefault(t => t.HistoriaId == s.Id)?.Estado ?? "Pending"
                        })
                    })
                })
            };
        }

        public async Task<int> SyncBacklogAsync(Guid projectId, Guid tenantId, bool cleanSync)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (cleanSync)
                {
                    await _context.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM agil.tickets WHERE proyecto_id = {projectId}");
                }

                var existingColumns = await _context.KanbanColumnas
                    .Where(c => c.ProyectoId == projectId)
                    .OrderBy(c => c.OrdenPosicion)
                    .ToListAsync();

                if (!existingColumns.Any())
                {
                    var defaultColumns = new List<string> { "To Do", "In Progress", "Done" };
                    for (int i = 0; i < defaultColumns.Count; i++)
                    {
                        _context.KanbanColumnas.Add(new KanbanColumna
                        {
                            Id = Guid.NewGuid(),
                            ProyectoId = projectId,
                            TenantId = tenantId,
                            Nombre = defaultColumns[i],
                            OrdenPosicion = i
                        });
                    }
                    await _context.SaveChangesAsync();
                    existingColumns = await _context.KanbanColumnas
                        .Where(c => c.ProyectoId == projectId)
                        .OrderBy(c => c.OrdenPosicion)
                        .ToListAsync();
                }

                var firstColumnName = existingColumns.First().Nombre;

                var historias = await _context.Historias.Where(h => h.ProyectoId == projectId).ToListAsync();
                var existingTickets = await _context.Tickets.Where(t => t.ProyectoId == projectId).ToListAsync();
                
                int createdCount = 0;

                foreach (var h in historias)
                {
                    if (!existingTickets.Any(t => t.HistoriaId == h.Id))
                    {
                        _context.Tickets.Add(new Ticket {
                            Id = Guid.NewGuid(),
                            ProyectoId = projectId,
                            HistoriaId = h.Id,
                            Titulo = h.Titulo,
                            Tipo = "Historia",
                            Estado = firstColumnName
                        });
                        createdCount++;

                        if (h.TareasTecnicasJson.HasValue && h.TareasTecnicasJson.Value.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var task in h.TareasTecnicasJson.Value.EnumerateArray())
                            {
                                _context.Tickets.Add(new Ticket {
                                    Id = Guid.NewGuid(),
                                    ProyectoId = projectId,
                                    HistoriaId = h.Id,
                                    Titulo = task.GetString() ?? "Tarea técnica",
                                    Tipo = "Tarea",
                                    Estado = firstColumnName
                                });
                                createdCount++;
                            }
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return createdCount;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateBddCriteriaAsync(Guid storyId, Guid tenantId, JsonElement bddCriteria)
        {
            var story = await _context.Historias.FindAsync(storyId);
            if (story != null)
            {
                story.CriteriosBdd = bddCriteria.GetRawText();
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Historia>> GetStoriesByProjectAsync(Guid projectId)
        {
            return await _context.Historias
                .Where(h => h.ProyectoId == projectId)
                .OrderBy(h => h.RangoLexicografico)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByProjectAsync(Guid projectId)
        {
            return await _context.Tickets
                .Where(t => t.ProyectoId == projectId)
                .OrderBy(t => t.RangoLexicografico)
                .ToListAsync();
        }
    }
}
