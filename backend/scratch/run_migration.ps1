# Script de ejecución de migración SQL usando Npgsql.dll compilado
$connStr = "Server=aws-0-us-west-2.pooler.supabase.com;Port=6543;Database=postgres;User Id=postgres.yavppbxrgzcpixhyqaoa;Password=(Klisten1a3218);Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;Command Timeout=60"
$sqlPath = Resolve-Path "../db/20260602_AgencyHierarchy.sql"

# Encontrar Npgsql.dll
$dllPaths = @(
    "../MateCode.API/bin/Debug/net8.0/Npgsql.dll",
    "../MateCode.API/bin/Debug/net9.0/Npgsql.dll",
    "../MateCode.Infrastructure/bin/Debug/net8.0/Npgsql.dll",
    "../MateCode.Infrastructure/bin/Debug/net9.0/Npgsql.dll"
)

$loaded = $false
foreach ($path in $dllPaths) {
    if (Test-Path $path) {
        Write-Host "Cargando ensamblado: $path"
        Add-Type -Path (Resolve-Path $path)
        $loaded = $true
        break
    }
}

if (-not $loaded) {
    Write-Error "No se pudo encontrar Npgsql.dll. Asegurate de compilar el proyecto primero."
    exit 1
}

Write-Host "Leyendo script SQL de: $sqlPath"
$sql = [System.IO.File]::ReadAllText($sqlPath)

Write-Host "Estableciendo conexión a base de datos..."
$conn = New-Object Npgsql.NpgsqlConnection($connStr)
try {
    $conn.Open()
    Write-Host "Ejecutando migración SQL..."
    $cmd = New-Object Npgsql.NpgsqlCommand($sql, $conn)
    $cmd.CommandTimeout = 120
    $rows = $cmd.ExecuteNonQuery()
    Write-Host "¡Migración completada exitosamente! Filas afectadas: $rows"
}
catch {
    Write-Error "Error ejecutando migración: $_"
}
finally {
    if ($conn.State -eq [System.Data.ConnectionState]::Open) {
        $conn.Close()
    }
}
