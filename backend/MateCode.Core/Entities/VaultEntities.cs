using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class TecnologiaCatalogo
    {
        public Guid Id { get; set; }
        public Guid? TenantId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string CategoriaPrincipal { get; set; } = string.Empty;
        public string CategoriaSecundaria { get; set; } = string.Empty;
        public string UrlDocumentacion { get; set; } = string.Empty;
        public string ColorHex { get; set; } = "#10B981";
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
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

    public class PlantillaStack
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public JsonElement TecnologiasIdsJson { get; set; } // Array de IDs
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
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
}
