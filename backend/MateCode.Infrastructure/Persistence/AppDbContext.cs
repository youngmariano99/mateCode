using Microsoft.EntityFrameworkCore;
using System;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<EspacioTrabajo> EspaciosTrabajo { get; set; }
        public DbSet<MiembroEspacio> MiembrosEspacio { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Proyecto> Proyectos { get; set; }
        public DbSet<Epica> Epicas { get; set; }
        public DbSet<Historia> Historias { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<FeedbackCliente> FeedbackClientes { get; set; }
        public DbSet<PerfilEmpresa> PerfilesEmpresa { get; set; }
        public DbSet<Presupuesto> Presupuestos { get; set; }
        public DbSet<PlantillaStack> PlantillasStack { get; set; }
        public DbSet<Portafolio> Portafolios { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>(e => {
                e.ToTable("usuarios", "nucleo");
                e.Property(u => u.Id).HasColumnName("id");
                e.Property(u => u.Email).HasColumnName("email");
                e.Property(u => u.NombreCompleto).HasColumnName("nombre_completo");
                e.Property(u => u.FechaCreacion).HasColumnName("fecha_creacion");
            });

            modelBuilder.Entity<EspacioTrabajo>(e => {
                e.ToTable("espacios_trabajo", "nucleo");
                e.Property(et => et.Id).HasColumnName("id");
                e.Property(et => et.Nombre).HasColumnName("nombre");
                e.Property(et => et.PropietarioId).HasColumnName("propietario_id");
                e.Property(et => et.FechaCreacion).HasColumnName("fecha_creacion");
            });

            modelBuilder.Entity<MiembroEspacio>(e => {
                e.ToTable("miembros_espacio", "nucleo");
                e.HasKey(me => new { me.EspacioTrabajoId, me.UsuarioId });
                e.Property(me => me.EspacioTrabajoId).HasColumnName("espacio_trabajo_id");
                e.Property(me => me.UsuarioId).HasColumnName("usuario_id");
                e.Property(me => me.EtiquetaRol).HasColumnName("etiqueta_rol");
                e.Property(me => me.MatrizPermisos).HasColumnName("matriz_permisos").HasColumnType("jsonb");
            });

            modelBuilder.Entity<Cliente>(e => {
                e.ToTable("clientes", "crm");
                e.Property(c => c.Id).HasColumnName("id");
                e.Property(c => c.EspacioTrabajoId).HasColumnName("espacio_trabajo_id");
                e.Property(c => c.Nombre).HasColumnName("nombre");
                e.Property(c => c.Email).HasColumnName("email");
                e.Property(c => c.Estado).HasColumnName("estado");
                e.Property(c => c.TokenEnlaceMagico).HasColumnName("token_enlace_magico");
            });

            modelBuilder.Entity<Proyecto>(e => {
                e.ToTable("proyectos", "proyectos");
                e.Property(p => p.Id).HasColumnName("id");
                e.Property(p => p.TenantId).HasColumnName("tenant_id");
                e.Property(p => p.ClienteId).HasColumnName("cliente_id");
                e.Property(p => p.Nombre).HasColumnName("nombre");
                e.Property(p => p.FaseActual).HasColumnName("fase_actual");
                e.Property(p => p.FechaCreacion).HasColumnName("fecha_creacion");
                e.Property(p => p.ContextoJson).HasColumnName("contexto_json").HasColumnType("jsonb");
            });

            modelBuilder.Entity<Epica>(e => e.ToTable("epicas", "agil"));
            modelBuilder.Entity<Historia>(e => e.ToTable("historias", "agil"));
            modelBuilder.Entity<Ticket>(e => e.ToTable("tickets", "agil"));
            modelBuilder.Entity<FeedbackCliente>(e => e.ToTable("feedback_cliente", "agil"));

            modelBuilder.Entity<PerfilEmpresa>(e => e.ToTable("perfiles_empresa", "finanzas"));
            modelBuilder.Entity<Presupuesto>(e => e.ToTable("presupuestos", "finanzas"));

            modelBuilder.Entity<PlantillaStack>(e => {
                e.ToTable("plantillas_stack", "boveda");
                e.Property(ps => ps.Id).HasColumnName("id");
                e.Property(ps => ps.EspacioTrabajoId).HasColumnName("espacio_trabajo_id");
                e.Property(ps => ps.Nombre).HasColumnName("nombre");
                e.Property(ps => ps.PayloadTecnico).HasColumnName("payload_tecnico").HasColumnType("jsonb");
            });

            modelBuilder.Entity<Portafolio>(e => {
                e.ToTable("portafolios", "boveda");
                e.Property(p => p.Id).HasColumnName("id");
                e.Property(p => p.EspacioTrabajoId).HasColumnName("espacio_trabajo_id");
                e.Property(p => p.ProyectoOriginalId).HasColumnName("proyecto_original_id");
                e.Property(p => p.PayloadLimpio).HasColumnName("payload_limpio").HasColumnType("jsonb");
            });
        }
    }
}
