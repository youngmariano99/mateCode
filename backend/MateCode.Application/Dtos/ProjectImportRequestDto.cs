using System;
using System.Collections.Generic;

namespace MateCode.Application.Dtos
{
    public class ProjectImportRequestDto
    {
        public Guid ProyectoId { get; set; }
        public List<TableImportDto> Tables { get; set; } = new();
        public List<TicketImportDto> Tickets { get; set; } = new();
    }

    public class TableImportDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public List<ColumnImportDto> Columnas { get; set; } = new();
    }

    public class ColumnImportDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public bool? Pk { get; set; }
        public bool? Fk { get; set; }
        public bool? Nullable { get; set; }
    }

    public class TicketImportDto
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string Tipo { get; set; } = "Task";
        public string Prioridad { get; set; } = "Media";
    }
}
