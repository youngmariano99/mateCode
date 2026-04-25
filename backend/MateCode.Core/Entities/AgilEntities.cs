using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class Release
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public int OrdenPosicion { get; set; }
    }

    public class PersonaProyecto
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
    }

    public class Feature
    {
        public Guid Id { get; set; }
        public Guid EpicaId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? ColorHex { get; set; }
        public int OrdenPosicion { get; set; }
    }

    public class Epica
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string? ColorHex { get; set; }
        public int OrdenPosicion { get; set; }
    }

    public class Historia
    {
        public Guid Id { get; set; }
        public Guid? FeatureId { get; set; }
        public Guid? ReleaseId { get; set; }
        public Guid ProyectoId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string UsuarioNarrativo { get; set; } = "Usuario";
        public string CriteriosBdd { get; set; } = string.Empty;
        public JsonElement? CriteriosAceptacion { get; set; }
        public string Prioridad { get; set; } = "MVP";
        public JsonElement? TareasTecnicasJson { get; set; }
        public string RangoLexicografico { get; set; } = "a";
    }

    public class Ticket
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid? HistoriaId { get; set; }
        public Guid? SprintId { get; set; }
        public Guid? OrigenHistoriaId { get; set; }
        public string? EpicTag { get; set; }
        public string? Prioridad { get; set; }
        public JsonElement? CriteriosJson { get; set; }
        public JsonElement? TareasJson { get; set; }
        public DateTime? FechaInicioReal { get; set; }
        public DateTime? FechaFinReal { get; set; }
        public string Tipo { get; set; } = "Tarea";
        public string Titulo { get; set; } = string.Empty;
        public string Estado { get; set; } = "Todo";
        public Guid? ResponsableId { get; set; }
        public string RangoLexicografico { get; set; } = "a";
        public string? Especialidad { get; set; }
    }

    public class Sprint
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Objetivo { get; set; } = string.Empty;
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public string Estado { get; set; } = "Planificado";
    }

    public class MetricaSprint
    {
        public Guid Id { get; set; }
        public Guid SprintId { get; set; }
        public int TicketsCompletados { get; set; } = 0;
        public int TicketsIncompletos { get; set; } = 0;
        public decimal PromedioCycleTimeHoras { get; set; } = 0;
        public string NotasRetrospectiva { get; set; } = string.Empty;
        public DateTime FechaCierre { get; set; } = DateTime.UtcNow;
    }

    public class FeedbackCliente
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public string Comentario { get; set; } = string.Empty;
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
        public bool Procesado { get; set; } = false;
    }

    public class KanbanColumna
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid TenantId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int OrdenPosicion { get; set; }
    }
}
