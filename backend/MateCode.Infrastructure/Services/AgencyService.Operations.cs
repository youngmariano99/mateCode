using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public partial class AgencyService
    {
        // --- OBJETIVOS ---
        public async Task<IEnumerable<Objetivo>> GetGoalsAsync(Guid agencyId, Guid? userId = null)
        {
            var query = _context.Objetivos
                .Include(o => o.UsuarioAsignado)
                .Where(o => o.AgenciaId == agencyId && o.Activo);
            if (userId.HasValue)
            {
                query = query.Where(o => o.UsuarioAsignadoId == userId.Value);
            }
            return await query.OrderByDescending(o => o.FechaCreacion).ToListAsync();
        }

        public async Task<Objetivo> CreateGoalAsync(Guid agencyId, Guid assignedUserId, Guid creatorId, string titulo, string descripcion, string periodType, DateTime? limitDate)
        {
            var goal = new Objetivo
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                UsuarioAsignadoId = assignedUserId,
                CreadorId = creatorId,
                Titulo = titulo,
                Descripcion = descripcion,
                TipoPeriodo = periodType,
                FechaLimite = limitDate,
                Completado = false,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.Objetivos.AddAsync(goal);
            await _context.SaveChangesAsync();
            
            // Load assigned user reference
            await _context.Entry(goal).Reference(g => g.UsuarioAsignado).LoadAsync();

            return goal;
        }

        public async Task<bool> ToggleGoalAsync(Guid goalId, bool completed)
        {
            var goal = await _context.Objetivos.FindAsync(goalId);
            if (goal == null || !goal.Activo) return false;

            goal.Completado = completed;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Objetivo?> UpdateGoalAsync(Guid goalId, Guid assignedUserId, string titulo, string descripcion, string periodType, DateTime? limitDate)
        {
            var goal = await _context.Objetivos.FindAsync(goalId);
            if (goal == null || !goal.Activo) return null;

            goal.UsuarioAsignadoId = assignedUserId;
            goal.Titulo = titulo;
            goal.Descripcion = descripcion;
            goal.TipoPeriodo = periodType;
            goal.FechaLimite = limitDate;

            await _context.SaveChangesAsync();
            await _context.Entry(goal).Reference(g => g.UsuarioAsignado).LoadAsync();

            return goal;
        }

        public async Task<bool> DeleteGoalAsync(Guid goalId)
        {
            var goal = await _context.Objetivos.FindAsync(goalId);
            if (goal == null || !goal.Activo) return false;

            goal.Activo = false; // Soft delete
            return await _context.SaveChangesAsync() > 0;
        }

        // --- RECURSOS ---
        public async Task<IEnumerable<Recurso>> GetResourcesAsync(Guid agencyId)
        {
            return await _context.Recursos
                .Include(r => r.Cliente)
                .Where(r => r.AgenciaId == agencyId)
                .OrderByDescending(r => r.FechaCreacion)
                .ToListAsync();
        }

        public async Task<Recurso> CreateResourceAsync(Guid agencyId, Guid creatorId, string titulo, string contenido, string tipo, JsonElement etiquetas, JsonElement rolesPermitidos, string categoria = "General", Guid? clienteId = null)
        {
            var resource = new Recurso
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                CreadorId = creatorId,
                Titulo = titulo,
                Contenido = contenido,
                Tipo = tipo,
                Etiquetas = etiquetas,
                RolesPermitidos = rolesPermitidos,
                Categoria = categoria,
                ClienteId = clienteId,
                Favorito = false,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.Recursos.AddAsync(resource);
            await _context.SaveChangesAsync();
            return resource;
        }

        public async Task<bool> UpdateResourceAsync(Guid resourceId, string titulo, string contenido, string tipo, JsonElement etiquetas, JsonElement rolesPermitidos, string categoria = "General", bool favorito = false, Guid? clienteId = null)
        {
            var resource = await _context.Recursos.FindAsync(resourceId);
            if (resource == null) return false;

            resource.Titulo = titulo;
            resource.Contenido = contenido;
            resource.Tipo = tipo;
            resource.Etiquetas = etiquetas;
            resource.RolesPermitidos = rolesPermitidos;
            resource.Categoria = categoria;
            resource.Favorito = favorito;
            resource.ClienteId = clienteId;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ToggleResourceFavoriteAsync(Guid resourceId, bool favorito)
        {
            var resource = await _context.Recursos.FindAsync(resourceId);
            if (resource == null) return false;

            resource.Favorito = favorito;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteResourceAsync(Guid resourceId)
        {
            var resource = await _context.Recursos.FindAsync(resourceId);
            if (resource == null) return false;

            _context.Recursos.Remove(resource);
            return await _context.SaveChangesAsync() > 0;
        }

        // --- TAREAS OPERATIVAS ---
        public async Task<IEnumerable<TareaOperativa>> GetTasksAsync(Guid agencyId)
        {
            return await _context.TareasOperativas
                .Include(t => t.EspacioTrabajo)
                .Include(t => t.Proyecto)
                .Include(t => t.Recurso)
                .Where(t => t.AgenciaId == agencyId)
                .OrderBy(t => t.RangoLexicografico)
                .ToListAsync();
        }

        public async Task<TareaOperativa> CreateTaskAsync(Guid agencyId, string titulo, string descripcion, string estado, DateTime? planificada, Guid? assignedUserId, Guid? espacioTrabajoId = null, Guid? proyectoId = null, Guid? recursoId = null)
        {
            var task = new TareaOperativa
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                Titulo = titulo,
                Descripcion = descripcion,
                Estado = estado,
                FechaPlanificada = planificada.HasValue ? DateTime.SpecifyKind(planificada.Value, DateTimeKind.Utc) : null,
                UsuarioAsignadoId = assignedUserId,
                EspacioTrabajoId = espacioTrabajoId,
                ProyectoId = proyectoId,
                RecursoId = recursoId,
                RangoLexicografico = "a",
                FechaCreacion = DateTime.UtcNow
            };

            await _context.TareasOperativas.AddAsync(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<bool> UpdateTaskStatusAsync(Guid taskId, string estado, string position)
        {
            var task = await _context.TareasOperativas.FindAsync(taskId);
            if (task == null) return false;

            task.Estado = estado;
            task.RangoLexicografico = position;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateTaskAsync(Guid taskId, string titulo, string descripcion, string estado, DateTime? planificada, Guid? assignedUserId, Guid? espacioTrabajoId = null, Guid? proyectoId = null, Guid? recursoId = null)
        {
            var task = await _context.TareasOperativas.FindAsync(taskId);
            if (task == null) return false;

            task.Titulo = titulo;
            task.Descripcion = descripcion;
            task.Estado = estado;
            task.FechaPlanificada = planificada.HasValue ? DateTime.SpecifyKind(planificada.Value, DateTimeKind.Utc) : null;
            task.UsuarioAsignadoId = assignedUserId;
            task.EspacioTrabajoId = espacioTrabajoId;
            task.ProyectoId = proyectoId;
            task.RecursoId = recursoId;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteTaskAsync(Guid taskId)
        {
            var task = await _context.TareasOperativas.FindAsync(taskId);
            if (task == null) return false;

            _context.TareasOperativas.Remove(task);
            return await _context.SaveChangesAsync() > 0;
        }

        // --- PLANIFICADOR DE CONTENIDO ---
        public async Task<IEnumerable<PlanificadorContenido>> GetContentsAsync(Guid agencyId)
        {
            return await _context.PlanificadorContenidos
                .Where(p => p.AgenciaId == agencyId)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        public async Task<PlanificadorContenido> CreateContentAsync(Guid agencyId, Guid memberId, string titulo, JsonElement plataformas, string guion, string dialogo, string procedimiento, string estado, string notasMejora, JsonElement? resumenAnalitico = null, DateTime? fechaPublicacion = null)
        {
            var content = new PlanificadorContenido
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                MiembroId = memberId,
                Titulo = titulo,
                Plataformas = plataformas,
                GuionPlantilla = guion,
                Dialogo = dialogo,
                ProcedimientoEstandar = procedimiento,
                Estado = estado,
                NotasMejora = notasMejora,
                ResumenAnalitico = resumenAnalitico ?? JsonSerializer.Deserialize<JsonElement>("{}"),
                FechaPublicacion = fechaPublicacion.HasValue ? DateTime.SpecifyKind(fechaPublicacion.Value, DateTimeKind.Utc) : null,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.PlanificadorContenidos.AddAsync(content);
            await _context.SaveChangesAsync();
            return content;
        }

        public async Task<bool> UpdateContentAsync(Guid contentId, string titulo, JsonElement plataformas, string guion, string dialogo, string procedimiento, string estado, string notasMejora, JsonElement resumenAnalitico, DateTime? publishDate)
        {
            var content = await _context.PlanificadorContenidos.FindAsync(contentId);
            if (content == null) return false;

            content.Titulo = titulo;
            content.Plataformas = plataformas;
            content.GuionPlantilla = guion;
            content.Dialogo = dialogo;
            content.ProcedimientoEstandar = procedimiento;
            content.Estado = estado;
            content.NotasMejora = notasMejora;
            content.ResumenAnalitico = resumenAnalitico;
            content.FechaPublicacion = publishDate.HasValue ? DateTime.SpecifyKind(publishDate.Value, DateTimeKind.Utc) : null;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteContentAsync(Guid contentId)
        {
            var content = await _context.PlanificadorContenidos.FindAsync(contentId);
            if (content == null) return false;

            _context.PlanificadorContenidos.Remove(content);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
