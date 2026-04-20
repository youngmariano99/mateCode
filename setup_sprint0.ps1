Write-Host "Iniciando configuración inicial del Sprint 0..."

# ==========================================
# 1. Configuración de Frontend (Vite + React)
# ==========================================
Write-Host "Inicializando Frontend..."
npx -y create-vite@latest frontend --template react-ts
Set-Location frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx -y tailwindcss init -p
Set-Location ..

# ==========================================
# 2. Configuración de Backend (.NET Clean Architecture)
# ==========================================
Write-Host "Inicializando Backend (.NET 8/9)..."
New-Item -ItemType Directory -Force -Path backend
Set-Location backend

# Crear proyectos
dotnet new classlib -n MateCode.Core
dotnet new classlib -n MateCode.Application
dotnet new classlib -n MateCode.Infrastructure
dotnet new webapi -n MateCode.API

# Crear solución y atar proyectos
dotnet new sln -n MateCode
dotnet sln MateCode.sln add MateCode.Core/MateCode.Core.csproj
dotnet sln MateCode.sln add MateCode.Application/MateCode.Application.csproj
dotnet sln MateCode.sln add MateCode.Infrastructure/MateCode.Infrastructure.csproj
dotnet sln MateCode.sln add MateCode.API/MateCode.API.csproj

# Referencias cruzadas - Clean Architecture
# Application depende de Core
Set-Location MateCode.Application
dotnet add reference ../MateCode.Core/MateCode.Core.csproj
Set-Location ..

# Infrastructure depende de Core y Application
Set-Location MateCode.Infrastructure
dotnet add reference ../MateCode.Core/MateCode.Core.csproj
dotnet add reference ../MateCode.Application/MateCode.Application.csproj
Set-Location ..

# API depende de Application e Infrastructure
Set-Location MateCode.API
dotnet add reference ../MateCode.Application/MateCode.Application.csproj
dotnet add reference ../MateCode.Infrastructure/MateCode.Infrastructure.csproj
Set-Location ..

Set-Location ..

Write-Host "¡Andamiaje completado!"
