using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public interface IPromptEngineService
    {
        Task<string> GenerateMagicPromptAsync(Guid projectId, string ticketTitle, string bddCriteria, string userIntent);
        Task<string> GenerateDesignCodeAsync(string userPrompt, string diagramType);
        Task<string> GetMasterDesignPromptAsync(MateCode.Core.Entities.Proyecto project, IEnumerable<MateCode.Core.Entities.Historia> stories, string diagramType);
        Task<string> GenerarPromptContextual(Guid templateId, Guid projectId, Guid? ticketId, Guid tenantId, bool? overrideAdn = null, bool? overrideBdd = null, bool? overrideStack = null, string? overridePersona = null, string? overrideTarea = null);
        Task<string> GenerarPromptBrainstormingAsync(string idea, Guid formularioId, Guid tenantId);
        Task<string> GenerarMasterPromptAsync(Guid projectId);
        Task<string> GenerarPromptFase1Async(Guid projectId);
    }
}
