using MateCode.Application.Services;
using System;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;

namespace MateCode.Infrastructure.Services
{
    public class HarvestService : IHarvestService
    {
        private readonly AppDbContext _context;

        public HarvestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> ExportToVaultAsync(Guid projectId, Guid tenantId, JsonElement projectPayload)
        {
            var sanitizedPayload = SanitizePayload(projectPayload);
            var vaultId = Guid.NewGuid();

            var sql = @"
                INSERT INTO boveda.portafolios (id, espacio_trabajo_id, proyecto_original_id, payload_limpio) 
                VALUES ({0}, {1}, {2}, {3}::jsonb)";

            await _context.Database.ExecuteSqlRawAsync(sql, vaultId, tenantId, projectId, sanitizedPayload);
            return vaultId;
        }

        private string SanitizePayload(JsonElement payload)
        {
            var jsonString = payload.GetRawText();
            jsonString = Regex.Replace(jsonString, @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "[REDACTED_EMAIL]");
            jsonString = Regex.Replace(jsonString, @"(\""password\""\s*:\s*\"")[^\""]+(\"")", "$1[REDACTED_SECRET]$2");
            jsonString = Regex.Replace(jsonString, @"(\""bearer_token\""\s*:\s*\"")[^\""]+(\"")", "$1[REDACTED_TOKEN]$2");

            return jsonString;
        }
    }
}
