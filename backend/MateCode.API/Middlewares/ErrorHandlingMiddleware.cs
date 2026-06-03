using System;
using System.IO;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MateCode.Core.Exceptions;

namespace MateCode.API.Middlewares
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public ErrorHandlingMiddleware(
            RequestDelegate next, 
            ILogger<ErrorHandlingMiddleware> logger, 
            IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var errorId = $"ERR-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
            
            var statusCode = HttpStatusCode.InternalServerError;
            var errorCode = ErrorCatalog.InternalServerError;
            var friendlyMessage = ErrorCatalog.GetFriendlyMessage(errorCode);
            var devDetails = exception.ToString();

            if (exception is BaseApiException apiEx)
            {
                statusCode = apiEx.StatusCode;
                errorCode = apiEx.ErrorCode;
                friendlyMessage = apiEx.UserFriendlyMessage ?? ErrorCatalog.GetFriendlyMessage(errorCode);
            }

            // Registrar metadatos extras para mayor eficiencia de resolución
            var tenantId = context.Items.TryGetValue("CurrentTenantId", out var tId) ? tId?.ToString() : "N/A";
            var agencyId = context.Request.Headers["X-Agency-Id"].FirstOrDefault() ?? "N/A";
            var requestPath = context.Request.Path;
            var requestMethod = context.Request.Method;

            // logs estructurados y claros para diagnóstico rápido
            var logMessage = $"[{errorId}] Error en {requestMethod} {requestPath} | Tenant: {tenantId} | Agency: {agencyId} | Código: {errorCode} | Mensaje: {exception.Message}";

            if ((int)statusCode >= 500)
            {
                _logger.LogError(exception, logMessage);
            }
            else
            {
                _logger.LogWarning(logMessage);
            }

            // Preparar respuesta
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var responsePayload = new
            {
                errorId = errorId,
                errorCode = errorCode,
                message = exception.Message,
                userFriendlyMessage = friendlyMessage,
                details = _env.IsDevelopment() ? devDetails : null
            };

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var json = JsonSerializer.Serialize(responsePayload, options);
            await context.Response.WriteAsync(json);
        }
    }
}
