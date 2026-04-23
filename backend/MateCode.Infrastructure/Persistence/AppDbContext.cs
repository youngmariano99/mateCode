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
        public DbSet<Release> Releases { get; set; }
        public DbSet<PersonaProyecto> PersonasProyecto { get; set; }
        public DbSet<Feature> Features { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<FeedbackCliente> FeedbackClientes { get; set; }
        public DbSet<PerfilEmpresa> PerfilesEmpresa { get; set; }
        public DbSet<Presupuesto> Presupuestos { get; set; }
        public DbSet<Portafolio> Portafolios { get; set; }
        public DbSet<KanbanColumna> KanbanColumnas { get; set; }
        public DbSet<Diagrama> Diagramas { get; set; }
        public DbSet<PlantillaPrompt> PlantillasPrompt { get; set; }
        public DbSet<FormularioPlantilla> FormulariosPlantilla { get; set; }
        public DbSet<TecnologiaCatalogo> TecnologiasCatalogo { get; set; }
        public DbSet<ProyectoStack> ProyectosStack { get; set; }
        public DbSet<PlantillaStack> PlantillasStack { get; set; }
        public DbSet<EstandarCatalogo> EstandaresCatalogo { get; set; }
        public DbSet<ProyectoEstandar> ProyectosEstandares { get; set; }

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
                e.Property(c => c.ContextoJson).HasColumnName("contexto_json").HasColumnType("jsonb");
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

            modelBuilder.Entity<Release>(e => {
                e.ToTable("releases", "agil");
                e.Property(r => r.Id).HasColumnName("id");
                e.Property(r => r.ProyectoId).HasColumnName("proyecto_id");
                e.Property(r => r.Nombre).HasColumnName("nombre");
                e.Property(r => r.Descripcion).HasColumnName("descripcion");
                e.Property(r => r.OrdenPosicion).HasColumnName("orden_posicion");
            });

            modelBuilder.Entity<PersonaProyecto>(e => {
                e.ToTable("personas_proyecto", "agil");
                e.Property(p => p.Id).HasColumnName("id");
                e.Property(p => p.ProyectoId).HasColumnName("proyecto_id");
                e.Property(p => p.Nombre).HasColumnName("nombre");
                e.Property(p => p.Rol).HasColumnName("rol");
            });

            modelBuilder.Entity<Feature>(e => {
                e.ToTable("features", "agil");
                e.Property(f => f.Id).HasColumnName("id");
                e.Property(f => f.EpicaId).HasColumnName("epica_id");
                e.Property(f => f.Nombre).HasColumnName("nombre");
                e.Property(f => f.ColorHex).HasColumnName("color_hex");
                e.Property(f => f.OrdenPosicion).HasColumnName("orden_posicion");
            });

            modelBuilder.Entity<Epica>(e => {
                e.ToTable("epicas", "agil");
                e.Property(ep => ep.Id).HasColumnName("id");
                e.Property(ep => ep.ProyectoId).HasColumnName("proyecto_id");
                e.Property(ep => ep.Titulo).HasColumnName("titulo");
                e.Property(ep => ep.ColorHex).HasColumnName("color_hex");
                e.Property(ep => ep.OrdenPosicion).HasColumnName("orden_posicion");
            });

            modelBuilder.Entity<Historia>(e => {
                e.ToTable("historias", "agil");
                e.Property(h => h.Id).HasColumnName("id");
                e.Property(h => h.FeatureId).HasColumnName("feature_id");
                e.Property(h => h.ReleaseId).HasColumnName("release_id");
                e.Property(h => h.ProyectoId).HasColumnName("proyecto_id");
                e.Property(h => h.Titulo).HasColumnName("titulo");
                e.Property(h => h.UsuarioNarrativo).HasColumnName("usuario_narrativo");
                e.Property(h => h.CriteriosBdd).HasColumnName("criterios_bdd");
                e.Property(h => h.CriteriosAceptacion).HasColumnName("criterios_aceptacion").HasColumnType("jsonb");
                e.Property(h => h.Prioridad).HasColumnName("prioridad");
                e.Property(h => h.TareasTecnicasJson).HasColumnName("tareas_tecnicas_json").HasColumnType("jsonb");
                e.Property(h => h.RangoLexicografico).HasColumnName("rango_lexicografico");
            });

            modelBuilder.Entity<Ticket>(e => {
                e.ToTable("tickets", "agil");
                e.Property(t => t.Id).HasColumnName("id");
                e.Property(t => t.ProyectoId).HasColumnName("proyecto_id");
                e.Property(t => t.HistoriaId).HasColumnName("historia_id");
                e.Property(t => t.Tipo).HasColumnName("tipo");
                e.Property(t => t.Titulo).HasColumnName("titulo");
                e.Property(t => t.Estado).HasColumnName("estado");
                e.Property(t => t.ResponsableId).HasColumnName("responsable_id");
                e.Property(t => t.RangoLexicografico).HasColumnName("rango_lexicografico");
            });

            modelBuilder.Entity<FeedbackCliente>(e => {
                e.ToTable("feedback_cliente", "agil");
                e.Property(f => f.Id).HasColumnName("id");
                e.Property(f => f.ProyectoId).HasColumnName("proyecto_id");
                e.Property(f => f.Comentario).HasColumnName("comentario");
                e.Property(f => f.Fecha).HasColumnName("fecha");
                e.Property(f => f.Procesado).HasColumnName("procesado");
            });

            modelBuilder.Entity<PerfilEmpresa>(e => e.ToTable("perfiles_empresa", "finanzas"));
            modelBuilder.Entity<Presupuesto>(e => e.ToTable("presupuestos", "finanzas"));

            modelBuilder.Entity<PlantillaStack>(e => {
                e.ToTable("plantillas_stack", "boveda");
                e.Property(ps => ps.Id).HasColumnName("id");
                e.Property(ps => ps.TenantId).HasColumnName("tenant_id");
                e.Property(ps => ps.Nombre).HasColumnName("nombre");
                e.Property(ps => ps.Descripcion).HasColumnName("descripcion");
                e.Property(ps => ps.TecnologiasIdsJson).HasColumnName("tecnologias_ids_json").HasColumnType("jsonb");
                e.Property(ps => ps.FechaCreacion).HasColumnName("fecha_creacion");
            });

            modelBuilder.Entity<Portafolio>(e => {
                e.ToTable("portafolios", "boveda");
                e.Property(p => p.Id).HasColumnName("id");
                e.Property(p => p.EspacioTrabajoId).HasColumnName("espacio_trabajo_id");
                e.Property(p => p.ProyectoOriginalId).HasColumnName("proyecto_original_id");
                e.Property(p => p.PayloadLimpio).HasColumnName("payload_limpio").HasColumnType("jsonb");
            });

            modelBuilder.Entity<KanbanColumna>(e => {
                e.ToTable("kanban_columnas", "agil");
                e.Property(c => c.Id).HasColumnName("id");
                e.Property(c => c.ProyectoId).HasColumnName("proyecto_id");
                e.Property(c => c.TenantId).HasColumnName("tenant_id");
                e.Property(c => c.Nombre).HasColumnName("nombre");
                e.Property(c => c.OrdenPosicion).HasColumnName("orden_posicion");
            });

            modelBuilder.Entity<TecnologiaCatalogo>(e => {
                e.ToTable("tecnologias_catalogo", "boveda");
                e.Property(t => t.Id).HasColumnName("id");
                e.Property(t => t.TenantId).HasColumnName("tenant_id");
                e.Property(t => t.Nombre).HasColumnName("nombre");
                e.Property(t => t.CategoriaPrincipal).HasColumnName("categoria_principal");
                e.Property(t => t.CategoriaSecundaria).HasColumnName("categoria_secundaria");
                e.Property(t => t.UrlDocumentacion).HasColumnName("url_documentacion");
                e.Property(t => t.ColorHex).HasColumnName("color_hex");
                e.Property(t => t.FechaCreacion).HasColumnName("fecha_creacion");
            });

            modelBuilder.Entity<ProyectoStack>(e => {
                e.ToTable("proyecto_stack", "proyectos");
                e.Property(t => t.Id).HasColumnName("id");
                e.Property(t => t.ProyectoId).HasColumnName("proyecto_id");
                e.Property(t => t.TecnologiaId).HasColumnName("tecnologia_id");
                e.Property(t => t.DescripcionUso).HasColumnName("descripcion_uso");
                e.HasOne(t => t.Tecnologia).WithMany().HasForeignKey(t => t.TecnologiaId);
            });

            modelBuilder.Entity<Diagrama>(e => {
                e.ToTable("diagramas", "proyectos");
                e.Property(d => d.Id).HasColumnName("id");
                e.Property(d => d.ProyectoId).HasColumnName("proyecto_id");
                e.Property(d => d.Tipo).HasColumnName("tipo");
                e.Property(d => d.ContenidoCodigo).HasColumnName("contenido_codigo");
                e.Property(d => d.FechaActualizacion).HasColumnName("fecha_actualizacion");
            });

            modelBuilder.Entity<PlantillaPrompt>(e => {
                e.ToTable("plantillas_prompt", "boveda");
                e.Property(p => p.Id).HasColumnName("id");
                e.Property(p => p.TenantId).HasColumnName("tenant_id");
                e.Property(p => p.Titulo).HasColumnName("titulo");
                e.Property(p => p.Descripcion).HasColumnName("descripcion");
                e.Property(p => p.ContenidoPlantilla).HasColumnName("contenido_plantilla");
                e.Property(p => p.FaseObjetivo).HasColumnName("fase_objetivo");
                e.Property(p => p.EtiquetasJson).HasColumnName("etiquetas").HasColumnType("jsonb");
                e.Property(p => p.InyectaAdn).HasColumnName("inyecta_adn");
                e.Property(p => p.InyectaStack).HasColumnName("inyecta_stack");
                e.Property(p => p.InyectaBdd).HasColumnName("inyecta_bdd");
                e.Property(p => p.InyectaTicket).HasColumnName("inyecta_ticket");
                e.Property(p => p.FechaCreacion).HasColumnName("fecha_creacion");
            });

            modelBuilder.Entity<FormularioPlantilla>(e => {
                e.ToTable("formularios_plantilla", "crm");
                e.Property(f => f.Id).HasColumnName("id");
                e.Property(f => f.TenantId).HasColumnName("tenant_id");
                e.Property(f => f.Nombre).HasColumnName("nombre");
                e.Property(f => f.Tipo).HasColumnName("tipo");
                e.Property(f => f.ConfiguracionJson).HasColumnName("configuracion_json").HasColumnType("jsonb");
                e.Property(f => f.FechaCreacion).HasColumnName("fecha_creacion");
            });

            modelBuilder.Entity<EstandarCatalogo>(e => {
                e.ToTable("estandares_catalogo", "boveda");
                e.Property(ec => ec.Id).HasColumnName("id");
                e.Property(ec => ec.EspacioTrabajoId).HasColumnName("espacio_trabajo_id");
                e.Property(ec => ec.Categoria).HasColumnName("categoria");
                e.Property(ec => ec.Nombre).HasColumnName("nombre");
                e.Property(ec => ec.DescripcionDidactica).HasColumnName("descripcion_didactica");
                e.Property(ec => ec.ColorHex).HasColumnName("color_hex");
                e.Property(ec => ec.EliminadoEn).HasColumnName("eliminado_en");
            });

            modelBuilder.Entity<ProyectoEstandar>(e => {
                e.ToTable("proyecto_estandar", "proyectos");
                e.HasKey(pe => new { pe.ProyectoId, pe.EstandarId });
                e.Property(pe => pe.ProyectoId).HasColumnName("proyecto_id");
                e.Property(pe => pe.EstandarId).HasColumnName("estandar_id");
                e.HasOne(pe => pe.Proyecto).WithMany().HasForeignKey(pe => pe.ProyectoId);
                e.HasOne(pe => pe.Estandar).WithMany().HasForeignKey(pe => pe.EstandarId);
            });
        }
    }
}
