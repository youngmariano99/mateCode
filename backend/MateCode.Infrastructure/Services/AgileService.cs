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
                // 1. Cargar estado actual (para Smart Merge)
                var existingEpics = await _context.Epicas.Where(e => e.ProyectoId == projectId).ToListAsync();
                var existingFeatures = await _context.Features.Where(f => existingEpics.Select(e => e.Id).Contains(f.EpicaId)).ToListAsync();
                var existingStories = await _context.Historias.Where(h => h.ProyectoId == projectId).ToListAsync();
                var existingReleases = await _context.Releases.Where(r => r.ProyectoId == projectId).ToListAsync();
                var existingPersonas = await _context.PersonasProyecto.Where(p => p.ProyectoId == projectId).ToListAsync();

                // 2. Guardar Personas (Update or Create)
                if (storyMapData.TryGetProperty("personas", out var personasNode))
                {
                    foreach (var p in personasNode.EnumerateArray())
                    {
                        var pName = p.GetProperty("nombre").GetString() ?? "Anon";
                        var persona = existingPersonas.FirstOrDefault(ep => ep.Nombre == pName);
                        if (persona == null)
                        {
                            persona = new PersonaProyecto { Id = Guid.NewGuid(), ProyectoId = projectId };
                            _context.PersonasProyecto.Add(persona);
                        }
                        persona.Nombre = pName;
                        persona.Rol = p.GetProperty("rol").GetString() ?? "Usuario";
                    }
                    // Soft Delete Personas (físico por ahora ya que no tienen IsDeleted, o podrías añadirlo si es crítico)
                }

                // 3. Guardar Releases
                var releaseIdMap = new Dictionary<string, Guid>();
                if (storyMapData.TryGetProperty("releases", out var releasesNode))
                {
                    int idx = 0;
                    foreach (var r in releasesNode.EnumerateArray())
                    {
                        var rname = r.GetProperty("nombre").GetString() ?? "V1";
                        var rKey = r.TryGetProperty("id", out var idNode) ? idNode.GetString() : rname;
                        
                        var release = existingReleases.FirstOrDefault(er => er.Nombre == rname);
                        if (release == null)
                        {
                            release = new Release { Id = Guid.NewGuid(), ProyectoId = projectId };
                            _context.Releases.Add(release);
                        }
                        release.Nombre = rname;
                        release.Descripcion = r.TryGetProperty("descripcion", out var d) ? d.GetString() : "";
                        release.OrdenPosicion = idx++;
                        
                        if (rKey != null) releaseIdMap[rKey] = release.Id;
                    }
                }

                await _context.SaveChangesAsync();

                // 4. Guardar Jerarquía Epics -> Features -> Stories (Smart Merge)
                var processedEpics = new HashSet<Guid>();
                var processedFeatures = new HashSet<Guid>();
                var processedStories = new HashSet<Guid>();

                if (storyMapData.TryGetProperty("epics", out var epicsNode))
                {
                    int epicIdx = 0;
                    foreach (var epicNode in epicsNode.EnumerateArray())
                    {
                        var epicName = epicNode.GetProperty("nombre").GetString() ?? "Sin Título";
                        var epic = existingEpics.FirstOrDefault(e => e.Titulo == epicName);
                        if (epic == null)
                        {
                            epic = new Epica { Id = Guid.NewGuid(), ProyectoId = projectId };
                            _context.Epicas.Add(epic);
                        }
                        epic.Titulo = epicName;
                        epic.ColorHex = epicNode.TryGetProperty("color", out var c) ? c.GetString() : "#10b981";
                        epic.OrdenPosicion = epicIdx++;
                        epic.IsDeleted = false;
                        processedEpics.Add(epic.Id);

                        if (epicNode.TryGetProperty("features", out var featuresNode))
                        {
                            int featIdx = 0;
                            foreach (var featNode in featuresNode.EnumerateArray())
                            {
                                var featName = featNode.GetProperty("nombre").GetString() ?? "Feature";
                                var feature = existingFeatures.FirstOrDefault(f => f.Nombre == featName && f.EpicaId == epic.Id);
                                if (feature == null)
                                {
                                    feature = new Feature { Id = Guid.NewGuid(), EpicaId = epic.Id };
                                    _context.Features.Add(feature);
                                }
                                feature.Nombre = featName;
                                feature.ColorHex = featNode.TryGetProperty("color", out var fc) ? fc.GetString() : epic.ColorHex;
                                feature.OrdenPosicion = featIdx++;
                                feature.IsDeleted = false;
                                processedFeatures.Add(feature.Id);

                                if (featNode.TryGetProperty("user_stories", out var storiesNode))
                                {
                                    foreach (var storyNode in storiesNode.EnumerateArray())
                                    {
                                        var storyTitle = storyNode.GetProperty("titulo").GetString() ?? "US";
                                        var rKey = storyNode.TryGetProperty("release_id", out var rNode) ? rNode.GetString() : null;
                                        var rid = rKey != null && releaseIdMap.ContainsKey(rKey) ? releaseIdMap[rKey] : (Guid?)null;

                                        var historia = existingStories.FirstOrDefault(h => h.Titulo == storyTitle && h.FeatureId == feature.Id);
                                        if (historia == null)
                                        {
                                            historia = new Historia { Id = Guid.NewGuid(), ProyectoId = projectId, FeatureId = feature.Id };
                                            _context.Historias.Add(historia);
                                        }
                                        historia.ReleaseId = rid;
                                        historia.Titulo = storyTitle;
                                        historia.UsuarioNarrativo = storyNode.TryGetProperty("user", out var u) ? u.GetString() : "Usuario";
                                        historia.Prioridad = storyNode.TryGetProperty("prioridad", out var prio) ? prio.GetString() : "MVP";
                                        historia.CriteriosAceptacion = storyNode.TryGetProperty("criterios_aceptacion", out var ca) ? ca : (JsonElement?)null;
                                        historia.CriteriosBdd = storyNode.TryGetProperty("bdd", out var bdd) ? bdd.GetString() : historia.CriteriosBdd;
                                        historia.IsDeleted = false;
                                        processedStories.Add(historia.Id);
                                    }
                                }
                            }
                        }
                    }
                }

                // 5. Aplicar Soft Delete a lo que no vino en el JSON
                foreach (var e in existingEpics.Where(e => !processedEpics.Contains(e.Id))) { e.IsDeleted = true; e.DeletedAt = DateTime.UtcNow; }
                foreach (var f in existingFeatures.Where(f => !processedFeatures.Contains(f.Id))) { f.IsDeleted = true; f.DeletedAt = DateTime.UtcNow; }
                foreach (var h in existingStories.Where(h => !processedStories.Contains(h.Id))) { h.IsDeleted = true; h.DeletedAt = DateTime.UtcNow; }

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
            var epicas = await _context.Epicas.Where(e => e.ProyectoId == projectId && !e.IsDeleted).OrderBy(e => e.OrdenPosicion).ToListAsync();
            var stories = await _context.Historias.Where(h => h.ProyectoId == projectId && !h.IsDeleted).ToListAsync();
            var epicIds = epicas.Select(e => e.Id).ToList();
            var features = epicIds.Any() 
                ? await _context.Features.Where(f => epicIds.Contains(f.EpicaId) && !f.IsDeleted).OrderBy(f => f.OrdenPosicion).ToListAsync()
                : new List<Feature>();
            var releases = await _context.Releases.Where(r => r.ProyectoId == projectId).OrderBy(r => r.OrdenPosicion).ToListAsync();
            var personas = await _context.PersonasProyecto.Where(p => p.ProyectoId == projectId).ToListAsync();
            var tickets = await _context.Tickets.Where(t => t.ProyectoId == projectId && !t.IsDeleted).ToListAsync();

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
                    // Marcamos como borrados en lugar de DELETE físico
                    var tickets = await _context.Tickets.Where(t => t.ProyectoId == projectId).ToListAsync();
                    foreach (var t in tickets) { t.IsDeleted = true; t.DeletedAt = DateTime.UtcNow; }
                    await _context.SaveChangesAsync();
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

                var historias = await _context.Historias.Where(h => h.ProyectoId == projectId && !h.IsDeleted).ToListAsync();
                var existingTickets = await _context.Tickets.Where(t => t.ProyectoId == projectId && !t.IsDeleted).ToListAsync();
                
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
                .Where(h => h.ProyectoId == projectId && !h.IsDeleted)
                .OrderBy(h => h.RangoLexicografico)
                .ToListAsync();
        }

        public async Task<IEnumerable<PersonaProyecto>> GetPersonasByProjectAsync(Guid projectId)
        {
            return await _context.PersonasProyecto
                .Where(p => p.ProyectoId == projectId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByProjectAsync(Guid projectId)
        {
            return await _context.Tickets
                .Where(t => t.ProyectoId == projectId && !t.IsDeleted)
                .OrderBy(t => t.RangoLexicografico)
                .ToListAsync();
        }
    }
}
