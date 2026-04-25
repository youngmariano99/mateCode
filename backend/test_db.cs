using System;
using Npgsql;

class Program {
    static void Main() {
        var connStr = ""Server=aws-0-us-west-2.pooler.supabase.com;Port=6543;Database=postgres;User Id=postgres.yavppbxrgzcpixhyqaoa;Password=(Klisten1a3218);Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;Command Timeout=60"";
        using var conn = new NpgsqlConnection(connStr);
        conn.Open();
        
        using var cmd = new NpgsqlCommand(""SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'agil' AND table_name = 'sprints');"", conn);
        var exists = (bool)cmd.ExecuteScalar();
        Console.WriteLine($""Table exists: {exists}"");
    }
}
