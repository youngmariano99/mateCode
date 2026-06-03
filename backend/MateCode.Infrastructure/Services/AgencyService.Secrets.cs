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
        private async Task<string> GetDecryptedAgencyKeyAsync(Guid agencyId)
        {
            var agency = await _context.Agencias.FindAsync(agencyId);
            if (agency == null) throw new Exception("Agencia no encontrada.");

            if (agency.LlaveCifrado == "ZXZjX2tleV9wbGFjZWhvbGRlcg==")
            {
                var rawKey = _encryptionUtility.GenerateRandomKey();
                agency.LlaveCifrado = _encryptionUtility.EncryptAgencyKey(rawKey);
                await _context.SaveChangesAsync();
                return rawKey;
            }

            return _encryptionUtility.DecryptAgencyKey(agency.LlaveCifrado);
        }

        public async Task<IEnumerable<object>> GetSecretsListAsync(Guid agencyId)
        {
            return await _context.CredencialesSeguras
                .Where(c => c.AgenciaId == agencyId)
                .OrderBy(c => c.Servicio)
                .Select(c => new
                {
                    c.Id,
                    c.Servicio,
                    c.Usuario,
                    c.UrlAcceso,
                    c.RolesPermitidos,
                    c.FechaCreacion,
                    c.FechaActualizacion
                })
                .ToListAsync();
        }

        public async Task<string> RevealSecretAsync(Guid secretId, Guid userId, string userName)
        {
            var secret = await _context.CredencialesSeguras.FindAsync(secretId);
            if (secret == null) throw new Exception("Credencial no encontrada.");

            var agencyKey = await GetDecryptedAgencyKeyAsync(secret.AgenciaId);
            var plaintext = _encryptionUtility.Decrypt(secret.ClaveEncriptada, agencyKey);

            await LogActivityAsync(secret.AgenciaId, userId, userName, "Accesos", "LEER_ACCESO", secretId, new { servicio = secret.Servicio });

            return plaintext;
        }

        public async Task<CredencialSegura> CreateSecretAsync(Guid agencyId, string servicio, string usuario, string plaintextPassword, string urlAcceso, JsonElement rolesPermitidos)
        {
            var agencyKey = await GetDecryptedAgencyKeyAsync(agencyId);
            var encrypted = _encryptionUtility.Encrypt(plaintextPassword, agencyKey);

            var secret = new CredencialSegura
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                Servicio = servicio,
                Usuario = usuario,
                ClaveEncriptada = encrypted,
                UrlAcceso = urlAcceso,
                RolesPermitidos = rolesPermitidos,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow
            };

            await _context.CredencialesSeguras.AddAsync(secret);
            await _context.SaveChangesAsync();
            return secret;
        }

        public async Task<bool> DeleteSecretAsync(Guid secretId)
        {
            var secret = await _context.CredencialesSeguras.FindAsync(secretId);
            if (secret == null) return false;

            _context.CredencialesSeguras.Remove(secret);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
