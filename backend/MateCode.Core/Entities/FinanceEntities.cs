using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class PerfilEmpresa
    {
        public Guid Id { get; set; }
        public Guid EspacioTrabajoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? ColoresMarca { get; set; }
    }

    public class Presupuesto
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid PerfilId { get; set; }
        public JsonElement AlcanceJson { get; set; }
        public decimal MontoTotal { get; set; }
    }
}
