using System;
using System.Text.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace MateCode.Core.Entities
{
    public class Cliente
    {
        public Guid Id { get; set; }
        public Guid? AgenciaId { get; set; }
        public Guid? EspacioTrabajoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string TokenEnlaceMagico { get; set; } = string.Empty;
        public JsonElement ContextoJson { get; set; }

        // Campos unificados de CRM / Leads
        public string Categoria { get; set; } = "Lead";
        public string Calificacion { get; set; } = "Calificado";
        public string? OrigenContacto { get; set; }
        public string? MotivoContacto { get; set; }
        public string? Descripcion { get; set; }
        public JsonElement Notas { get; set; }
        public string RangoLexicografico { get; set; } = "a";
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public bool Activo { get; set; } = true;

        // Nuevos campos de geolocalización y perfilado de clientes
        public string? Rubro { get; set; }
        public string? DireccionTexto { get; set; }
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
        public string[]? EtiquetasRapidas { get; set; }
        public string? TipoSoftwareTiene { get; set; }
        public string? TipoSoftwareQuiere { get; set; }
        public string? DoloresNotas { get; set; }
        public JsonElement? BitacoraContactos { get; set; }
        public JsonElement? LinksRecursos { get; set; }
    }

    public class Proyecto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? ClienteId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public JsonElement ContextoJson { get; set; }
        public string FaseActual { get; set; } = "Fase 0 - Factibilidad";
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Configuración de Sincronización Externa
        public string? ExternalSyncUrl { get; set; }
        public string? ExternalSyncKey { get; set; }
        public string? ExternalSyncType { get; set; }
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

    [Table("kanban_columnas_crm", Schema = "crm")]
    public class CrmColumna
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("agencia_id")]
        public Guid AgenciaId { get; set; }

        [Column("key")]
        public string Key { get; set; } = string.Empty;

        [Column("label")]
        public string Label { get; set; } = string.Empty;

        [Column("orden")]
        public int Orden { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}
