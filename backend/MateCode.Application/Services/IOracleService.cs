using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MateCode.Application.Services
{
    public class OracleSearchResult
    {
        public string Tipo { get; set; } = string.Empty; // "Decision" o "Bug"
        public Guid Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Extracto { get; set; } = string.Empty;
        public float Score { get; set; }
    }

    public interface IOracleService
    {
        Task<List<OracleSearchResult>> BuscarAsync(string query, Guid tenantId);
    }
}
