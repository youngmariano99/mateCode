using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Application.Services;
using MateCode.Infrastructure.Persistence;
using MateCode.Core.Entities;

public class RelacionElemento {
    public string Tipo { get; set; } = string.Empty;
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

namespace MateCode.Infrastructure.Services
{
    public class ColabService : IColabService
    {
        private readonly AppDbContext _context;

        public ColabService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Decision> CrearDecisionAsync(Guid proyectoId, Guid creadorId, string titulo, string descripcion, string[] etiquetas, Guid? reunionId = null)
        {
            var decision = new Decision
            {
                ProyectoId = proyectoId,
                ReunionId = reunionId,
                CreadorId = creadorId,
                Titulo = titulo,
                Descripcion = descripcion,
                Etiquetas = JsonSerializer.SerializeToElement(etiquetas)
            };

            _context.Decisiones.Add(decision);
            await _context.SaveChangesAsync();
            return decision;
        }

        public async Task<List<Decision>> ObtenerDecisionesAsync(Guid proyectoId)
        {
            var decisiones = await (from d in _context.Decisiones
                                   join u in _context.Usuarios on d.CreadorId equals u.Id
                                   where d.ProyectoId == proyectoId
                                   orderby d.FechaCreacion descending
                                   select new Decision {
                                       Id = d.Id,
                                       ProyectoId = d.ProyectoId,
                                       ReunionId = d.ReunionId,
                                       CreadorId = d.CreadorId,
                                       Titulo = d.Titulo,
                                       Descripcion = d.Descripcion,
                                       Estado = d.Estado,
                                       Etiquetas = d.Etiquetas,
                                       ElementosRelacionados = d.ElementosRelacionados,
                                       FechaCreacion = d.FechaCreacion,
                                       FechaActualizacion = d.FechaActualizacion,
                                       NombreUsuario = u.NombreCompleto
                                   }).ToListAsync();

            var decisionIds = decisiones.Select(d => d.Id).ToList();
            if (decisionIds.Any())
            {
                var votos = await _context.VotosDecision
                    .Where(v => decisionIds.Contains(v.DecisionId))
                    .ToListAsync();

                foreach (var d in decisiones)
                {
                    var upvotes = votos.Count(v => v.DecisionId == d.Id && v.EsUpvote);
                    var downvotes = votos.Count(v => v.DecisionId == d.Id && !v.EsUpvote);
                    d.Score = upvotes - downvotes;
                }
            }

            return decisiones;
        }

        public async Task VotarDecisionAsync(Guid decisionId, Guid usuarioId, bool isUpvote)
        {
            var voto = await _context.VotosDecision.FindAsync(decisionId, usuarioId);
            if (voto == null)
            {
                voto = new VotoDecision { DecisionId = decisionId, UsuarioId = usuarioId, EsUpvote = isUpvote };
                _context.VotosDecision.Add(voto);
            }
            else
            {
                voto.EsUpvote = isUpvote;
                voto.Fecha = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
        }

        public async Task<Bug> ReportarBugAsync(Guid proyectoId, Guid reportadorId, string titulo, string descripcion, string pasos)
        {
            var bug = new Bug
            {
                ProyectoId = proyectoId,
                ReportadorId = reportadorId,
                Titulo = titulo,
                Descripcion = descripcion,
                PasosReproduccion = pasos
            };

            _context.Bugs.Add(bug);
            await _context.SaveChangesAsync();
            return bug;
        }

        public async Task<List<Bug>> ObtenerBugsAsync(Guid proyectoId)
        {
            return await (from b in _context.Bugs
                          join u in _context.Usuarios on b.ReportadorId equals u.Id
                          where b.ProyectoId == proyectoId
                          orderby b.FechaCreacion descending
                          select new Bug {
                              Id = b.Id,
                              ProyectoId = b.ProyectoId,
                              ReportadorId = b.ReportadorId,
                              Titulo = b.Titulo,
                              Descripcion = b.Descripcion,
                              PasosReproduccion = b.PasosReproduccion,
                              Estado = b.Estado,
                              TicketAsociadoId = b.TicketAsociadoId,
                              FechaCreacion = b.FechaCreacion,
                              NombreUsuario = u.NombreCompleto
                          }).ToListAsync();
        }

        public async Task<Guid> ConvertirBugATicketAsync(Guid bugId, Guid? sprintId, Guid tenantId)
        {
            var bug = await _context.Bugs.FindAsync(bugId);
            if (bug == null) throw new Exception("Bug no encontrado");

            // Crear el Ticket
            var ticket = new Ticket
            {
                ProyectoId = bug.ProyectoId,
                SprintId = sprintId,
                Tipo = "Bug",
                Estado = "Pendiente",
                Titulo = "BUG: " + bug.Titulo,
                Prioridad = "Bloqueante",
                TareasJson = JsonSerializer.SerializeToElement(new[] 
                {
                    new { id = Guid.NewGuid(), description = "Reproducir bug: " + bug.PasosReproduccion, completed = false },
                    new { id = Guid.NewGuid(), description = "Resolver incidencia", completed = false }
                })
            };

            _context.Tickets.Add(ticket);
            
            // Marcar bug como convertido
            bug.Estado = "Convertido";
            bug.TicketAsociadoId = ticket.Id;

            await _context.SaveChangesAsync();
            return ticket.Id;
        }

        public async Task AsociarTicketABugAsync(Guid bugId, Guid ticketId)
        {
            var bug = await _context.Bugs.FindAsync(bugId);
            if (bug == null) throw new Exception("Bug no encontrado");

            bug.TicketAsociadoId = ticketId;
            bug.Estado = "Asociado"; // Cambiamos el estado para reflejar la asociación sin "Convertir"
            
            await _context.SaveChangesAsync();
        }

        public async Task AsociarElementoADecisionAsync(Guid decisionId, string tipo, Guid elementoId, string nombreElemento)
        {
            var decision = await _context.Decisiones.FindAsync(decisionId);
            if (decision == null) throw new Exception("Decisión no encontrada");

            List<RelacionElemento> elementos = new List<RelacionElemento>();
            
            if (decision.ElementosRelacionados.HasValue && decision.ElementosRelacionados.Value.ValueKind == JsonValueKind.Array)
            {
                var jsonStr = decision.ElementosRelacionados.Value.GetRawText();
                elementos = JsonSerializer.Deserialize<List<RelacionElemento>>(jsonStr) ?? new List<RelacionElemento>();
            }

            // Evitar duplicados
            if (!elementos.Any(e => e.Id == elementoId))
            {
                elementos.Add(new RelacionElemento { Tipo = tipo, Id = elementoId, Nombre = nombreElemento });
                decision.ElementosRelacionados = JsonSerializer.SerializeToElement(elementos);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Guid> IniciarReunionAsync(Guid proyectoId, Guid creadorId, string titulo, string? descripcion)
        {
            var reunion = new Reunion
            {
                Id = Guid.NewGuid(),
                ProyectoId = proyectoId,
                CreadorId = creadorId,
                Titulo = titulo,
                Descripcion = descripcion,
                FechaInicio = DateTime.UtcNow,
                ActaJson = JsonSerializer.Deserialize<JsonElement>("{}")
            };

            _context.Reuniones.Add(reunion);
            await _context.SaveChangesAsync();
            return reunion.Id;
        }

        public async Task FinalizarReunionAsync(Guid reunionId, string actaJson)
        {
            var reunion = await _context.Reuniones.FindAsync(reunionId);
            if (reunion != null)
            {
                reunion.ActaJson = JsonSerializer.Deserialize<JsonElement>(actaJson);
                reunion.FechaFin = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Reunion>> ObtenerReunionesAsync(Guid id)
        {
            // Join manual para filtrar por ProyectoId o por el TenantId del Proyecto
            return await (from r in _context.Reuniones
                          join p in _context.Proyectos on r.ProyectoId equals p.Id
                          join u in _context.Usuarios on r.CreadorId equals u.Id
                          where r.ProyectoId == id || p.TenantId == id
                          orderby r.FechaInicio descending
                          select new Reunion {
                              Id = r.Id,
                              ProyectoId = r.ProyectoId,
                              CreadorId = r.CreadorId,
                              Titulo = r.Titulo,
                              Descripcion = r.Descripcion,
                              FechaInicio = r.FechaInicio,
                              FechaFin = r.FechaFin,
                              ActaJson = r.ActaJson,
                              NombreUsuario = u.NombreCompleto
                          }).ToListAsync();
        }
    }
}
