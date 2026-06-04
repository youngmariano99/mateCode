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
        public Guid? ClienteId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Contenido { get; set; } = string.Empty;
        public string Estado { get; set; } = "Borrador"; // Borrador, Enviado, Firmado
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaFirma { get; set; }
        public string? HuellaCriptografica { get; set; }

        public string TipoContrato { get; set; } = "Cliente"; // Cliente, Trabajo, Socios, General
        public JsonElement MiembrosIds { get; set; }

        // Relaciones
        public Cliente? Cliente { get; set; }
    }

    public class ContratoHistorial
    {
        public Guid Id { get; set; }
        public Guid ContratoId { get; set; }
        public Guid UsuarioId { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public string ContenidoAnterior { get; set; } = string.Empty;
        public string ContenidoNuevo { get; set; } = string.Empty;
        public DateTime FechaCambio { get; set; } = DateTime.UtcNow;

        // Relaciones
        public ContratoAgencia? Contrato { get; set; }
    }
}
