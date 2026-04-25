using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MateCode.Infrastructure.Persistence;
using MateCode.Infrastructure.Services;
using MateCode.Application.Services;
using MateCode.API.Middlewares;
using MateCode.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Controladores y SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Base de Datos PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Autenticación Segura (Supabase JWT Bearer Integration)
var supabaseSignatureKey = builder.Configuration["Supabase:SignatureKey"] 
    ?? "CLAVE_ULTRA_SECRETA_SUPABASE_PARA_DESARROLLO_LOCAL_00000000000000";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var supabaseUrl = builder.Configuration["Supabase:Url"];

        // 👇 ESTA ES LA MAGIA: .NET va a ir a Supabase a buscar la llave ECC automáticamente
        options.Authority = $"{supabaseUrl}/auth/v1";

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            // ¡ELIMINAMOS el IssuerSigningKey manual! Ya no hace falta.
            
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl}/auth/v1",
            
            ValidateAudience = false, // Lo dejamos en false para evitar problemas en local
            ValidateLifetime = true
        };

        // Dejamos el espía por si las moscas
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("\n🔴 [JWT ERROR DETECTADO]: " + context.Exception.Message + "\n");
                return Task.CompletedTask;
            }
        };
    });
// Configuración Severa CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Inyección de Dependencias
builder.Services.AddScoped<ICrmService, CrmService>();
builder.Services.AddScoped<IAgileService, AgileService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IFinanceService, FinanceService>();
builder.Services.AddScoped<IKanbanService, KanbanService>();
builder.Services.AddScoped<IPromptEngineService, PromptEngineService>();
builder.Services.AddScoped<IHarvestService, HarvestService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IVaultService, VaultService>();
builder.Services.AddScoped<IPortfolioService, PortfolioService>();
builder.Services.AddScoped<IWorkspaceService, WorkspaceService>();
builder.Services.AddScoped<IPromptLibraryService, PromptLibraryService>();
builder.Services.AddScoped<IFormLibraryService, FormLibraryService>();
builder.Services.AddScoped<IDatabaseSyncService, DatabaseSyncService>();
builder.Services.AddScoped<IBacklogService, BacklogService>();
builder.Services.AddScoped<IColabService, ColabService>();
builder.Services.AddScoped<IOracleService, OracleService>();

var app = builder.Build();

// --- INICIALIZACIÓN DE BASE DE DATOS (AUTO-SAPPING) ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    try {
        string sql = @"
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'boveda') THEN
                    CREATE SCHEMA boveda;
                END IF;

                -- Catálogo de Tecnologías (Evolución)
                IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'boveda' AND table_name = 'tecnologias_catalogo') THEN
                    CREATE TABLE boveda.tecnologias_catalogo (
                        id UUID PRIMARY KEY,
                        tenant_id UUID,
                        nombre VARCHAR(100) NOT NULL,
                        categoria_principal VARCHAR(100) NOT NULL,
                        categoria_secundaria VARCHAR(100) NOT NULL,
                        url_documentacion TEXT,
                        color_hex VARCHAR(10) DEFAULT '#10B981',
                        fecha_creacion TIMESTAMP DEFAULT NOW()
                    );
                ELSE
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'tecnologias_catalogo' AND column_name = 'categoria') THEN
                        ALTER TABLE boveda.tecnologias_catalogo RENAME COLUMN categoria TO categoria_principal;
                    END IF;
                    
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'tecnologias_catalogo' AND column_name = 'categoria_secundaria') THEN
                        ALTER TABLE boveda.tecnologias_catalogo ADD COLUMN categoria_secundaria VARCHAR(100) DEFAULT 'Plataforma / Herramienta';
                    END IF;
                END IF;

                CREATE TABLE IF NOT EXISTS proyectos.proyecto_stack (
                    id UUID PRIMARY KEY,
                    proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
                    tecnologia_id UUID NOT NULL REFERENCES boveda.tecnologias_catalogo(id),
                    descripcion_uso TEXT
                );

                CREATE TABLE IF NOT EXISTS boveda.plantillas_stack (
                    id UUID PRIMARY KEY,
                    tenant_id UUID NOT NULL,
                    nombre VARCHAR(150) NOT NULL,
                    descripcion TEXT,
                    tecnologias_ids_json JSONB NOT NULL,
                    fecha_creacion TIMESTAMP DEFAULT NOW()
                );

                -- Columnas de Soft Delete (Seguridad)
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'tecnologias_catalogo' AND column_name = 'activo') THEN
                    ALTER TABLE boveda.tecnologias_catalogo ADD COLUMN activo BOOLEAN DEFAULT TRUE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'plantillas_stack' AND column_name = 'activo') THEN
                    ALTER TABLE boveda.plantillas_stack ADD COLUMN activo BOOLEAN DEFAULT TRUE;
                END IF;
                -- Infraestructura de Prompts Modulares
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'plantillas_prompt' AND column_name = 'bloque_persona') THEN
                    ALTER TABLE boveda.plantillas_prompt ADD COLUMN bloque_persona TEXT DEFAULT '';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'plantillas_prompt' AND column_name = 'bloque_tarea') THEN
                    ALTER TABLE boveda.plantillas_prompt ADD COLUMN bloque_tarea TEXT DEFAULT '';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'plantillas_prompt' AND column_name = 'tipo_diagrama') THEN
                    ALTER TABLE boveda.plantillas_prompt ADD COLUMN tipo_diagrama VARCHAR(50) DEFAULT 'General';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'plantillas_prompt' AND column_name = 'inyecta_blueprint') THEN
                    ALTER TABLE boveda.plantillas_prompt ADD COLUMN inyecta_blueprint BOOLEAN DEFAULT FALSE;
                END IF;
            END $$;";
        context.Database.ExecuteSqlRaw(sql);
        Console.WriteLine("✅ Infraestructura de Bóveda y Stacks verificada exitosamente.");
    } catch (Exception ex) {
        Console.WriteLine("⚠️ Error inicializando tablas de Bóveda: " + ex.Message);
    }
}

// Pipeline de Middleware
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<TenantResolverMiddleware>();
app.UseMiddleware<MagicLinkMiddleware>();

app.MapControllers();
app.MapHub<DevHubHub>("/hub/devhub");

app.Run();
