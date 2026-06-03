using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public partial class AgencyService
    {
        public async Task<IEnumerable<LeadAgencia>> GetLeadsAsync(Guid agencyId)
        {
            return await _context.LeadsAgencia
                .Where(l => l.AgenciaId == agencyId)
                .OrderBy(l => l.RangoLexicografico)
                .ToListAsync();
        }

        public async Task<LeadAgencia> CreateLeadAsync(Guid agencyId, string nombre, string email, string category, string qualification, string origen, string motivo, string descripcion)
        {
            var lead = new LeadAgencia
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                Nombre = nombre,
                Email = email,
                Categoria = category,
                Calificacion = qualification,
                OrigenContacto = origen,
                MotivoContacto = motivo,
                Descripcion = descripcion,
                Notas = JsonSerializer.Deserialize<JsonElement>("[]"),
                RangoLexicografico = "a",
                FechaCreacion = DateTime.UtcNow
            };

            await _context.LeadsAgencia.AddAsync(lead);
            await _context.SaveChangesAsync();
            return lead;
        }

        public async Task<bool> UpdateLeadStatusAsync(Guid leadId, string category, string position)
        {
            var lead = await _context.LeadsAgencia.FindAsync(leadId);
            if (lead == null) return false;

            lead.Categoria = category;
            lead.RangoLexicografico = position;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateLeadAsync(Guid leadId, string nombre, string email, string category, string qualification, string origen, string motivo, string descripcion, JsonElement notas)
        {
            var lead = await _context.LeadsAgencia.FindAsync(leadId);
            if (lead == null) return false;

            lead.Nombre = nombre;
            lead.Email = email;
            lead.Categoria = category;
            lead.Calificacion = qualification;
            lead.OrigenContacto = origen;
            lead.MotivoContacto = motivo;
            lead.Descripcion = descripcion;
            lead.Notas = notas;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteLeadAsync(Guid leadId)
        {
            var lead = await _context.LeadsAgencia.FindAsync(leadId);
            if (lead == null) return false;

            _context.LeadsAgencia.Remove(lead);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
