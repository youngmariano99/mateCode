using System;
using Npgsql;

class Program {
    static void Main() {
        var connStr = "Server=aws-0-us-west-2.pooler.supabase.com;Port=6543;Database=postgres;User Id=postgres.yavppbxrgzcpixhyqaoa;Password=(Klisten1a3218);Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;Command Timeout=60";
        using var conn = new NpgsqlConnection(connStr);
        conn.Open();
        
        using var cmd = new NpgsqlCommand("SELECT id, nombre, contexto_json::text FROM proyectos.proyectos", conn);
        using var reader = cmd.ExecuteReader();
        while (reader.Read()) {
            var id = reader.GetGuid(0);
            var nombre = reader.GetString(1);
            var json = reader.IsDBNull(2) ? "" : reader.GetString(2);
            Console.WriteLine($"PROJECT ID: {id} | NAME: {nombre}");
            Console.WriteLine($"JSON: {json}");
            Console.WriteLine("--------------------------------------------------------");
        }
    }
}
