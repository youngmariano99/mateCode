using MateCode.Application.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

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
            return await (from member in _context.MiembrosEspacio
                          join user in _context.Usuarios on member.UsuarioId equals user.Id
                          where member.EspacioTrabajoId == tenantId
                          select new
                          {
                              user.Id,
                              user.NombreCompleto,
                              user.Email,
                              member.EtiquetaRol,
                              member.MatrizPermisos
                          }).ToListAsync();
        }

        public async Task<bool> InviteMemberAsync(Guid tenantId, string email)
        {
            // Simulación de invitación (En un sistema real guardaría en una tabla 'invitations')
            // Por ahora, si el usuario no existe, podríamos simular el envío.
            // Para MateCode, simplemente retornamos true para validar el flujo del frontend.
            await Task.Delay(500); 
            return true;
        }
    }
}
