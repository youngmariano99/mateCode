using System;
using System.IO;
using Npgsql;

class Program {
    static void Main() {
        var connStr = "Server=aws-0-us-west-2.pooler.supabase.com;Port=5432;Database=postgres;User Id=postgres.yavppbxrgzcpixhyqaoa;Password=(Klisten1a3218);Ssl Mode=Require;Trust Server Certificate=true;Command Timeout=60";
        
        // Buscar el archivo SQL subiendo en el árbol de directorios
        string currentDir = AppContext.BaseDirectory;
        string sqlFileName = "20260602_AgencyHierarchy.sql";
        string sqlPath = "";
        
        while (currentDir != null) {
            string dbDir = Path.Combine(currentDir, "db", sqlFileName);
            string backendDbDir = Path.Combine(currentDir, "backend", "db", sqlFileName);
            
            if (File.Exists(dbDir)) {
                sqlPath = dbDir;
                break;
            }
            if (File.Exists(backendDbDir)) {
                sqlPath = backendDbDir;
                break;
            }
            currentDir = Directory.GetParent(currentDir)?.FullName;
        }

        if (string.IsNullOrEmpty(sqlPath)) {
            Console.WriteLine("Error: SQL file 20260602_AgencyHierarchy.sql not found in directory tree!");
            return;
        }

        Console.WriteLine($"Found migration script at: {sqlPath}");
        string sql = File.ReadAllText(sqlPath);
        Console.WriteLine("Successfully read migration SQL.");

        Console.WriteLine("Opening connection to Supabase PostgreSQL database...");
        using var conn = new NpgsqlConnection(connStr);
        try {
            conn.Open();
            Console.WriteLine("Connection opened successfully.");
            
            Console.WriteLine("Executing database migration SQL script...");
            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.CommandTimeout = 180;
            int rows = cmd.ExecuteNonQuery();
            Console.WriteLine($"Migration completed successfully! Rows affected: {rows}");
        }
        catch (Exception ex) {
            Console.WriteLine("CRITICAL ERROR during database migration:");
            Console.WriteLine(ex.ToString());
        }
    }
}
