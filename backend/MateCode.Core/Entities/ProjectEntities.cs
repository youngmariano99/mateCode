using System;
using System.Text.Json;
using System.ComponentModel.DataAnnotations.Schema;

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
        public JsonElement ContextoJson { get; set; }
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

    public class Diagrama
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public string Tipo { get; set; } = string.Empty; // ERD, UML, Sitemap, Roles
        public string ContenidoCodigo { get; set; } = string.Empty;
        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;
    }
    [Table("proyecto_estandar", Schema = "proyectos")]
    public class ProyectoEstandar
    {
        public Guid ProyectoId { get; set; }
        public Guid EstandarId { get; set; }

        // Relaciones
        public virtual Proyecto? Proyecto { get; set; }
        public virtual EstandarCatalogo? Estandar { get; set; }
    }
}
