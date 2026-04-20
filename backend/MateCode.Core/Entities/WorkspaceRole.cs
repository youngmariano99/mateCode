using System;

namespace MateCode.Core.Entities
{
    public class WorkspaceRole
    {
        public Guid Id { get; set; }
        public Guid WorkspaceId { get; set; }
        public string Name { get; set; } = string.Empty;
        
        // Guardamos el JSON de la matriz de permisos
        public string PermissionsMatrix { get; set; } = "{}";

        public Workspace? Workspace { get; set; }
    }
}
