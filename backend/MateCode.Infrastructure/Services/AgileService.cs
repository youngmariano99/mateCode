using MateCode.Application.Services;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using System.Collections.Generic;

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
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM agil.historias WHERE proyecto_id = {0}", projectId);
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM agil.epicas WHERE proyecto_id = {0}", projectId);

                foreach (var epicNode in storyMapData.EnumerateArray())
                {
                    var epicaId = Guid.NewGuid();
                    var tituloEpica = epicNode.GetProperty("title").GetString() ?? "Épica sin título";
                    
                    var insertEpic = @"INSERT INTO agil.epicas (id, proyecto_id, titulo) VALUES ({0}, {1}, {2})";
                    await _context.Database.ExecuteSqlRawAsync(insertEpic, epicaId, projectId, tituloEpica);

                    if (epicNode.TryGetProperty("stories", out var storiesNode))
                    {
                        foreach (var storyNode in storiesNode.EnumerateArray())
                        {
                            var historiaId = Guid.NewGuid();
                            var tituloHistoria = storyNode.GetProperty("title").GetString() ?? "Historia sin título";
                            
                            var insertStory = @"
                                INSERT INTO agil.historias (id, epica_id, proyecto_id, titulo) 
                                VALUES ({0}, {1}, {2}, {3})";
                            await _context.Database.ExecuteSqlRawAsync(insertStory, historiaId, epicaId, projectId, tituloHistoria);
                        }
                    }
                }

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateBddCriteriaAsync(Guid storyId, Guid tenantId, JsonElement bddCriteria)
        {
            var updateBdd = @"
                UPDATE agil.historias h 
                SET criterios_bdd = {0} 
                FROM proyectos.proyectos p 
                WHERE h.proyecto_id = p.id AND h.id = {1} AND p.tenant_id = {2}";
                
            await _context.Database.ExecuteSqlRawAsync(updateBdd, bddCriteria.GetRawText(), storyId, tenantId);
        }

        public async Task<IEnumerable<Historia>> GetStoriesByProjectAsync(Guid projectId)
        {
            return await _context.Historias
                .Where(h => h.ProyectoId == projectId)
                .OrderBy(h => h.RangoLexicografico)
                .ToListAsync();
        }
    }
}
