using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Linq;
using System.Collections.Generic;
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
// Configuración Dinámica de CORS
builder.Services.AddCors(options =>
{
    var originsConfig = builder.Configuration["AllowedOrigins"];
    var allowedOriginsList = new List<string> { 
        "http://localhost:5173", 
        "http://localhost:3000", 
        "https://matecodes.netlify.app" 
    };

    if (!string.IsNullOrEmpty(originsConfig))
    {
        allowedOriginsList.AddRange(originsConfig.Split(',', StringSplitOptions.RemoveEmptyEntries));
    }

    var allowedOrigins = allowedOriginsList.Distinct().ToArray();

    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .WithHeaders("Content-Type", "Authorization", "X-Tenant-Id")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Inyección de Dependencias
builder.Services.AddSingleton<IEncryptionUtility, EncryptionUtility>();
builder.Services.AddScoped<IAgencyService, AgencyService>();
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
builder.Services.AddScoped<IProjectImportService, ProjectImportService>();

var app = builder.Build(); // --- INICIALIZACIÓN DE BASE DE DATOS (AUTO-SAPPING) ---
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

                IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'organizacion') THEN
                    CREATE SCHEMA organizacion;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'finanzas') THEN
                    CREATE SCHEMA finanzas;
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
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'proyectos' AND table_name = 'proyectos' AND column_name = 'descripcion') THEN
                    ALTER TABLE proyectos.proyectos ADD COLUMN descripcion TEXT DEFAULT '';
                END IF;

                -- Ubicuidad de la Bóveda (Creador ID)
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'plantillas_stack' AND column_name = 'creador_id') THEN
                    ALTER TABLE boveda.plantillas_stack ADD COLUMN creador_id UUID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'plantillas_prompt' AND column_name = 'creador_id') THEN
                    ALTER TABLE boveda.plantillas_prompt ADD COLUMN creador_id UUID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'boveda' AND table_name = 'estandares_catalogo' AND column_name = 'creador_id') THEN
                    ALTER TABLE boveda.estandares_catalogo ADD COLUMN creador_id UUID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'formularios_plantilla' AND column_name = 'creador_id') THEN
                    ALTER TABLE crm.formularios_plantilla ADD COLUMN creador_id UUID;
                END IF;

                -- Infraestructura de Prompts Modulares
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'boveda' AND table_name = 'plantillas_prompt') THEN
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
                END IF;

                -- Columnas para Recursos extendidos (Ingeniería de Prompts)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'organizacion' AND table_name = 'recursos') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'organizacion' AND table_name = 'recursos' AND column_name = 'favorito') THEN
                        ALTER TABLE organizacion.recursos ADD COLUMN favorito BOOLEAN DEFAULT FALSE;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'organizacion' AND table_name = 'recursos' AND column_name = 'categoria') THEN
                        ALTER TABLE organizacion.recursos ADD COLUMN categoria VARCHAR(100) DEFAULT 'General';
                    END IF;
                END IF;

                -- Columnas para CRM de Agencia (Corrección de orden_posicion -> rango_lexicografico)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'leads_agencia') THEN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'leads_agencia' AND column_name = 'orden_posicion') THEN
                        ALTER TABLE crm.leads_agencia RENAME COLUMN orden_posicion TO rango_lexicografico;
                    END IF;
                END IF;

                -- Columna para Nombre de Usuario (nombre_usuario) en usuarios
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'nucleo' AND table_name = 'usuarios') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'nucleo' AND table_name = 'usuarios' AND column_name = 'nombre_usuario') THEN
                        ALTER TABLE nucleo.usuarios ADD COLUMN nombre_usuario VARCHAR(100);
                    END IF;
                END IF;

                -- Columna reunion_id en colab.decisiones (Corrección de error de inserción de Decisiones/Ideas)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'colab' AND table_name = 'decisiones') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'colab' AND table_name = 'decisiones' AND column_name = 'reunion_id') THEN
                        ALTER TABLE colab.decisiones ADD COLUMN reunion_id UUID;
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'colab' AND table_name = 'reuniones') THEN
                            ALTER TABLE colab.decisiones ADD CONSTRAINT fk_decisiones_reunion FOREIGN KEY (reunion_id) REFERENCES colab.reuniones(id) ON DELETE SET NULL;
                        END IF;
                    END IF;
                END IF;

                -- Columna foto_perfil_url en nucleo.usuarios (Soporte para Avatares)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'nucleo' AND table_name = 'usuarios') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'nucleo' AND table_name = 'usuarios' AND column_name = 'foto_perfil_url') THEN
                        ALTER TABLE nucleo.usuarios ADD COLUMN foto_perfil_url TEXT;
                    END IF;
                END IF;

                -- Columna cliente_id en organizacion.recursos (Asociación a Clientes del CRM)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'organizacion' AND table_name = 'recursos') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'organizacion' AND table_name = 'recursos' AND column_name = 'cliente_id') THEN
                        ALTER TABLE organizacion.recursos ADD COLUMN cliente_id UUID;
                        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'clientes') THEN
                            ALTER TABLE organizacion.recursos ADD CONSTRAINT fk_recursos_cliente FOREIGN KEY (cliente_id) REFERENCES crm.clientes(id) ON DELETE SET NULL;
                        END IF;
                    END IF;
                END IF;

                -- Columna activo en organizacion.objetivos (Soft Delete)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'organizacion' AND table_name = 'objetivos') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'organizacion' AND table_name = 'objetivos' AND column_name = 'activo') THEN
                        ALTER TABLE organizacion.objetivos ADD COLUMN activo BOOLEAN DEFAULT TRUE;
                    END IF;
                END IF;


                -- Columnas para Perfil, Branding e Identidad de Agencia (Ciclo 1)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'nucleo' AND table_name = 'agencias') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'nucleo' AND table_name = 'agencias' AND column_name = 'redes_sociales') THEN
                        ALTER TABLE nucleo.agencias ADD COLUMN redes_sociales JSONB DEFAULT '{{}}';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'nucleo' AND table_name = 'agencias' AND column_name = 'branding') THEN
                        ALTER TABLE nucleo.agencias ADD COLUMN branding JSONB DEFAULT '{{}}';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'nucleo' AND table_name = 'agencias' AND column_name = 'mision') THEN
                        ALTER TABLE nucleo.agencias ADD COLUMN mision TEXT DEFAULT '';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'nucleo' AND table_name = 'agencias' AND column_name = 'vision') THEN
                        ALTER TABLE nucleo.agencias ADD COLUMN vision TEXT DEFAULT '';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'nucleo' AND table_name = 'agencias' AND column_name = 'datos_marketing') THEN
                        ALTER TABLE nucleo.agencias ADD COLUMN datos_marketing JSONB DEFAULT '{{}}';
                    END IF;
                END IF;

                -- Columnas y restricciones para Clientes y CRM centralizado (Ciclo 2)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'clientes') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'agencia_id') THEN
                        ALTER TABLE crm.clientes ADD COLUMN agencia_id UUID;
                    END IF;
                    ALTER TABLE crm.clientes ALTER COLUMN espacio_trabajo_id DROP NOT NULL;

                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'categoria') THEN
                        ALTER TABLE crm.clientes ADD COLUMN categoria VARCHAR(100) DEFAULT 'Lead';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'calificacion') THEN
                        ALTER TABLE crm.clientes ADD COLUMN calificacion VARCHAR(50) DEFAULT 'Calificado';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'origen_contacto') THEN
                        ALTER TABLE crm.clientes ADD COLUMN origen_contacto TEXT;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'motivo_contacto') THEN
                        ALTER TABLE crm.clientes ADD COLUMN motivo_contacto TEXT;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'descripcion') THEN
                        ALTER TABLE crm.clientes ADD COLUMN descripcion TEXT;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'notas') THEN
                        ALTER TABLE crm.clientes ADD COLUMN notas JSONB DEFAULT '[]';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'rango_lexicografico') THEN
                        ALTER TABLE crm.clientes ADD COLUMN rango_lexicografico VARCHAR(100) DEFAULT 'a';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'fecha_creacion') THEN
                        ALTER TABLE crm.clientes ADD COLUMN fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'clientes' AND column_name = 'activo') THEN
                        ALTER TABLE crm.clientes ADD COLUMN activo BOOLEAN DEFAULT TRUE;
                    END IF;
                END IF;

                -- Columnas y restricciones para Formularios centralizados (Ciclo 2)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'formularios_plantilla') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'formularios_plantilla' AND column_name = 'agencia_id') THEN
                        ALTER TABLE crm.formularios_plantilla ADD COLUMN agencia_id UUID;
                    END IF;
                    ALTER TABLE crm.formularios_plantilla ALTER COLUMN tenant_id DROP NOT NULL;
                END IF;

                -- Tabla de Contratos de Agencia (Ciclo 3)
                CREATE TABLE IF NOT EXISTS crm.contratos_agencia (
                    id UUID PRIMARY KEY,
                    agencia_id UUID NOT NULL,
                    cliente_id UUID REFERENCES crm.clientes(id) ON DELETE CASCADE,
                    titulo VARCHAR(255) NOT NULL,
                    contenido TEXT NOT NULL,
                    estado VARCHAR(50) NOT NULL,
                    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                    fecha_firma TIMESTAMP WITHOUT TIME ZONE,
                    huella_criptografica TEXT
                );

                -- Asegurar campos para contratos multitipo
                ALTER TABLE crm.contratos_agencia ALTER COLUMN cliente_id DROP NOT NULL;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'contratos_agencia' AND column_name = 'tipo_contrato') THEN
                    ALTER TABLE crm.contratos_agencia ADD COLUMN tipo_contrato VARCHAR(50) NOT NULL DEFAULT 'Cliente';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'crm' AND table_name = 'contratos_agencia' AND column_name = 'miembros_ids') THEN
                    ALTER TABLE crm.contratos_agencia ADD COLUMN miembros_ids JSONB DEFAULT '[]'::jsonb;
                END IF;

                -- Tabla de Historial de Cambios de Contratos (Auditoría)
                CREATE TABLE IF NOT EXISTS crm.contratos_historial (
                    id UUID PRIMARY KEY,
                    contrato_id UUID NOT NULL REFERENCES crm.contratos_agencia(id) ON DELETE CASCADE,
                    usuario_id UUID NOT NULL REFERENCES nucleo.usuarios(id) ON DELETE CASCADE,
                    nombre_usuario VARCHAR(255) NOT NULL,
                    contenido_anterior TEXT NOT NULL,
                    contenido_nuevo TEXT NOT NULL,
                    fecha_cambio TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                );

                -- Tabla de Calendario Operativo (Ciclo 4)
                CREATE TABLE IF NOT EXISTS organizacion.eventos_calendario (
                    id UUID PRIMARY KEY,
                    agencia_id UUID NOT NULL REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
                    cliente_id UUID REFERENCES crm.clientes(id) ON DELETE SET NULL,
                    proyecto_id UUID REFERENCES proyectos.proyectos(id) ON DELETE SET NULL,
                    titulo VARCHAR(255) NOT NULL,
                    descripcion TEXT,
                    fecha_inicio TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                    fecha_fin TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                    tipo VARCHAR(50) NOT NULL,
                    color_hex VARCHAR(10),
                    usuario_responsable_id UUID REFERENCES nucleo.usuarios(id) ON DELETE SET NULL,
                    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                );

                -- Columnas de relaciones en tareas operativas (Ciclo 5)
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'organizacion' AND table_name = 'tareas_operativas') THEN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'organizacion' AND table_name = 'tareas_operativas' AND column_name = 'espacio_trabajo_id') THEN
                        ALTER TABLE organizacion.tareas_operativas ADD COLUMN espacio_trabajo_id UUID REFERENCES nucleo.espacios_trabajo(id) ON DELETE SET NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'organizacion' AND table_name = 'tareas_operativas' AND column_name = 'proyecto_id') THEN
                        ALTER TABLE organizacion.tareas_operativas ADD COLUMN proyecto_id UUID REFERENCES proyectos.proyectos(id) ON DELETE SET NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'organizacion' AND table_name = 'tareas_operativas' AND column_name = 'recurso_id') THEN
                        ALTER TABLE organizacion.tareas_operativas ADD COLUMN recurso_id UUID REFERENCES organizacion.recursos(id) ON DELETE SET NULL;
                    END IF;
                END IF;

                -- Tablas de Columnas Kanban e Informes Semanales (Ciclo 5)
                CREATE TABLE IF NOT EXISTS organizacion.kanban_columnas_operativas (
                    id UUID PRIMARY KEY,
                    agencia_id UUID NOT NULL REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
                    nombre VARCHAR(255) NOT NULL,
                    orden INT NOT NULL,
                    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS organizacion.informes_semanales (
                    id UUID PRIMARY KEY,
                    agencia_id UUID NOT NULL REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
                    fecha_inicio TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                    fecha_fin TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                    metricas_json JSONB NOT NULL DEFAULT '{{}}',
                    lecciones_aprendidas TEXT NOT NULL,
                    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
                );

                -- Sembrar columnas por defecto para agencias que no las tengan
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'organizacion' AND table_name = 'kanban_columnas_operativas') THEN
                    INSERT INTO organizacion.kanban_columnas_operativas (id, agencia_id, nombre, orden, fecha_creacion)
                    SELECT gen_random_uuid(), a.id, 'Todo', 0, NOW() 
                    FROM nucleo.agencias a
                    WHERE NOT EXISTS (SELECT 1 FROM organizacion.kanban_columnas_operativas k WHERE k.agencia_id = a.id);

                    INSERT INTO organizacion.kanban_columnas_operativas (id, agencia_id, nombre, orden, fecha_creacion)
                    SELECT gen_random_uuid(), a.id, 'In Progress', 1, NOW() 
                    FROM nucleo.agencias a
                    WHERE NOT EXISTS (SELECT 1 FROM organizacion.kanban_columnas_operativas k WHERE k.agencia_id = a.id AND k.nombre = 'In Progress');

                    INSERT INTO organizacion.kanban_columnas_operativas (id, agencia_id, nombre, orden, fecha_creacion)
                    SELECT gen_random_uuid(), a.id, 'Done', 2, NOW() 
                    FROM nucleo.agencias a
                    WHERE NOT EXISTS (SELECT 1 FROM organizacion.kanban_columnas_operativas k WHERE k.agencia_id = a.id AND k.nombre = 'Done');
                END IF;

                -- Tabla de Finanzas Corporativas
                CREATE TABLE IF NOT EXISTS finanzas.transacciones_agencia (
                    id UUID PRIMARY KEY,
                    agencia_id UUID NOT NULL REFERENCES nucleo.agencias(id) ON DELETE CASCADE,
                    tipo VARCHAR(50) NOT NULL,
                    monto DECIMAL(12,2) NOT NULL,
                    concepto VARCHAR(255) NOT NULL,
                    descripcion TEXT,
                    fecha DATE NOT NULL,
                    categoria VARCHAR(100),
                    proyecto_id UUID REFERENCES proyectos.proyectos(id) ON DELETE SET NULL,
                    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                -- Tabla de Presupuestos (Ciclo 6)
                CREATE TABLE IF NOT EXISTS finanzas.presupuestos (
                    id UUID PRIMARY KEY,
                    proyecto_id UUID NOT NULL REFERENCES proyectos.proyectos(id) ON DELETE CASCADE,
                    perfil_id UUID NOT NULL,
                    alcance_json JSONB NOT NULL DEFAULT '[]',
                    monto_total DECIMAL(18,2) NOT NULL DEFAULT 0.00
                );
            END $$;";
        context.Database.ExecuteSqlRaw(sql);
        Console.WriteLine("✅ Infraestructura de Bóveda y Stacks verificada exitosamente.");
    } catch (Exception ex) {
        Console.WriteLine("⚠️ Error inicializando tablas de Bóveda: " + ex.Message);
    }
}

// Pipeline de Middleware
app.UseCors("AllowFrontend");
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<TenantResolverMiddleware>();
app.UseMiddleware<MagicLinkMiddleware>();

app.MapControllers().RequireCors("AllowFrontend");
app.MapHub<DevHubHub>("/hub/devhub").RequireCors("AllowFrontend");

// Health check para el "Cold Start" de Render
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
   .RequireCors("AllowFrontend");

app.Run();
