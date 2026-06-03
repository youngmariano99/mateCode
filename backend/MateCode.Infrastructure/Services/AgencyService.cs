using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Application.Services;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public partial class AgencyService : IAgencyService
    {
        private readonly AppDbContext _context;
        private readonly IEncryptionUtility _encryptionUtility;

        public AgencyService(AppDbContext context, IEncryptionUtility encryptionUtility)
        {
            _context = context;
            _encryptionUtility = encryptionUtility;
        }

        // --- AUDITORÍA INMUTABLE ---
        public async Task LogActivityAsync(Guid agencyId, Guid userId, string userName, string modulo, string accion, Guid? registroId, object detalles)
        {
            var log = new AuditLog
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                UsuarioId = userId,
                NombreUsuario = userName,
                Modulo = modulo,
                Accion = accion,
                RegistroId = registroId,
                Detalles = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(detalles)),
                Fecha = DateTime.UtcNow
            };

            await _context.AuditLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsAsync(Guid agencyId)
        {
            return await _context.AuditLogs
                .Where(al => al.AgenciaId == agencyId)
                .OrderByDescending(al => al.Fecha)
                .Take(200)
                .ToListAsync();
        }
    }
}
