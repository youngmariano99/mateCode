using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Application.Services;
using MateCode.Core.Entities;
using MateCode.Infrastructure.Persistence;

namespace MateCode.Infrastructure.Services
{
    public class BacklogService : IBacklogService
    {
        private readonly AppDbContext _context;

        public BacklogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Sprint>> ObtenerSprintsAsync(Guid proyectoId)
        {
            return await _context.Sprints.Where(s => s.ProyectoId == proyectoId).OrderByDescending(s => s.FechaInicio).ToListAsync();
        }

        public async Task<string> GenerarPromptGroomingAsync(Guid proyectoId)
        {
            var proyecto = await _context.Proyectos.FindAsync(proyectoId);
            if (proyecto == null) throw new Exception("Proyecto no encontrado");

            // Fase 0 (ADN)
            string contextoAdn = proyecto.ContextoJson.ValueKind != JsonValueKind.Undefined ? proyecto.ContextoJson.GetRawText() : "{}";

            // Fase 1 (User Story Mapping)
            var historias = await _context.Historias
                .Where(h => h.ProyectoId == proyectoId)
                .Select(h => new { h.Id, h.Titulo, h.Prioridad, h.CriteriosBdd })
                .ToListAsync();
            string historiasFormatted = string.Join("\n", historias.Select((h, i) => 
                $"{i+1}. **[ID: {h.Id}]** (Prioridad: {h.Prioridad}) - {h.Titulo}\n   *Criterios:* {h.CriteriosBdd}"));

            // Fase 2 (Stack/ERD)
            var diagramas = await _context.Diagramas
                .Where(d => d.ProyectoId == proyectoId)
                .ToListAsync();
            string diagramasStr = string.Join("\n\n", diagramas.Select(d => $"#### {d.Tipo}\n```json\n{d.ContenidoCodigo}\n```"));

            var missingPhases = new List<string>();
            if (contextoAdn == "{}" || string.IsNullOrWhiteSpace(contextoAdn)) missingPhases.Add("Fase 0 (ADN)");
            if (!historias.Any()) missingPhases.Add("Fase 1 (Historias de Usuario)");
            if (!diagramas.Any()) missingPhases.Add("Fase 2 (Arquitectura)");

            string warningHeader = missingPhases.Any()
                ? $"🚨 **ATENCIÓN: FALTA CONTEXTO.** El proyecto no tiene información de: {string.Join(", ", missingPhases)}. Es MUY recomendable que el usuario complete estas fases en MateCode antes de generar el Backlog, o de lo contrario tendrás que asumir muchos detalles técnicos o funcionales.\n\n"
                : "";

            // Armar el prompt
            return $@"{warningHeader}Actúa como Tech Lead y Arquitecto de Software. Tu tarea es generar tickets técnicos detallados cruzando la información de negocio con la arquitectura del sistema.

### FASE 0: CONTEXTO DEL PROYECTO (ADN)
```json
{contextoAdn}
```

---

### FASE 1: HISTORIAS DE USUARIO (BACKLOG)
*(Nota: Conserva el ID exacto en el ticket final)*

{historiasFormatted}

---

### FASE 2: ARQUITECTURA Y MODELOS

{diagramasStr}

---

### INSTRUCCIÓN DE SALIDA ESTRICTA
Analiza el contexto y cruza las Historias de Usuario con las tablas y módulos correspondientes. Genera un JSON estricto respetando el siguiente formato. NO incluyas formato markdown ni texto fuera del JSON.

```json
{{
  ""sprint_recomendado_dias"": 14,
  ""tickets"": [
    {{
      ""origen_historia_id"": ""UUID_de_la_historia"",
      ""titulo_tecnico"": ""Capa (Front/Back/DB): Título accionable"",
      ""prioridad_release"": ""MVP | Mejora | Escala"",
      ""epic_tag"": ""Nombre del módulo (Ej: Operaciones POS)"",
      ""criterios_aceptacion"": [
        ""Criterio 1 basado en la historia"",
        ""Criterio 2""
      ],
      ""tareas_tecnicas"": [
        {{ ""capa"": ""Frontend | Backend | DB"", ""detalle"": ""Acción técnica específica mencionando la tabla o componente"" }}
      ]
    }}
  ]
}}
```";
        }

        public async Task<IEnumerable<Ticket>> BulkImportTicketsAsync(Guid proyectoId, JsonElement payload)
        {
            var tickets = new List<Ticket>();
            
            if (payload.TryGetProperty("tickets", out var ticketsElement))
            {
                foreach (var tElement in ticketsElement.EnumerateArray())
                {
                    var ticket = new Ticket
                    {
                        ProyectoId = proyectoId,
                        Tipo = "Tarea",
                        Estado = "Backlog",
                        Titulo = tElement.GetProperty("titulo_tecnico").GetString() ?? "Sin título",
                        EpicTag = tElement.TryGetProperty("epic_tag", out var ep) ? ep.GetString() ?? "" : "",
                        Prioridad = tElement.TryGetProperty("prioridad_release", out var pr) ? pr.GetString() ?? "MVP" : "MVP",
                        CriteriosJson = tElement.TryGetProperty("criterios_aceptacion", out var crit) ? crit : null,
                        TareasJson = tElement.TryGetProperty("tareas_tecnicas", out var tar) ? tar : null
                    };

                    if (tElement.TryGetProperty("origen_historia_id", out var ori) && Guid.TryParse(ori.GetString(), out var origenId))
                    {
                        ticket.OrigenHistoriaId = origenId;
                        ticket.HistoriaId = origenId; // Vinculamos a la historia si existe
                    }

                    tickets.Add(ticket);
                }

                _context.Tickets.AddRange(tickets);
                await _context.SaveChangesAsync();
            }

            return tickets;
        }

        public async Task<Sprint> IniciarSprintAsync(Guid proyectoId, string nombre, string objetivo, int duracionDias, List<Guid> ticketIds)
        {
            var sprint = new Sprint
            {
                ProyectoId = proyectoId,
                Nombre = nombre,
                Objetivo = objetivo,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddDays(duracionDias),
                Estado = "Activo"
            };

            _context.Sprints.Add(sprint);
            await _context.SaveChangesAsync(); // Para obtener el ID

            var tickets = await _context.Tickets.Where(t => ticketIds.Contains(t.Id)).ToListAsync();
            foreach (var t in tickets)
            {
                t.SprintId = sprint.Id;
                t.Estado = "To Do"; // Mover de Backlog a To Do
            }

            await _context.SaveChangesAsync();
            return sprint;
        }

        public async Task<MetricaSprint> FinalizarSprintAsync(Guid sprintId, List<Guid> ticketsAlBacklog, List<Guid> ticketsDescartados)
        {
            var sprint = await _context.Sprints.FindAsync(sprintId);
            if (sprint == null) throw new Exception("Sprint no encontrado");

            sprint.Estado = "Cerrado";
            sprint.FechaFin = DateTime.UtcNow;

            var ticketsSprint = await _context.Tickets.Where(t => t.SprintId == sprintId).ToListAsync();
            
            int completados = 0;
            int incompletos = 0;
            double cycleTimeTotalHoras = 0;

            foreach (var t in ticketsSprint)
            {
                if (t.Estado == "Done" || t.Estado == "Completado")
                {
                    completados++;
                    if (t.FechaInicioReal.HasValue && t.FechaFinReal.HasValue)
                    {
                        cycleTimeTotalHoras += (t.FechaFinReal.Value - t.FechaInicioReal.Value).TotalHours;
                    }
                }
                else
                {
                    incompletos++;
                    if (ticketsAlBacklog.Contains(t.Id))
                    {
                        t.SprintId = null;
                        t.Estado = "Backlog";
                    }
                    else if (ticketsDescartados.Contains(t.Id))
                    {
                        t.Estado = "Descartado";
                    }
                    // Else, si no se mandó ni al backlog ni descartado, queda para el "Próximo Sprint" (lo gestiona el frontend llamando a IniciarSprint luego)
                }
            }

            var metrica = new MetricaSprint
            {
                SprintId = sprintId,
                TicketsCompletados = completados,
                TicketsIncompletos = incompletos,
                PromedioCycleTimeHoras = completados > 0 ? (decimal)(cycleTimeTotalHoras / completados) : 0,
                NotasRetrospectiva = "Sprint cerrado automáticamente.",
                FechaCierre = DateTime.UtcNow
            };

            _context.MetricasSprint.Add(metrica);
            await _context.SaveChangesAsync();

            return metrica;
        }

        public async Task<string> ExportarEstadoTicketsAsync(Guid proyectoId)
        {
            var tickets = await _context.Tickets
                .Where(t => t.ProyectoId == proyectoId && t.Estado != "Descartado")
                .OrderBy(t => t.SprintId).ThenBy(t => t.Estado)
                .Select(t => new
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    EpicTag = t.EpicTag ?? "Sin Épica",
                    Prioridad = t.Prioridad ?? "Normal",
                    Estado = t.Estado,
                    SprintAsignado = t.SprintId.HasValue ? "En Sprint" : "Backlog",
                    TareasTecnicas = t.TareasJson
                })
                .ToListAsync();

            var exportData = new
            {
                proyecto_id = proyectoId,
                fecha_exportacion = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                total_tickets_activos = tickets.Count,
                tickets = tickets
            };

            string json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions { WriteIndented = true });

            return $@"A continuación te presento el estado actual de los tickets en el proyecto. 
Utiliza este contexto para no duplicar funcionalidades existentes y para entender en qué estado se encuentra cada tarea:

```json
{json}
```";
        }
    }
}
