using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MateCode.Application.Services;
using MateCode.Core.Entities;
using MateCode.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MateCode.Infrastructure.Services
{
    public class FormLibraryService : IFormLibraryService
    {
        private readonly AppDbContext _context;

        public FormLibraryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FormularioPlantilla>> GetFormsAsync(Guid? tenantId, Guid? agencyId, Guid userId, string? tipo = null)
        {
            var query = _context.FormulariosPlantilla.AsQueryable();

            if (agencyId.HasValue)
            {
                query = query.Where(f => f.AgenciaId == agencyId.Value || (f.AgenciaId == null && f.TenantId == null) || f.CreadorId == userId);
            }
            else if (tenantId.HasValue)
            {
                query = query.Where(f => f.TenantId == tenantId.Value || f.TenantId == null || f.CreadorId == userId);
            }
            else
            {
                query = query.Where(f => f.TenantId == null || f.CreadorId == userId);
            }

            if (!string.IsNullOrEmpty(tipo))
                query = query.Where(f => f.Tipo == tipo);

            return await query.ToListAsync();
        }

        public async Task<FormularioPlantilla> GetFormByIdAsync(Guid id, Guid? tenantId, Guid? agencyId, Guid userId)
        {
            var query = _context.FormulariosPlantilla.AsQueryable();

            if (agencyId.HasValue)
            {
                return await query.FirstOrDefaultAsync(f => f.Id == id && (f.AgenciaId == agencyId.Value || (f.AgenciaId == null && f.TenantId == null) || f.CreadorId == userId));
            }
            
            return await query.FirstOrDefaultAsync(f => f.Id == id && (f.TenantId == tenantId || f.TenantId == null || f.CreadorId == userId));
        }

        public async Task<FormularioPlantilla> CreateFormAsync(FormularioPlantilla form)
        {
            form.Id = Guid.NewGuid();
            _context.FormulariosPlantilla.Add(form);
            await _context.SaveChangesAsync();
            return form;
        }

        public async Task UpdateFormAsync(FormularioPlantilla form)
        {
            _context.FormulariosPlantilla.Update(form);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteFormAsync(Guid id, Guid? tenantId, Guid? agencyId, Guid userId)
        {
            FormularioPlantilla? form = null;
            if (agencyId.HasValue)
            {
                form = await _context.FormulariosPlantilla.FirstOrDefaultAsync(f => f.Id == id && (f.AgenciaId == agencyId.Value || f.CreadorId == userId));
            }
            else
            {
                form = await _context.FormulariosPlantilla.FirstOrDefaultAsync(f => f.Id == id && (f.TenantId == tenantId || f.CreadorId == userId));
            }

            if (form != null)
            {
                _context.FormulariosPlantilla.Remove(form);
                await _context.SaveChangesAsync();
            }
        }
    }
}
