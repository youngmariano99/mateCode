using System;

namespace MateCode.Core.Entities
{
    public class WorkspaceMember
    {
        public Guid WorkspaceId { get; set; }
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }

        public Workspace? Workspace { get; set; }
        public User? User { get; set; }
        public WorkspaceRole? Role { get; set; }
    }
}
