using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class Usuario
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
    }

    public class EspacioTrabajo
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public Guid PropietarioId { get; set; }
        public DateTime FechaCreacion { get; set; }
    }

    public class MiembroEspacio
    {
        public Guid EspacioTrabajoId { get; set; }
        public Guid UsuarioId { get; set; }
        public string EtiquetaRol { get; set; } = string.Empty;
        public JsonElement MatrizPermisos { get; set; }
    }
}
