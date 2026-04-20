using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Application.Services;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public class ClientPortalService : IClientPortalService
    {
        private readonly AppDbContext _context;

        public ClientPortalService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object?> GetProjectByTokenAsync(string token)
        {
            var data = await (from cli in _context.Clientes
                              join pro in _context.Proyectos on cli.Id equals pro.ClienteId
                              where cli.TokenEnlaceMagico == token
                              select new 
                              {
                                  ProyectoNombre = pro.Nombre,
                                  FaseActual = pro.FaseActual,
                                  ClienteNombre = cli.Nombre
                              }).FirstOrDefaultAsync();

            return data;
        }

        public async Task SendFeedbackAsync(string token, string comentario)
        {
            var proyecto = await (from cli in _context.Clientes
                                  join pro in _context.Proyectos on cli.Id equals pro.ClienteId
                                  where cli.TokenEnlaceMagico == token
                                  select pro).FirstOrDefaultAsync();

            if (proyecto == null) throw new UnauthorizedAccessException("Token inválido.");

            var feedback = new FeedbackCliente
            {
                Id = Guid.NewGuid(),
                ProyectoId = proyecto.Id,
                Comentario = comentario,
                Fecha = DateTime.UtcNow
            };

            _context.FeedbackClientes.Add(feedback);
            await _context.SaveChangesAsync();
        }
    }
}
