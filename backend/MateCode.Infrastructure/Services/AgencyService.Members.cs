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
        public async Task<IEnumerable<Agencia>> GetAgenciesByUserAsync(Guid userId)
        {
            var owned = await _context.Agencias
                .Where(a => a.PropietarioId == userId)
                .ToListAsync();

            var memberOfIds = await _context.MiembrosAgencia
                .Where(ma => ma.UsuarioId == userId && ma.EstadoInvitacion == "Aceptada")
                .Select(ma => ma.AgenciaId)
                .ToListAsync();

            var memberOf = await _context.Agencias
                .Where(a => memberOfIds.Contains(a.Id))
                .ToListAsync();

            return owned.Concat(memberOf).DistinctBy(a => a.Id);
        }

        public async Task<Agencia> CreateAgencyAsync(string name, Guid ownerId)
        {
            var rawAgencyKey = _encryptionUtility.GenerateRandomKey();
            var encryptedAgencyKey = _encryptionUtility.EncryptAgencyKey(rawAgencyKey);

            var agency = new Agencia
            {
                Id = Guid.NewGuid(),
                Nombre = name,
                PropietarioId = ownerId,
                Tipo = "agencia",
                LlaveCifrado = encryptedAgencyKey,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.Agencias.AddAsync(agency);

            var member = new MiembroAgencia
            {
                AgenciaId = agency.Id,
                UsuarioId = ownerId,
                Rol = "Propietario",
                PermisosJson = JsonSerializer.Deserialize<JsonElement>("{}"),
                EstadoInvitacion = "Aceptada"
            };

            await _context.MiembrosAgencia.AddAsync(member);
            await _context.SaveChangesAsync();

            await LogActivityAsync(agency.Id, ownerId, "Sistema", "Agencia", "CREAR", agency.Id, new { nombre = name });

            return agency;
        }

        public async Task<IEnumerable<object>> GetAgencyMembersAsync(Guid agencyId)
        {
            return await (from member in _context.MiembrosAgencia
                           join user in _context.Usuarios on member.UsuarioId equals user.Id
                           where member.AgenciaId == agencyId
                           select new
                           {
                               user.Id,
                               user.NombreCompleto,
                               user.Email,
                               member.Rol,
                               member.PermisosJson,
                               member.EstadoInvitacion
                           }).ToListAsync();
        }

        public async Task<bool> AddMemberToAgencyAsync(Guid agencyId, Guid userId, string role, JsonElement permissions)
        {
            var exists = await _context.MiembrosAgencia.AnyAsync(m => m.AgenciaId == agencyId && m.UsuarioId == userId);
            if (exists) return false;

            var newMember = new MiembroAgencia
            {
                AgenciaId = agencyId,
                UsuarioId = userId,
                Rol = role,
                PermisosJson = permissions,
                EstadoInvitacion = "Pendiente"
            };

            await _context.MiembrosAgencia.AddAsync(newMember);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> InviteMemberToAgencyAsync(Guid agencyId, string email, string role = "Colaborador", JsonElement? permissions = null)
        {
            var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
            if (user == null) return false;

            var permJson = permissions ?? JsonSerializer.Deserialize<JsonElement>("{}");
            return await AddMemberToAgencyAsync(agencyId, user.Id, role, permJson);
        }

        public async Task<bool> UpdateMemberPermissionsAsync(Guid agencyId, Guid userId, string role, JsonElement permissions)
        {
            var member = await _context.MiembrosAgencia
                .FirstOrDefaultAsync(m => m.AgenciaId == agencyId && m.UsuarioId == userId);

            if (member == null) return false;

            member.Rol = role;
            member.PermisosJson = permissions;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<object>> GetPendingInvitationsAsync(Guid userId)
        {
            return await (from member in _context.MiembrosAgencia
                           join agency in _context.Agencias on member.AgenciaId equals agency.Id
                           where member.UsuarioId == userId && member.EstadoInvitacion == "Pendiente"
                           select new
                           {
                               AgencyId = agency.Id,
                               AgencyNombre = agency.Nombre,
                               RolInvitado = member.Rol
                           }).ToListAsync();
        }

        public async Task<bool> AcceptInvitationAsync(Guid userId, Guid agencyId)
        {
            var member = await _context.MiembrosAgencia
                .FirstOrDefaultAsync(m => m.UsuarioId == userId && m.AgenciaId == agencyId);

            if (member == null) return false;

            member.EstadoInvitacion = "Aceptada";
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> RejectInvitationAsync(Guid userId, Guid agencyId)
        {
            var member = await _context.MiembrosAgencia
                .FirstOrDefaultAsync(m => m.UsuarioId == userId && m.AgenciaId == agencyId);

            if (member == null) return false;

            _context.MiembrosAgencia.Remove(member);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<EspacioTrabajo>> GetWorkspacesByAgencyAsync(Guid agencyId)
        {
            return await _context.EspaciosTrabajo
                .Where(et => et.AgenciaId == agencyId)
                .ToListAsync();
        }
    }
}
