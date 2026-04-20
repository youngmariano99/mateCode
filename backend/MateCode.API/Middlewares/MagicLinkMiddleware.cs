using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace MateCode.API.Middlewares
{
    public class MagicLinkMiddleware
    {
        private readonly RequestDelegate _next;

        public MagicLinkMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var magicToken = context.Request.Query["magic_token"].ToString() 
                             ?? context.Request.Headers["X-Magic-Token"].ToString();

            if (!string.IsNullOrEmpty(magicToken))
            {
                // Resolución dinámica del DbContext en middlewares por solicitud HTTP
                var dbContext = context.RequestServices.GetRequiredService<MateCode.Infrastructure.Persistence.AppDbContext>();

                // Operación segura (Protección contra Sql-Injection y Timing attack delegada a EF Core/Postgres)
                var client = await dbContext.Clientes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.TokenEnlaceMagico == magicToken);

                if (client != null)
                {
                    // Establecemos las variables de solo lectura para el contexto actual bloqueando el acceso general.
                    context.Items["IsMagicLinkClient"] = true;
                    
                    // Forzamos la identificación cruzada para los selectores de proyecto ligados a este cliente
                    context.Items["MagicClientId"] = client.Id;
                    context.Items["MagicWorkspaceId"] = client.EspacioTrabajoId;
                }
                else
                {
                    context.Response.StatusCode = 401; // No Autorizado si el token no existe
                    await context.Response.WriteAsync("Token Mágico Inválido o Expirado.");
                    return;
                }
            }

            await _next(context);
        }
    }
}
