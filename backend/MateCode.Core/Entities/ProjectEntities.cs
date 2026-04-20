using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class Cliente
    {
        public Guid Id { get; set; }
        public Guid EspacioTrabajoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string TokenEnlaceMagico { get; set; } = string.Empty;
    }

    public class Proyecto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? ClienteId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public JsonElement ContextoJson { get; set; }
        public string FaseActual { get; set; } = "Fase 0 - Factibilidad";
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}
