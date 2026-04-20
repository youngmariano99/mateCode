using System;
using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public interface IClientPortalService
    {
        Task<object?> GetProjectByTokenAsync(string token);
        Task SendFeedbackAsync(string token, string comentario);
    }
}
