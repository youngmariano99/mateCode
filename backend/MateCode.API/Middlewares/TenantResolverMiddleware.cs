using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace MateCode.API.Middlewares
{
    public class TenantResolverMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantResolverMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // El JWT de Supabase u otro proveedor suele extraerse automáticamente.
            // Si el header "X-Tenant-Id" o un reclamo (claim) en el token establece el Workspace Activo:
            
            var tenantClaim = context.User.FindFirst("workspace_id")?.Value;
            var headerTenant = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();

            var tenantIdString = headerTenant ?? tenantClaim;

            if (!string.IsNullOrEmpty(tenantIdString) && Guid.TryParse(tenantIdString, out var tenantId))
            {
                // Inyectamos el Tenant ID en los items del HttpContext para que esté disponible en toda la vida del Request
                context.Items["CurrentTenantId"] = tenantId;
            }

            await _next(context);
        }
    }
}
