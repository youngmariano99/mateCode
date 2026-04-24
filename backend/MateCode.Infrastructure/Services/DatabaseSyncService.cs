using System.Text;
using System.Data;
using Npgsql;
using MateCode.Application.Services;

namespace MateCode.Infrastructure.Services
{
    public class DatabaseSyncService : IDatabaseSyncService
    {
        public async Task<string> GetDbmlFromPostgresAsync(string connectionString)
        {
            var sb = new StringBuilder();
            sb.AppendLine("// Extraído automáticamente desde Base de Datos Externa");
            
            try 
            {
                using var conn = new NpgsqlConnection(connectionString);
                await conn.OpenAsync();

                // 1. Extraer Tablas y Columnas
                var tablesQuery = @"
                    SELECT 
                        t.table_name,
                        c.column_name,
                        c.data_type,
                        c.is_nullable,
                        (SELECT count(*) FROM information_schema.key_column_usage kcu 
                         JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
                         WHERE kcu.table_name = t.table_name AND kcu.column_name = c.column_name AND tc.constraint_type = 'PRIMARY KEY') as is_pk
                    FROM information_schema.tables t
                    JOIN information_schema.columns c ON t.table_name = c.table_name
                    WHERE t.table_schema = 'public' 
                      AND t.table_type = 'BASE TABLE'
                    ORDER BY t.table_name, c.ordinal_position;";

                using var cmd = new NpgsqlCommand(tablesQuery, conn);
                using var reader = await cmd.ExecuteReaderAsync();

                string currentTable = "";
                while (await reader.ReadAsync())
                {
                    string tableName = reader.GetString(0);
                    string columnName = reader.GetString(1);
                    string dataType = reader.GetString(2);
                    bool isPk = reader.GetInt64(4) > 0;

                    if (tableName != currentTable)
                    {
                        if (!string.IsNullOrEmpty(currentTable)) sb.AppendLine("}");
                        currentTable = tableName;
                        sb.AppendLine($"Table {tableName} {{");
                    }

                    string pkFlag = isPk ? " [pk]" : "";
                    sb.AppendLine($"  {columnName} {dataType}{pkFlag}");
                }
                if (!string.IsNullOrEmpty(currentTable)) sb.AppendLine("}");

                await reader.CloseAsync();

                // 2. Extraer Relaciones (Foreign Keys)
                var fkQuery = @"
                    SELECT
                        tc.table_name, 
                        kcu.column_name, 
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name 
                    FROM 
                        information_schema.table_constraints AS tc 
                        JOIN information_schema.key_column_usage AS kcu
                          ON tc.constraint_name = kcu.constraint_name
                          AND tc.table_schema = kcu.table_schema
                        JOIN information_schema.constraint_column_usage AS ccu
                          ON ccu.constraint_name = tc.constraint_name
                          AND ccu.table_schema = tc.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';";

                using var fkCmd = new NpgsqlCommand(fkQuery, conn);
                using var fkReader = await fkCmd.ExecuteReaderAsync();

                while (await fkReader.ReadAsync())
                {
                    sb.AppendLine($"Ref: {fkReader.GetString(0)}.{fkReader.GetString(1)} > {fkReader.GetString(2)}.{fkReader.GetString(3)}");
                }
            }
            catch (Exception ex)
            {
                return $"// Error al conectar: {ex.Message}";
            }

            return sb.ToString();
        }
    }
}
