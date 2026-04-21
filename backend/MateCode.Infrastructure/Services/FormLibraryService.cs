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

        public async Task<IEnumerable<FormularioPlantilla>> GetFormsAsync(Guid tenantId, string? tipo = null)
        {
            var query = _context.FormulariosPlantilla
                .Where(f => f.TenantId == tenantId || f.TenantId == Guid.Empty);

            if (!string.IsNullOrEmpty(tipo))
                query = query.Where(f => f.Tipo == tipo);

            return await query.ToListAsync();
        }

        public async Task<FormularioPlantilla> GetFormByIdAsync(Guid id, Guid tenantId)
        {
            return await _context.FormulariosPlantilla
                .FirstOrDefaultAsync(f => f.Id == id && (f.TenantId == tenantId || f.TenantId == Guid.Empty));
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
    }
}
