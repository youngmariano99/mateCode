using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MateCode.Infrastructure.Persistence;
using MateCode.Infrastructure.Services;
using MateCode.Application.Services;
using MateCode.API.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Controladores
builder.Services.AddControllers();

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
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(supabaseSignatureKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true
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

var app = builder.Build();

// Pipeline de Middleware
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<TenantResolverMiddleware>();
app.UseMiddleware<MagicLinkMiddleware>();

app.MapControllers();

app.Run();
