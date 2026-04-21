using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MateCode.Infrastructure.Persistence;
using System;
using System.Threading.Tasks;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql("Host=localhost;Database=matecode;Username=postgres;Password=postgres")); // El usuario deberá ajustar esto si es remoto, pero intentaré usar la inyección si puedo.

// Mejor aún: Usar el Program.cs existente para inyectar y ejecutar un comando de migración manual.
// Pero para ser rápido, crearé un script que tome la cadena de conexión de appsettings.json.
