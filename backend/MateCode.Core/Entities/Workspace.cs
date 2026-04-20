using System;
using System.Collections.Generic;

namespace MateCode.Core.Entities
{
    public class Workspace
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relaciones
        public User? Owner { get; set; }
        public ICollection<WorkspaceMember> Members { get; set; } = new List<WorkspaceMember>();
        public ICollection<WorkspaceRole> Roles { get; set; } = new List<WorkspaceRole>();
    }
}
