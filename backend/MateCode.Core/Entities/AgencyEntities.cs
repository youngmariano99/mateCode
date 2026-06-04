using System;
using System.Text.Json;

namespace MateCode.Core.Entities
{
    public class Agencia
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public Guid PropietarioId { get; set; }
        public string Tipo { get; set; } = "agencia"; // "personal" o "agencia"
        public string LlaveCifrado { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Nuevos campos de Perfil y Branding (Ciclo 1)
        public JsonElement RedesSociales { get; set; }
        public JsonElement Branding { get; set; }
        public string Mision { get; set; } = string.Empty;
        public string Vision { get; set; } = string.Empty;
        public JsonElement DatosMarketing { get; set; }

        // Relaciones
        public Usuario? Propietario { get; set; }
    }

    public class MiembroAgencia
    {
        public Guid AgenciaId { get; set; }
        public Guid UsuarioId { get; set; }
        public string Rol { get; set; } = string.Empty; // "Propietario", "Administrador", "Colaborador"
        public JsonElement PermisosJson { get; set; }
        public string EstadoInvitacion { get; set; } = "Pendiente"; // "Pendiente", "Aceptada", "Rechazada"

        // Relaciones
        public Agencia? Agencia { get; set; }
        public Usuario? Usuario { get; set; }
    }

    public class LeadAgencia
    {
        public Guid Id { get; set; }
        public Guid AgenciaId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Categoria { get; set; } = "Lead"; // Lead, Llamada agendada, Propuesta enviada, Rechazado, Aceptado, Cerrado
        public string Calificacion { get; set; } = "Calificado"; // Calificado, No calificado
        public string? OrigenContacto { get; set; }
        public string? MotivoContacto { get; set; }
        public string? Descripcion { get; set; }
        public JsonElement Notas { get; set; }
        public string RangoLexicografico { get; set; } = "a";
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Agencia? Agencia { get; set; }
    }

    public class Objetivo
    {
        public Guid Id { get; set; }
        public Guid AgenciaId { get; set; }
        public Guid UsuarioAsignadoId { get; set; }
        public Guid? CreadorId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string TipoPeriodo { get; set; } = "Semanal"; // Diario, Semanal, Mensual, Trimestral, Anual
        public DateTime? FechaLimite { get; set; }
        public bool Completado { get; set; } = false;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Agencia? Agencia { get; set; }
        public Usuario? UsuarioAsignado { get; set; }
        public Usuario? Creador { get; set; }
    }

    public class Recurso
    {
        public Guid Id { get; set; }
        public Guid AgenciaId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string? Contenido { get; set; }
        public string Tipo { get; set; } = "prompt"; // prompt, documento, template, otro
        public JsonElement Etiquetas { get; set; }
        public JsonElement RolesPermitidos { get; set; }
        public Guid? CreadorId { get; set; }
        public bool Favorito { get; set; } = false;
        public string Categoria { get; set; } = "General";
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Agencia? Agencia { get; set; }
        public Usuario? Creador { get; set; }
    }

    public class TareaOperativa
    {
        public Guid Id { get; set; }
        public Guid AgenciaId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string Estado { get; set; } = "Todo"; // Todo, In Progress, Done, Backlog
        public DateTime? FechaPlanificada { get; set; }
        public Guid? UsuarioAsignadoId { get; set; }
        public string RangoLexicografico { get; set; } = "a";
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Agencia? Agencia { get; set; }
        public Usuario? UsuarioAsignado { get; set; }
    }

    public class CredencialSegura
    {
        public Guid Id { get; set; }
        public Guid AgenciaId { get; set; }
        public string Servicio { get; set; } = string.Empty;
        public string? Usuario { get; set; }
        public string ClaveEncriptada { get; set; } = string.Empty;
        public string? UrlAcceso { get; set; }
        public JsonElement RolesPermitidos { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Agencia? Agencia { get; set; }
    }

    public class PlanificadorContenido
    {
        public Guid Id { get; set; }
        public Guid AgenciaId { get; set; }
        public Guid MiembroId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public JsonElement Plataformas { get; set; }
        public string? GuionPlantilla { get; set; }
        public string? Dialogo { get; set; }
        public string? ProcedimientoEstandar { get; set; }
        public string Estado { get; set; } = "Idea"; // Idea, Guion, Grabado, Editado, Publicado
        public string? NotasMejora { get; set; }
        public JsonElement ResumenAnalitico { get; set; }
        public DateTime? FechaPublicacion { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Agencia? Agencia { get; set; }
        public Usuario? Miembro { get; set; }
    }

    public class TransaccionAgencia
    {
        public Guid Id { get; set; }
        public Guid AgenciaId { get; set; }
        public string Tipo { get; set; } = "egreso"; // ingreso, egreso, costo_fijo, costo_variable
        public decimal Monto { get; set; }
        public string Concepto { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public DateTime Fecha { get; set; }
        public string? Categoria { get; set; }
        public Guid? ProyectoId { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Agencia? Agencia { get; set; }
        public Proyecto? Proyecto { get; set; }
    }

    public class AuditLog
    {
        public Guid Id { get; set; }
        public Guid AgenciaId { get; set; }
        public Guid UsuarioId { get; set; }
        public string? NombreUsuario { get; set; }
        public string Modulo { get; set; } = string.Empty; // CRM, Accesos, Finanzas, etc.
        public string Accion { get; set; } = string.Empty; // CREAR, MODIFICAR, ELIMINAR, LEER_ACCESO
        public Guid? RegistroId { get; set; }
        public JsonElement Detalles { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Agencia? Agencia { get; set; }
        public Usuario? Usuario { get; set; }
    }
}
