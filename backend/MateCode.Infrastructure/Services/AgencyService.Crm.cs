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
                .Where(l => l.AgenciaId == agencyId && l.Activo)
                .OrderBy(l => l.RangoLexicografico)
                .ToListAsync();
        }

        public async Task<IEnumerable<string>> GetUniqueRubrosAsync(Guid agencyId)
        {
            return await _context.Clientes
                .Where(l => l.AgenciaId == agencyId && l.Activo && !string.IsNullOrEmpty(l.Rubro))
                .Select(l => l.Rubro!)
                .Distinct()
                .OrderBy(r => r)
                .ToListAsync();
        }

        public async Task<Cliente> CreateLeadAsync(
            Guid agencyId, 
            string nombre, 
            string email, 
            string category, 
            string qualification, 
            string origen, 
            string motivo, 
            string descripcion,
            string? rubro = null,
            string? direccionTexto = null,
            double? latitud = null,
            double? longitud = null,
            string[]? etiquetasRapidas = null,
            string? tipoSoftwareTiene = null,
            string? tipoSoftwareQuiere = null,
            string? doloresNotas = null,
            JsonElement? bitacoraContactos = null,
            JsonElement? linksRecursos = null)
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
                ContextoJson = JsonSerializer.Deserialize<JsonElement>("{}"),
                Activo = true,
                Rubro = rubro,
                DireccionTexto = direccionTexto,
                Latitud = latitud,
                Longitud = longitud,
                EtiquetasRapidas = etiquetasRapidas ?? Array.Empty<string>(),
                TipoSoftwareTiene = tipoSoftwareTiene,
                TipoSoftwareQuiere = tipoSoftwareQuiere,
                DoloresNotas = doloresNotas,
                BitacoraContactos = bitacoraContactos ?? JsonSerializer.Deserialize<JsonElement>("[]"),
                LinksRecursos = linksRecursos ?? JsonSerializer.Deserialize<JsonElement>("[]")
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

        public async Task<bool> UpdateLeadAsync(
            Guid leadId, 
            string nombre, 
            string email, 
            string category, 
            string qualification, 
            string origen, 
            string motivo, 
            string descripcion, 
            JsonElement notas,
            string? rubro = null,
            string? direccionTexto = null,
            double? latitud = null,
            double? longitud = null,
            string[]? etiquetasRapidas = null,
            string? tipoSoftwareTiene = null,
            string? tipoSoftwareQuiere = null,
            string? doloresNotas = null,
            JsonElement? bitacoraContactos = null,
            JsonElement? linksRecursos = null)
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
            
            if (notas.ValueKind != JsonValueKind.Undefined)
            {
                lead.Notas = notas;
            }

            if (category.Equals("Aceptado", StringComparison.OrdinalIgnoreCase))
            {
                lead.Estado = "aprobado";
            }

            lead.Rubro = rubro;
            lead.DireccionTexto = direccionTexto;
            lead.Latitud = latitud;
            lead.Longitud = longitud;
            if (etiquetasRapidas != null)
            {
                lead.EtiquetasRapidas = etiquetasRapidas;
            }
            lead.TipoSoftwareTiene = tipoSoftwareTiene;
            lead.TipoSoftwareQuiere = tipoSoftwareQuiere;
            lead.DoloresNotas = doloresNotas;
            if (bitacoraContactos.HasValue && bitacoraContactos.Value.ValueKind != JsonValueKind.Undefined)
            {
                lead.BitacoraContactos = bitacoraContactos.Value;
            }
            if (linksRecursos.HasValue && linksRecursos.Value.ValueKind != JsonValueKind.Undefined)
            {
                lead.LinksRecursos = linksRecursos.Value;
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteLeadAsync(Guid leadId)
        {
            var lead = await _context.Clientes.FindAsync(leadId);
            if (lead == null) return false;

            lead.Activo = false;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<CrmColumna>> GetCrmColumnsAsync(Guid agencyId)
        {
            return await _context.CrmColumnas
                .Where(c => c.AgenciaId == agencyId)
                .OrderBy(c => c.Orden)
                .ToListAsync();
        }

        public async Task<CrmColumna> CreateCrmColumnAsync(Guid agencyId, string key, string label, int orden)
        {
            var col = new CrmColumna
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                Key = key,
                Label = label,
                Orden = orden,
                FechaCreacion = DateTime.UtcNow
            };
            await _context.CrmColumnas.AddAsync(col);
            await _context.SaveChangesAsync();
            return col;
        }

        public async Task<CrmColumna?> UpdateCrmColumnAsync(Guid agencyId, Guid columnId, string label, int orden)
        {
            var col = await _context.CrmColumnas.FirstOrDefaultAsync(c => c.Id == columnId && c.AgenciaId == agencyId);
            if (col == null) return null;

            col.Label = label;
            col.Orden = orden;
            await _context.SaveChangesAsync();
            return col;
        }

        public async Task<bool> DeleteCrmColumnAsync(Guid agencyId, Guid columnId)
        {
            var col = await _context.CrmColumnas.FirstOrDefaultAsync(c => c.Id == columnId && c.AgenciaId == agencyId);
            if (col == null) return false;

            // Reasignación automática de seguridad
            var affectedLeads = await _context.Clientes
                .Where(l => l.AgenciaId == agencyId && l.Categoria == col.Key && l.Activo)
                .ToListAsync();

            foreach (var lead in affectedLeads)
            {
                lead.Categoria = "Lead";
            }

            _context.CrmColumnas.Remove(col);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
