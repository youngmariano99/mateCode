using System.Collections.Generic;

namespace MateCode.Core.Exceptions
{
    public static class ErrorCatalog
    {
        // CRM
        public const string LeadNotFound = "MATECODE_CRM_LEAD_NOT_FOUND";
        
        // Vault / Secrets
        public const string DecryptionFailed = "MATECODE_VAULT_DECRYPTION_FAILED";
        public const string KeyGenerationFailed = "MATECODE_KEY_GENERATION_FAILED";
        public const string SecretNotFound = "MATECODE_SECRET_NOT_FOUND";

        // Agency / Members
        public const string AgencyNotFound = "MATECODE_AGENCY_NOT_FOUND";
        public const string MemberExists = "MATECODE_AGENCY_MEMBER_EXISTS";
        public const string MemberNotFound = "MATECODE_AGENCY_MEMBER_NOT_FOUND";
        public const string InvitationNotFound = "MATECODE_INVITATION_NOT_FOUND";
        public const string WorkspaceNotFound = "MATECODE_WORKSPACE_NOT_FOUND";

        // Security / Auth
        public const string UnauthorizedAccess = "MATECODE_UNAUTHORIZED_ACCESS";
        public const string InsufficientPermissions = "MATECODE_INSUFFICIENT_PERMISSIONS";
        public const string InvalidInput = "MATECODE_INVALID_INPUT";

        // General
        public const string InternalServerError = "MATECODE_INTERNAL_SERVER_ERROR";

        private static readonly Dictionary<string, string> FriendlyMessages = new()
        {
            { LeadNotFound, "No pudimos localizar la información del cliente. Por favor, verifica la lista o recarga la página." },
            { DecryptionFailed, "No fue posible descifrar las credenciales de acceso. Asegúrate de tener configurada la llave correcta para la agencia." },
            { KeyGenerationFailed, "Hubo un problema al establecer la llave de seguridad de la agencia. Por favor, reintenta." },
            { SecretNotFound, "No se encontró la credencial solicitada en la bóveda de seguridad." },
            { AgencyNotFound, "La agencia o empresa especificada no existe o no tienes acceso a ella." },
            { MemberExists, "El colaborador ya forma parte de la organización o tiene una invitación pendiente." },
            { MemberNotFound, "No se encontró el miembro especificado en esta organización." },
            { InvitationNotFound, "La invitación solicitada no existe, ya fue procesada o expiró." },
            { WorkspaceNotFound, "El espacio de trabajo solicitado no se encuentra registrado en tu organización." },
            { UnauthorizedAccess, "No posees una sesión válida o tu token de seguridad ha expirado. Por favor, inicia sesión de nuevo." },
            { InsufficientPermissions, "Tu rol actual en la organización no te permite ejecutar esta acción." },
            { InvalidInput, "Uno o más campos provistos no contienen información válida. Por favor, revísalos." },
            { InternalServerError, "Hemos detectado un inconveniente técnico inesperado en nuestros servidores. Ya estamos investigándolo." }
        };

        public static string GetFriendlyMessage(string errorCode, string fallback = "Ha ocurrido un inconveniente inesperado en el sistema.")
        {
            if (string.IsNullOrWhiteSpace(errorCode)) return fallback;
            return FriendlyMessages.TryGetValue(errorCode, out var msg) ? msg : fallback;
        }
    }
}
