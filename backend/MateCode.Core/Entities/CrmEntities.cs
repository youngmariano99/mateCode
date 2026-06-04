using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class FormularioPlantilla
    {
        public Guid Id { get; set; }
        public Guid? AgenciaId { get; set; }
        public Guid? TenantId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Tipo { get; set; } = "lead"; // lead, idea_propia
        public JsonElement ConfiguracionJson { get; set; }
        public Guid? CreadorId { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }

    public class ContratoAgencia
    {
        public Guid Id { get; set; }
        public Guid AgenciaId { get; set; }
        public Guid ClienteId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Contenido { get; set; } = string.Empty;
        public string Estado { get; set; } = "Borrador"; // Borrador, Enviado, Firmado
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaFirma { get; set; }
        public string? HuellaCriptografica { get; set; }

        // Relaciones
        public Cliente? Cliente { get; set; }
    }
}
