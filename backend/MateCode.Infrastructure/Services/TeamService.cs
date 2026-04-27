using MateCode.Application.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;
using System.Text.Json;

namespace MateCode.Infrastructure.Services
{
    public class TeamService : ITeamService
    {
        private readonly AppDbContext _context;

        public TeamService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<object>> GetTeamMembersAsync(Guid tenantId)
        {
            var members = await (from member in _context.MiembrosEspacio
                                 join user in _context.Usuarios on member.UsuarioId equals user.Id
                                 where member.EspacioTrabajoId == tenantId
                                 select new
                                 {
                                     user.Id,
                                     user.NombreCompleto,
                                     user.Email,
                                     member.EtiquetaRol,
                                     member.MatrizPermisos,
                                     member.EstadoInvitacion
                                 }).ToListAsync();

            // Cargar proyectos asignados para cada miembro
            var result = new List<object>();
            foreach (var m in members)
            {
                var projectIds = await _context.MiembrosProyecto
                    .Where(mp => mp.UsuarioId == m.Id)
                    .Select(mp => mp.ProyectoId)
                    .ToListAsync();

                result.Add(new
                {
                    m.Id,
                    m.NombreCompleto,
                    m.Email,
                    m.EtiquetaRol,
                    m.MatrizPermisos,
                    m.EstadoInvitacion,
                    ProyectosAsignados = projectIds
                });
            }

            return result;
        }

        public async Task<bool> InviteMemberAsync(Guid tenantId, string email)
        {
            // Simulación de invitación
            await Task.Delay(500); 
            return true;
        }

        public async Task<IEnumerable<object>> SearchUsersAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return new List<object>();

            var lowerQuery = query.ToLower();
            return await _context.Usuarios
                .Where(u => u.NombreCompleto.ToLower().Contains(lowerQuery) || u.Email.ToLower().Contains(lowerQuery))
                .Select(u => new {
                    u.Id,
                    u.NombreCompleto,
                    u.Email
                })
                .Take(10)
                .ToListAsync();
        }

        public async Task<bool> AddMemberToWorkspaceAsync(Guid tenantId, Guid userId, string roleTag)
        {
            var exists = await _context.MiembrosEspacio
                .AnyAsync(m => m.EspacioTrabajoId == tenantId && m.UsuarioId == userId);
            
            if (exists) return false;

            var newMember = new MiembroEspacio
            {
                EspacioTrabajoId = tenantId,
                UsuarioId = userId,
                EtiquetaRol = roleTag,
                MatrizPermisos = JsonDocument.Parse("{}").RootElement,
                EstadoInvitacion = "Pendiente"
            };

            _context.MiembrosEspacio.Add(newMember);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task UpdateMemberAccessAsync(Guid tenantId, Guid userId, string roleTag, List<Guid> projectIds)
        {
            var member = await _context.MiembrosEspacio
                .FirstOrDefaultAsync(m => m.EspacioTrabajoId == tenantId && m.UsuarioId == userId);
            
            if (member == null) return;

            // Actualizar Rol
            member.EtiquetaRol = roleTag;

            // Sincronizar Proyectos (Borrar antiguos y agregar nuevos)
            var currentProjects = await _context.MiembrosProyecto
                .Where(mp => mp.UsuarioId == userId)
                .ToListAsync();
            
            _context.MiembrosProyecto.RemoveRange(currentProjects);

            foreach (var pId in projectIds)
            {
                _context.MiembrosProyecto.Add(new ProyectoMiembro
                {
                    ProyectoId = pId,
                    UsuarioId = userId
                });
            }

            await _context.SaveChangesAsync();
        }
    }
}
