using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using MateCode.Application.Services;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public class WorkspaceService : IWorkspaceService
    {
        private readonly AppDbContext _context;

        public WorkspaceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EspacioTrabajo>> GetWorkspacesByUserAsync(Guid userId)
        {
            // Un usuario ve los espacios donde es dueño O donde es miembro
            var owned = await _context.EspaciosTrabajo
                .Where(et => et.PropietarioId == userId)
                .ToListAsync();

            var memberOfIds = await _context.MiembrosEspacio
                .Where(me => me.UsuarioId == userId)
                .Select(me => me.EspacioTrabajoId)
                .ToListAsync();

            var memberOf = await _context.EspaciosTrabajo
                .Where(et => memberOfIds.Contains(et.Id))
                .ToListAsync();

            return owned.Concat(memberOf).DistinctBy(et => et.Id);
        }

        public async Task<EspacioTrabajo> CreateWorkspaceAsync(Guid ownerId, string name)
        {
            var workspace = new EspacioTrabajo
            {
                Id = Guid.NewGuid(),
                Nombre = name,
                PropietarioId = ownerId,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.EspaciosTrabajo.AddAsync(workspace);
            
            // También lo agregamos como miembro con rol de Propietario (simplificado)
            var member = new MiembroEspacio
            {
                EspacioTrabajoId = workspace.Id,
                UsuarioId = ownerId,
                EtiquetaRol = "Propietario",
                MatrizPermisos = JsonDocument.Parse("{}").RootElement
            };
            
            await _context.MiembrosEspacio.AddAsync(member);
            await _context.SaveChangesAsync();
            
            return workspace;
        }
 
        public async Task SyncUserAsync(Guid userId, string email, string nombreCompleto)
        {
            var user = await _context.Usuarios.FindAsync(userId);
            if (user == null)
            {
                user = new Usuario
                {
                    Id = userId,
                    Email = email,
                    NombreCompleto = nombreCompleto,
                    FechaCreacion = DateTime.UtcNow
                };
                await _context.Usuarios.AddAsync(user);
            }
            else
            {
                user.Email = email;
                user.NombreCompleto = nombreCompleto;
            }
 
            await _context.SaveChangesAsync();
        }
    }
}
