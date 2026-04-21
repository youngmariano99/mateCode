using System;

namespace MateCode.Core.Entities
{
    public class Epica
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string RangoLexicografico { get; set; } = "a";
    }

    public class Historia
    {
        public Guid Id { get; set; }
        public Guid EpicaId { get; set; }
        public Guid ProyectoId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string CriteriosBdd { get; set; } = string.Empty;
        public string RangoLexicografico { get; set; } = "a";
    }

    public class Ticket
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid? HistoriaId { get; set; }
        public string Tipo { get; set; } = "Tarea";
        public string Titulo { get; set; } = string.Empty;
        public string Estado { get; set; } = "Todo";
        public Guid? ResponsableId { get; set; }
        public string RangoLexicografico { get; set; } = "a";
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
