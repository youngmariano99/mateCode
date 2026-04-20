using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public interface IPromptEngineService
    {
        Task<string> GenerateMagicPromptAsync(string ticketTitle, string bddCriteria, string userIntent);
    }
}
