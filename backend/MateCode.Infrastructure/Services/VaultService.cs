using MateCode.Application.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public class VaultService : IVaultService
    {
        private readonly AppDbContext _context;

        public VaultService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PlantillaStack>> GetTemplatesAsync(Guid tenantId)
        {
            return await _context.PlantillasStack
                .Where(p => p.EspacioTrabajoId == tenantId)
                .ToListAsync();
        }

        public async Task<bool> DeleteTemplateAsync(Guid id, Guid tenantId)
        {
            var template = await _context.PlantillasStack
                .FirstOrDefaultAsync(p => p.Id == id && p.EspacioTrabajoId == tenantId);

            if (template == null) return false;

            _context.PlantillasStack.Remove(template);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Guid> SaveStackToVaultAsync(Guid tenantId, string nombre, JsonElement payload)
        {
            var template = new PlantillaStack
            {
                Id = Guid.NewGuid(),
                EspacioTrabajoId = tenantId,
                Nombre = nombre,
                PayloadTecnico = payload
            };

            await _context.PlantillasStack.AddAsync(template);
            await _context.SaveChangesAsync();
            return template.Id;
        }
    }
}
