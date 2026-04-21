using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class FormularioPlantilla
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Tipo { get; set; } = "lead"; // lead, idea_propia
        public JsonElement ConfiguracionJson { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}
