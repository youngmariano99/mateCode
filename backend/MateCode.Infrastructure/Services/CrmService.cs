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
    public class CrmService : ICrmService
    {
        private readonly AppDbContext _context;

        public CrmService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Cliente>> GetLeadsAsync(Guid tenantId)
        {
            return await _context.Clientes
                .Where(c => c.EspacioTrabajoId == tenantId && c.Estado == "potencial")
                .ToListAsync();
        }

        public async Task<IEnumerable<Cliente>> GetClientsAsync(Guid tenantId)
        {
            return await _context.Clientes
                .Where(c => c.EspacioTrabajoId == tenantId && c.Estado == "aprobado")
                .ToListAsync();
        }

        public async Task<Guid> CreateLeadAsync(Guid tenantId, string sourceUrl, JsonElement rawData)
        {
            var lead = new Cliente
            {
                Id = Guid.NewGuid(),
                EspacioTrabajoId = tenantId,
                Nombre = rawData.TryGetProperty("fullName", out var name) ? name.GetString() ?? "Sin Nombre" : "Nuevo Lead",
                Email = rawData.TryGetProperty("email", out var email) ? email.GetString() ?? "" : "sin@email.com",
                Estado = "potencial",
                TokenEnlaceMagico = Guid.NewGuid().ToString("N")
            };

            await _context.Clientes.AddAsync(lead);
            await _context.SaveChangesAsync();
            return lead.Id;
        }

        public async Task<Guid> ApproveLeadAsync(Guid leadId, Guid tenantId)
        {
            var lead = await _context.Clientes
                .FirstOrDefaultAsync(c => c.Id == leadId && c.EspacioTrabajoId == tenantId);

            if (lead == null) throw new Exception("Lead no encontrado");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                lead.Estado = "aprobado";

                var proyecto = new Proyecto
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ClienteId = lead.Id,
                    Nombre = $"Proyecto: {lead.Nombre}",
                    FaseActual = "Fase 0 - Factibilidad",
                    FechaCreacion = DateTime.UtcNow,
                    ContextoJson = JsonSerializer.Deserialize<JsonElement>("{}")
                };

                await _context.Proyectos.AddAsync(proyecto);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return proyecto.Id;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
