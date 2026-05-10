using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MateCode.Application.Dtos;
using MateCode.Application.Services;
using MateCode.Core.Entities;
using MateCode.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MateCode.Infrastructure.Services
{
    public class ProjectImportService : IProjectImportService
    {
        private readonly AppDbContext _context;

        public ProjectImportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> ImportProjectDataAsync(ProjectImportRequestDto request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Procesar ERD (Tablas) -> Se guarda como un Diagrama tipo ERD
                if (request.Tables != null && request.Tables.Any())
                {
                    var existingErd = await _context.Diagramas
                        .FirstOrDefaultAsync(d => d.ProyectoId == request.ProyectoId && d.Tipo == "ERD");

                    var erdJson = JsonSerializer.Serialize(new { 
                        project_id = request.ProyectoId,
                        tables = request.Tables 
                    });

                    if (existingErd != null)
                    {
                        existingErd.ContenidoCodigo = erdJson;
                        existingErd.FechaActualizacion = DateTime.UtcNow;
                    }
                    else
                    {
                        var newErd = new Diagrama
                        {
                            Id = Guid.NewGuid(),
                            ProyectoId = request.ProyectoId,
                            Tipo = "ERD",
                            ContenidoCodigo = erdJson,
                            FechaActualizacion = DateTime.UtcNow
                        };
                        await _context.Diagramas.AddAsync(newErd);
                    }
                }

                // 2. Procesar Tickets (Backlog)
                if (request.Tickets != null && request.Tickets.Any())
                {
                    var tickets = request.Tickets.Select(t => new Ticket
                    {
                        Id = Guid.NewGuid(),
                        ProyectoId = request.ProyectoId,
                        Titulo = t.Titulo,
                        Tipo = t.Tipo,
                        Prioridad = t.Prioridad,
                        Estado = "Todo",
                        RangoLexicografico = "a"
                    }).ToList();

                    await _context.Tickets.AddRangeAsync(tickets);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Error crítico durante la importación atómica del proyecto.", ex);
            }
        }
    }
}
