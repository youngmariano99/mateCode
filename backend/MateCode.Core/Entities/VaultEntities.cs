using System;
using System.Text.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MateCode.Core.Entities
{
    [Table("tecnologias_catalogo", Schema = "boveda")]
    public class TecnologiaCatalogo
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? TenantId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string CategoriaPrincipal { get; set; } = string.Empty;
        public string CategoriaSecundaria { get; set; } = string.Empty;
        public string? UrlDocumentacion { get; set; }
        public string? ColorHex { get; set; } = "#10B981";
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        [Column("activo")]
        public bool Activo { get; set; } = true; // Soft Delete
    }

    public class ProyectoStack
    {
        public Guid Id { get; set; }
        public Guid ProyectoId { get; set; }
        public Guid TecnologiaId { get; set; }
        public string DescripcionUso { get; set; } = string.Empty;
        
        // Relación
        public virtual TecnologiaCatalogo? Tecnologia { get; set; }
    }

    [Table("plantillas_stack", Schema = "boveda")]
    public class PlantillaStack
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        [Column("tecnologias_ids_json", TypeName = "jsonb")]
        public JsonElement TecnologiasIdsJson { get; set; } // Array de IDs
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        [Column("activo")]
        public bool Activo { get; set; } = true; // Soft Delete
    }

    public class Portafolio
    {
        public Guid Id { get; set; }
        public Guid EspacioTrabajoId { get; set; }
        public Guid? ProyectoOriginalId { get; set; }
        public JsonElement PayloadLimpio { get; set; }
    }

    public class PlantillaPrompt
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string ContenidoPlantilla { get; set; } = string.Empty;
        public string FaseObjetivo { get; set; } = "General";
        public string EtiquetasJson { get; set; } = "[]";
        public bool InyectaAdn { get; set; }
        public bool InyectaStack { get; set; }
        public bool InyectaBdd { get; set; }
        public bool InyectaTicket { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
    [Table("estandares_catalogo", Schema = "boveda")]
    public class EstandarCatalogo
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? EspacioTrabajoId { get; set; }
        public string Categoria { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string? DescripcionDidactica { get; set; }
        public string ColorHex { get; set; } = "#10B981";
        public DateTime? EliminadoEn { get; set; }
        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}
