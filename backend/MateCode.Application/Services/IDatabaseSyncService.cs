using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public interface IDatabaseSyncService
    {
        Task<string> GetDbmlFromPostgresAsync(string connectionString);
    }
}
