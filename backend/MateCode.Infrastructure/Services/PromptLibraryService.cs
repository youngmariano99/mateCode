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
            var query = _context.PlantillasPrompt
                .Where(p => p.TenantId == tenantId || p.TenantId == globalId);
            
            if (!string.IsNullOrEmpty(fase))
            {
                query = query.Where(p => p.FaseObjetivo == fase);
            }

            return await query.OrderByDescending(p => p.FechaCreacion).ToListAsync();
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
