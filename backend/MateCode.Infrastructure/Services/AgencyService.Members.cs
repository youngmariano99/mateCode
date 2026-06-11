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
                .Where(a => a.PropietarioId == userId && a.Activo)
                .ToListAsync();

            var memberOfIds = await _context.MiembrosAgencia
                .Where(ma => ma.UsuarioId == userId && ma.EstadoInvitacion == "Aceptada")
                .Select(ma => ma.AgenciaId)
                .ToListAsync();

            var memberOf = await _context.Agencias
                .Where(a => memberOfIds.Contains(a.Id) && a.Activo)
                .ToListAsync();

            return owned.Concat(memberOf).DistinctBy(a => a.Id);
        }

        public async Task<Agencia> CreateAgencyAsync(string name, Guid ownerId)
        {
            var rawAgencyKey = _encryptionUtility.GenerateRandomKey();
            var encryptedAgencyKey = _encryptionUtility.EncryptAgencyKey(rawAgencyKey);

            var emptyJson = JsonSerializer.Deserialize<JsonElement>("{}");
            var agency = new Agencia
            {
                Id = Guid.NewGuid(),
                Nombre = name,
                PropietarioId = ownerId,
                Tipo = "agencia",
                LlaveCifrado = encryptedAgencyKey,
                FechaCreacion = DateTime.UtcNow,
                RedesSociales = emptyJson,
                Branding = emptyJson,
                Mision = "",
                Vision = "",
                DatosMarketing = emptyJson
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
            var agency = await _context.Agencias.FindAsync(agencyId);
            var membersList = await (from member in _context.MiembrosAgencia
                                     join user in _context.Usuarios on member.UsuarioId equals user.Id
                                     where member.AgenciaId == agencyId
                                     select new
                                     {
                                         agencia_id = member.AgenciaId,
                                         usuario_id = member.UsuarioId,
                                         rol = member.Rol,
                                         estado_invitacion = member.EstadoInvitacion,
                                         permisos_json = member.PermisosJson,
                                         usuario = new {
                                             id = user.Id,
                                             email = user.Email,
                                             nombre_completo = user.NombreCompleto,
                                             nombre_usuario = user.NombreUsuario
                                         }
                                     }).ToListAsync();

            if (agency != null)
            {
                var ownerUser = await _context.Usuarios.FindAsync(agency.PropietarioId);
                if (ownerUser != null && !membersList.Any(m => m.usuario_id == ownerUser.Id))
                {
                    var emptyJson = JsonSerializer.Deserialize<JsonElement>("{}");
                    membersList.Insert(0, new
                    {
                        agencia_id = agency.Id,
                        usuario_id = ownerUser.Id,
                        rol = "Propietario",
                        estado_invitacion = "Aceptada",
                        permisos_json = emptyJson,
                        usuario = new {
                            id = ownerUser.Id,
                            email = ownerUser.Email,
                            nombre_completo = ownerUser.NombreCompleto,
                            nombre_usuario = ownerUser.NombreUsuario
                        }
                    });
                }
            }

            return membersList;
        }

        private async Task SyncWorkspaceAndProjectMembersAsync(Guid agencyId, Guid userId, string invitationState, string role, JsonElement permissions)
        {
            string roleTag = "";
            var workspacesDict = new Dictionary<Guid, bool>();
            var projectsDict = new Dictionary<Guid, bool>();

            if (permissions.ValueKind == JsonValueKind.Object)
            {
                if (permissions.TryGetProperty("roleTag", out var rtProp) && rtProp.ValueKind == JsonValueKind.String)
                {
                    roleTag = rtProp.GetString() ?? "";
                }
                
                if (permissions.TryGetProperty("workspaces", out var wsProp) && wsProp.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in wsProp.EnumerateObject())
                    {
                        if (Guid.TryParse(prop.Name, out var wsId))
                        {
                            workspacesDict[wsId] = prop.Value.ValueKind == JsonValueKind.True;
                        }
                    }
                }

                if (permissions.TryGetProperty("projects", out var projProp) && projProp.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in projProp.EnumerateObject())
                    {
                        if (Guid.TryParse(prop.Name, out var projId))
                        {
                            projectsDict[projId] = prop.Value.ValueKind == JsonValueKind.True;
                        }
                    }
                }
            }

            var agencyWorkspaces = await _context.EspaciosTrabajo
                .Where(et => et.AgenciaId == agencyId)
                .ToListAsync();

            foreach (var ws in agencyWorkspaces)
            {
                bool hasWorkspaceAccess = workspacesDict.TryGetValue(ws.Id, out var wsAccess) && wsAccess;

                var existingWsMember = await _context.MiembrosEspacio
                    .FirstOrDefaultAsync(me => me.EspacioTrabajoId == ws.Id && me.UsuarioId == userId);

                if (hasWorkspaceAccess)
                {
                    if (existingWsMember == null)
                    {
                        var newWsMember = new MiembroEspacio
                        {
                            EspacioTrabajoId = ws.Id,
                            UsuarioId = userId,
                            EtiquetaRol = roleTag,
                            MatrizPermisos = JsonDocument.Parse("{}").RootElement,
                            EstadoInvitacion = invitationState
                        };
                        await _context.MiembrosEspacio.AddAsync(newWsMember);
                    }
                    else
                    {
                        existingWsMember.EtiquetaRol = roleTag;
                        existingWsMember.EstadoInvitacion = invitationState;
                    }

                    var wsProjects = await _context.Proyectos
                        .Where(p => p.TenantId == ws.Id)
                        .ToListAsync();

                    foreach (var p in wsProjects)
                    {
                        bool hasProjAccess = projectsDict.TryGetValue(p.Id, out var projAccess) && projAccess;

                        var existingProjMember = await _context.MiembrosProyecto
                            .FirstOrDefaultAsync(pm => pm.ProyectoId == p.Id && pm.UsuarioId == userId);

                        if (hasProjAccess)
                        {
                            if (existingProjMember == null)
                            {
                                var newProjMember = new ProyectoMiembro
                                {
                                    ProyectoId = p.Id,
                                    UsuarioId = userId,
                                    FechaAsignacion = DateTime.UtcNow
                                };
                                await _context.MiembrosProyecto.AddAsync(newProjMember);
                            }
                        }
                        else
                        {
                            if (existingProjMember != null)
                            {
                                _context.MiembrosProyecto.Remove(existingProjMember);
                            }
                        }
                    }
                }
                else
                {
                    if (existingWsMember != null)
                    {
                        _context.MiembrosEspacio.Remove(existingWsMember);
                    }

                    var wsProjects = await _context.Proyectos
                        .Where(p => p.TenantId == ws.Id)
                        .ToListAsync();

                    foreach (var p in wsProjects)
                    {
                        var existingProjMember = await _context.MiembrosProyecto
                            .FirstOrDefaultAsync(pm => pm.ProyectoId == p.Id && pm.UsuarioId == userId);
                        if (existingProjMember != null)
                        {
                            _context.MiembrosProyecto.Remove(existingProjMember);
                        }
                    }
                }
            }
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
            await SyncWorkspaceAndProjectMembersAsync(agencyId, userId, "Pendiente", role, permissions);
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

            await SyncWorkspaceAndProjectMembersAsync(agencyId, userId, member.EstadoInvitacion, role, permissions);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<object>> GetPendingInvitationsAsync(Guid userId)
        {
            return await (from member in _context.MiembrosAgencia
                           join agency in _context.Agencias on member.AgenciaId equals agency.Id
                           join owner in _context.Usuarios on agency.PropietarioId equals owner.Id into ownerJoin
                           from owner in ownerJoin.DefaultIfEmpty()
                           where member.UsuarioId == userId && member.EstadoInvitacion == "Pendiente"
                           select new
                           {
                               AgencyId = agency.Id,
                               AgencyNombre = agency.Nombre,
                               RolInvitado = member.Rol,
                               InvitadoPor = owner != null ? owner.NombreCompleto : "Propietario",
                               InvitadoPorEmail = owner != null ? owner.Email : ""
                           }).ToListAsync();
        }

        public async Task<bool> AcceptInvitationAsync(Guid userId, Guid agencyId)
        {
            var member = await _context.MiembrosAgencia
                .FirstOrDefaultAsync(m => m.UsuarioId == userId && m.AgenciaId == agencyId);

            if (member == null) return false;

            member.EstadoInvitacion = "Aceptada";

            await SyncWorkspaceAndProjectMembersAsync(agencyId, userId, "Aceptada", member.Rol, member.PermisosJson);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> RejectInvitationAsync(Guid userId, Guid agencyId)
        {
            var member = await _context.MiembrosAgencia
                .FirstOrDefaultAsync(m => m.UsuarioId == userId && m.AgenciaId == agencyId);

            if (member == null) return false;

            _context.MiembrosAgencia.Remove(member);

            // Limpiar en cascada
            var workspaces = await _context.EspaciosTrabajo
                .Where(et => et.AgenciaId == agencyId)
                .Select(et => et.Id)
                .ToListAsync();

            var workspaceMemberships = await _context.MiembrosEspacio
                .Where(me => me.UsuarioId == userId && workspaces.Contains(me.EspacioTrabajoId))
                .ToListAsync();

            _context.MiembrosEspacio.RemoveRange(workspaceMemberships);

            var projectIds = await _context.Proyectos
                .Where(p => workspaces.Contains(p.TenantId))
                .Select(p => p.Id)
                .ToListAsync();

            var projectMemberships = await _context.MiembrosProyecto
                .Where(pm => pm.UsuarioId == userId && projectIds.Contains(pm.ProyectoId))
                .ToListAsync();

            _context.MiembrosProyecto.RemoveRange(projectMemberships);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<EspacioTrabajo>> GetWorkspacesByAgencyAsync(Guid agencyId)
        {
            return await _context.EspaciosTrabajo
                .Where(et => et.AgenciaId == agencyId)
                .ToListAsync();
        }

        public async Task<IEnumerable<object>> GetWorkspacesWithProjectsAsync(Guid agencyId)
        {
            var workspaces = await _context.EspaciosTrabajo
                .Where(et => et.AgenciaId == agencyId)
                .ToListAsync();

            var result = new List<object>();
            foreach (var ws in workspaces)
            {
                var projects = await _context.Proyectos
                    .Where(p => p.TenantId == ws.Id)
                    .Select(p => new { p.Id, p.Nombre })
                    .ToListAsync();

                result.Add(new
                {
                    ws.Id,
                    ws.Nombre,
                    Projects = projects
                });
            }

            return result;
        }

        public async Task<bool> UpdateAgencyProfileAsync(Guid agencyId, string name, JsonElement redesSociales, JsonElement branding, string mision, string vision, JsonElement datosMarketing)
        {
            var agency = await _context.Agencias.FirstOrDefaultAsync(a => a.Id == agencyId);
            if (agency == null) return false;

            agency.Nombre = name;
            agency.RedesSociales = redesSociales;
            agency.Branding = branding;
            agency.Mision = mision;
            agency.Vision = vision;
            agency.DatosMarketing = datosMarketing;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAgencyAsync(Guid agencyId)
        {
            var agency = await _context.Agencias.FirstOrDefaultAsync(a => a.Id == agencyId);
            if (agency == null) return false;

            agency.Activo = false; // Soft delete
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateAgencyNameAsync(Guid agencyId, string name)
        {
            var agency = await _context.Agencias.FirstOrDefaultAsync(a => a.Id == agencyId);
            if (agency == null) return false;

            agency.Nombre = name;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
