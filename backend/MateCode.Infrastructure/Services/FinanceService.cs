using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Application.Services;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public class FinanceService : IFinanceService
    {
        private readonly AppDbContext _context;

        public FinanceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PerfilEmpresa>> GetPerfilesAsync(Guid tenantId)
        {
            return await _context.PerfilesEmpresa
                .Where(p => p.EspacioTrabajoId == tenantId)
                .ToListAsync();
        }

        public async Task<Presupuesto> CreatePresupuestoAsync(Presupuesto presupuesto, Guid tenantId)
        {
            var perfilValido = await _context.PerfilesEmpresa
                .AnyAsync(p => p.Id == presupuesto.PerfilId && p.EspacioTrabajoId == tenantId);
                
            if (!perfilValido)
                throw new UnauthorizedAccessException("El perfil de empresa no pertenece a este espacio de trabajo.");

            _context.Presupuestos.Add(presupuesto);
            await _context.SaveChangesAsync();
            return presupuesto;
        }

        public async Task<Presupuesto?> GetPresupuestoByProyectoAsync(Guid proyectoId, Guid tenantId)
        {
            var presupuesto = await (from pr in _context.Presupuestos
                                     join py in _context.Proyectos on pr.ProyectoId equals py.Id
                                     where pr.ProyectoId == proyectoId && py.TenantId == tenantId
                                     select pr).FirstOrDefaultAsync();
                
            return presupuesto;
        }
    }
}
