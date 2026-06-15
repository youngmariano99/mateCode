using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public interface IAgencyService
    {
        // --- AGENCIA Y MIEMBROS ---
        Task<IEnumerable<Agencia>> GetAgenciesByUserAsync(Guid userId);
        Task<Agencia> CreateAgencyAsync(string name, Guid ownerId);
        Task<bool> UpdateAgencyProfileAsync(Guid agencyId, string name, JsonElement redesSociales, JsonElement branding, string mision, string vision, JsonElement datosMarketing);
        Task<bool> DeleteAgencyAsync(Guid agencyId);
        Task<bool> UpdateAgencyNameAsync(Guid agencyId, string name);
        Task<IEnumerable<object>> GetAgencyMembersAsync(Guid agencyId);
        Task<bool> AddMemberToAgencyAsync(Guid agencyId, Guid userId, string role, JsonElement permissions);
        Task<bool> InviteMemberToAgencyAsync(Guid agencyId, string email, string role = "Colaborador", JsonElement? permissions = null);
        Task<bool> UpdateMemberPermissionsAsync(Guid agencyId, Guid userId, string role, JsonElement permissions);
        Task<IEnumerable<object>> GetPendingInvitationsAsync(Guid userId);
        Task<bool> AcceptInvitationAsync(Guid userId, Guid agencyId);
        Task<bool> RejectInvitationAsync(Guid userId, Guid agencyId);
        Task<IEnumerable<EspacioTrabajo>> GetWorkspacesByAgencyAsync(Guid agencyId);
        Task<IEnumerable<object>> GetWorkspacesWithProjectsAsync(Guid agencyId);

        // --- CRM CLIENTES Y LEADS ---
        Task<IEnumerable<Cliente>> GetLeadsAsync(Guid agencyId);
        Task<IEnumerable<string>> GetUniqueRubrosAsync(Guid agencyId);
        Task<Cliente> CreateLeadAsync(
            Guid agencyId, 
            string nombre, 
            string email, 
            string category, 
            string qualification, 
            string origen, 
            string motivo, 
            string descripcion,
            string? rubro = null,
            string? direccionTexto = null,
            double? latitud = null,
            double? longitud = null,
            string[]? etiquetasRapidas = null,
            string? tipoSoftwareTiene = null,
            string? tipoSoftwareQuiere = null,
            string? doloresNotas = null,
            JsonElement? bitacoraContactos = null,
            JsonElement? linksRecursos = null);
        Task<bool> UpdateLeadStatusAsync(Guid leadId, string category, string position);
        Task<bool> UpdateLeadAsync(
            Guid leadId, 
            string nombre, 
            string email, 
            string category, 
            string qualification, 
            string origen, 
            string motivo, 
            string descripcion, 
            JsonElement notas,
            string? rubro = null,
            string? direccionTexto = null,
            double? latitud = null,
            double? longitud = null,
            string[]? etiquetasRapidas = null,
            string? tipoSoftwareTiene = null,
            string? tipoSoftwareQuiere = null,
            string? doloresNotas = null,
            JsonElement? bitacoraContactos = null,
            JsonElement? linksRecursos = null);
        Task<bool> DeleteLeadAsync(Guid leadId);

        // --- OBJETIVOS ---
        Task<IEnumerable<Objetivo>> GetGoalsAsync(Guid agencyId, Guid? userId = null);
        Task<Objetivo> CreateGoalAsync(Guid agencyId, Guid assignedUserId, Guid creatorId, string titulo, string descripcion, string periodType, DateTime? limitDate);
        Task<bool> ToggleGoalAsync(Guid goalId, bool completed);
        Task<Objetivo?> UpdateGoalAsync(Guid goalId, Guid assignedUserId, string titulo, string descripcion, string periodType, DateTime? limitDate);
        Task<bool> DeleteGoalAsync(Guid goalId);

        // --- RECURSOS ---
        Task<IEnumerable<Recurso>> GetResourcesAsync(Guid agencyId);
        Task<Recurso> CreateResourceAsync(Guid agencyId, Guid creatorId, string titulo, string contenido, string tipo, JsonElement etiquetas, JsonElement rolesPermitidos, string categoria = "General", Guid? clienteId = null);
        Task<bool> UpdateResourceAsync(Guid resourceId, string titulo, string contenido, string tipo, JsonElement etiquetas, JsonElement rolesPermitidos, string categoria = "General", bool favorito = false, Guid? clienteId = null);
        Task<bool> ToggleResourceFavoriteAsync(Guid resourceId, bool favorito);
        Task<bool> DeleteResourceAsync(Guid resourceId);

        // --- TAREAS OPERATIVAS ---
        Task<IEnumerable<TareaOperativa>> GetTasksAsync(Guid agencyId);
        Task<TareaOperativa> CreateTaskAsync(Guid agencyId, string titulo, string descripcion, string estado, DateTime? planificada, Guid? assignedUserId, Guid? espacioTrabajoId = null, Guid? proyectoId = null, Guid? recursoId = null);
        Task<bool> UpdateTaskStatusAsync(Guid taskId, string estado, string position);
        Task<bool> UpdateTaskAsync(Guid taskId, string titulo, string descripcion, string estado, DateTime? planificada, Guid? assignedUserId, Guid? espacioTrabajoId = null, Guid? proyectoId = null, Guid? recursoId = null);
        Task<bool> DeleteTaskAsync(Guid taskId);

        // --- ACCESOS SEGUROS (SECRETS) ---
        Task<IEnumerable<object>> GetSecretsListAsync(Guid agencyId);
        Task<string> RevealSecretAsync(Guid secretId, Guid userId, string userName);
        Task<CredencialSegura> CreateSecretAsync(Guid agencyId, string servicio, string usuario, string plaintextPassword, string urlAcceso, JsonElement rolesPermitidos);
        Task<bool> DeleteSecretAsync(Guid secretId);

        // --- PLANIFICADOR DE CONTENIDO ---
        Task<IEnumerable<PlanificadorContenido>> GetContentsAsync(Guid agencyId);
        Task<PlanificadorContenido> CreateContentAsync(Guid agencyId, Guid memberId, string titulo, JsonElement plataformas, string guion, string dialogo, string procedimiento, string estado, string notasMejora, JsonElement? resumenAnalitico = null, DateTime? fechaPublicacion = null);
        Task<bool> UpdateContentAsync(Guid contentId, string titulo, JsonElement plataformas, string guion, string dialogo, string procedimiento, string estado, string notasMejora, JsonElement resumenAnalitico, DateTime? publishDate);
        Task<bool> DeleteContentAsync(Guid contentId);

        // --- CONTRATOS ---
        Task<IEnumerable<ContratoAgencia>> GetContractsAsync(Guid agencyId);
        Task<ContratoAgencia?> GetContractByIdAsync(Guid contractId, Guid agencyId);
        Task<ContratoAgencia> CreateContractAsync(Guid agencyId, Guid? clienteId, string titulo, string contenido, string estado, string tipoContrato, JsonElement miembrosIds);
        Task<bool> UpdateContractAsync(Guid contractId, string titulo, string contenido, string estado, Guid userId, string userName);
        Task<IEnumerable<ContratoHistorial>> GetContractHistoryAsync(Guid contractId);
        Task<bool> DeleteContractAsync(Guid contractId);
        Task<bool> SignContractAsync(Guid contractId, DateTime fechaFirma, string huellaCriptografica);

        // --- FINANZAS ---
        Task<object> GetFinanceDashboardAsync(Guid agencyId);
        Task<TransaccionAgencia> CreateTransactionAsync(Guid agencyId, string tipo, decimal monto, string concepto, string descripcion, DateTime fecha, string categoria, Guid? proyectoId);
        Task<bool> DeleteTransactionAsync(Guid transactionId);

        // --- AUDITORÍA ---
        Task<IEnumerable<AuditLog>> GetAuditLogsAsync(Guid agencyId);
        Task LogActivityAsync(Guid agencyId, Guid userId, string userName, string modulo, string accion, Guid? registroId, object detalles);

        // --- CALENDARIO OPERATIVO ---
        Task<IEnumerable<EventoCalendario>> GetCalendarEventsAsync(Guid agencyId);
        Task<EventoCalendario> CreateCalendarEventAsync(Guid agencyId, string titulo, string? descripcion, DateTime fechaInicio, DateTime fechaFin, string tipo, string? colorHex, Guid? usuarioResponsableId, Guid? clienteId, Guid? proyectoId);
        Task<bool> UpdateCalendarEventAsync(Guid eventId, string titulo, string? descripcion, DateTime fechaInicio, DateTime fechaFin, string tipo, string? colorHex, Guid? usuarioResponsableId, Guid? clienteId, Guid? proyectoId);
        Task<bool> DeleteCalendarEventAsync(Guid eventId);

        // --- COLUMNAS KANBAN DINÁMICAS ---
        Task<IEnumerable<KanbanColumnaOperativa>> GetKanbanColumnsAsync(Guid agencyId);
        Task<KanbanColumnaOperativa> CreateKanbanColumnAsync(Guid agencyId, string nombre, int orden);
        Task<bool> UpdateKanbanColumnsOrderAsync(Guid agencyId, IEnumerable<KeyValuePair<Guid, int>> columnOrders);
        Task<bool> UpdateKanbanColumnNameAsync(Guid columnId, string nombre);
        Task<bool> DeleteKanbanColumnAsync(Guid columnId);

        // --- INFORMES SEMANALES ---
        Task<IEnumerable<InformeSemanal>> GetWeeklyReportsAsync(Guid agencyId);
        Task<InformeSemanal> CreateWeeklyReportAsync(Guid agencyId, DateTime fechaInicio, DateTime fechaFin, string leccionesAprendidas);
        Task<bool> DeleteWeeklyReportAsync(Guid reportId);
        Task<object> GenerateWeeklyMetricsPreviewAsync(Guid agencyId, DateTime fechaInicio, DateTime fechaFin);
    }
}
