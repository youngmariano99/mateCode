# Script de consulta de proyectos
$connStr = "Server=aws-0-us-west-2.pooler.supabase.com;Port=6543;Database=postgres;User Id=postgres.yavppbxrgzcpixhyqaoa;Password=(Klisten1a3218);Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;Command Timeout=60"

# Encontrar Npgsql.dll
$dllPaths = @(
    "../MateCode.API/bin/Debug/net9.0/Npgsql.dll",
    "../MateCode.API/bin/Debug/net8.0/Npgsql.dll",
    "../MateCode.Infrastructure/bin/Debug/net9.0/Npgsql.dll",
    "../MateCode.Infrastructure/bin/Debug/net8.0/Npgsql.dll"
)

$loaded = $false
foreach ($path in $dllPaths) {
    if (Test-Path $path) {
        Add-Type -Path (Resolve-Path $path)
        $loaded = $true
        break
    }
}

if (-not $loaded) {
    # Si no, intentar cargar usando la dll en la carpeta bin del API
    Write-Error "No se pudo encontrar Npgsql.dll."
    exit 1
}

$conn = New-Object Npgsql.NpgsqlConnection($connStr)
try {
    $conn.Open()
    $cmd = New-Object Npgsql.NpgsqlCommand("SELECT id, nombre, contexto_json::text FROM proyectos.proyectos", $conn)
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        $id = $reader.GetValue(0)
        $nombre = $reader.GetValue(1)
        $json = $reader.GetValue(2)
        Write-Host "PROJECT ID: $id | NAME: $nombre"
        Write-Host "JSON: $json"
        Write-Host "--------------------------------------------------------"
    }
    $reader.Close()
}
catch {
    Write-Error "Error: $_"
}
finally {
    $conn.Close()
}
