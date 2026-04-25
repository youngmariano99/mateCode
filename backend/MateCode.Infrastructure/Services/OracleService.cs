using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Application.Services;
using MateCode.Infrastructure.Persistence;

namespace MateCode.Infrastructure.Services
{
    public class OracleService : IOracleService
    {
        private readonly AppDbContext _context;

        public OracleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<OracleSearchResult>> BuscarAsync(string query, Guid tenantId)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<OracleSearchResult>();

            // Hacemos una búsqueda Full-Text limpia usando ts_rank y plainto_tsquery en Postgres.
            // Requiere que RLS esté activo para aislar los datos.
            
            var sql = @"
                SELECT 'Decision' as ""Tipo"", id as ""Id"", titulo as ""Titulo"", LEFT(descripcion, 200) as ""Extracto"", 
                       ts_rank(vector_busqueda, plainto_tsquery('spanish', {0})) as ""Score""
                FROM colab.decisiones
                WHERE vector_busqueda @@ plainto_tsquery('spanish', {0})
                
                UNION ALL
                
                SELECT 'Bug' as ""Tipo"", id as ""Id"", titulo as ""Titulo"", LEFT(descripcion, 200) as ""Extracto"", 
                       ts_rank(vector_busqueda, plainto_tsquery('spanish', {0})) as ""Score""
                FROM colab.bugs
                WHERE vector_busqueda @@ plainto_tsquery('spanish', {0})
                
                ORDER BY ""Score"" DESC
                LIMIT 15;
            ";

            // Se asume que el AppDbContext inyecta la conexión y ejecuta la consulta.
            // Nota: Podríamos usar Dapper aquí si FromSqlRaw con tipos anónimos da problemas, 
            // pero .NET 8/9 permite Database.SqlQueryRaw<T>
            
            var results = await _context.Database.SqlQueryRaw<OracleSearchResult>(sql, query).ToListAsync();
            return results;
        }
    }
}
