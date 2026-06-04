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
        public async Task<IEnumerable<Cliente>> GetLeadsAsync(Guid agencyId)
        {
            return await _context.Clientes
                .Where(l => l.AgenciaId == agencyId)
                .OrderBy(l => l.RangoLexicografico)
                .ToListAsync();
        }

        public async Task<Cliente> CreateLeadAsync(Guid agencyId, string nombre, string email, string category, string qualification, string origen, string motivo, string descripcion)
        {
            var lead = new Cliente
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                EspacioTrabajoId = null,
                Nombre = nombre,
                Email = email,
                Estado = "potencial",
                Categoria = category,
                Calificacion = qualification,
                OrigenContacto = origen,
                MotivoContacto = motivo,
                Descripcion = descripcion,
                Notas = JsonSerializer.Deserialize<JsonElement>("[]"),
                RangoLexicografico = "a",
                FechaCreacion = DateTime.UtcNow,
                TokenEnlaceMagico = Guid.NewGuid().ToString("N"),
                ContextoJson = JsonSerializer.Deserialize<JsonElement>("{}")
            };

            await _context.Clientes.AddAsync(lead);
            await _context.SaveChangesAsync();
            return lead;
        }

        public async Task<bool> UpdateLeadStatusAsync(Guid leadId, string category, string position)
        {
            var lead = await _context.Clientes.FindAsync(leadId);
            if (lead == null) return false;

            lead.Categoria = category;
            lead.RangoLexicografico = position;

            if (category.Equals("Aceptado", StringComparison.OrdinalIgnoreCase))
            {
                lead.Estado = "aprobado";
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateLeadAsync(Guid leadId, string nombre, string email, string category, string qualification, string origen, string motivo, string descripcion, JsonElement notas)
        {
            var lead = await _context.Clientes.FindAsync(leadId);
            if (lead == null) return false;

            lead.Nombre = nombre;
            lead.Email = email;
            lead.Categoria = category;
            lead.Calificacion = qualification;
            lead.OrigenContacto = origen;
            lead.MotivoContacto = motivo;
            lead.Descripcion = descripcion;
            lead.Notas = notas;

            if (category.Equals("Aceptado", StringComparison.OrdinalIgnoreCase))
            {
                lead.Estado = "aprobado";
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteLeadAsync(Guid leadId)
        {
            var lead = await _context.Clientes.FindAsync(leadId);
            if (lead == null) return false;

            _context.Clientes.Remove(lead);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
