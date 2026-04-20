using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class PlantillaStack
    {
        public Guid Id { get; set; }
        public Guid EspacioTrabajoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public JsonElement PayloadTecnico { get; set; }
    }

    public class Portafolio
    {
        public Guid Id { get; set; }
        public Guid EspacioTrabajoId { get; set; }
        public Guid? ProyectoOriginalId { get; set; }
        public JsonElement PayloadLimpio { get; set; }
    }
}
