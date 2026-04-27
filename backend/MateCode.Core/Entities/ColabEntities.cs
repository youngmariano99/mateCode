using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class Decision
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid? ReunionId { get; set; }
        public Guid CreadorId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Estado { get; set; } = "Propuesto";
        public JsonElement? Etiquetas { get; set; }
        public JsonElement? ElementosRelacionados { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;
        
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public int Score { get; set; }
        
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string? NombreUsuario { get; set; }
    }

    public class VotoDecision
    {
        public Guid DecisionId { get; set; }
        public Guid UsuarioId { get; set; }
        public bool EsUpvote { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
    }

    public class Bug
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid ReportadorId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? PasosReproduccion { get; set; }
        public string Estado { get; set; } = "Abierto";
        public Guid? TicketAsociadoId { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string? NombreUsuario { get; set; }
    }

    public class Pizarra
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public JsonElement DocumentoJson { get; set; }
        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;
    }

    public class Reunion
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid CreadorId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        
        [System.ComponentModel.DataAnnotations.Schema.Column("descripcion")]
        public string? Descripcion { get; set; }
        public DateTime FechaInicio { get; set; } = DateTime.UtcNow;
        public DateTime? FechaFin { get; set; }
        public JsonElement ActaJson { get; set; }
        
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string? NombreUsuario { get; set; }
    }

    public class MensajeGlobal
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid UsuarioId { get; set; }
        public string? NombreUsuario { get; set; }
        public string Contenido { get; set; } = string.Empty;
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
    }

    public class LogActividad
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid UsuarioId { get; set; }
        public string? NombreUsuario { get; set; }
        public string TipoEvento { get; set; } = string.Empty;
        public JsonElement? Detalles { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
    }
}
