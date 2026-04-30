# ---------------------------------------------------------
# Dockerfile para MateCode API (.NET 8) - Optimizado para Render/Railway
# ---------------------------------------------------------

# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copiar archivos de proyecto y restaurar dependencias
COPY *.sln .
COPY MateCode.API/*.csproj ./MateCode.API/
COPY MateCode.Application/*.csproj ./MateCode.Application/
COPY MateCode.Core/*.csproj ./MateCode.Core/
COPY MateCode.Infrastructure/*.csproj ./MateCode.Infrastructure/
RUN dotnet restore

# Copiar el resto del código y compilar
COPY . .
WORKDIR /app/MateCode.API
RUN dotnet publish -c Release -o /out

# 2. Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /out .

# Configuración para evitar error de inotify en Linux/Docker
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

# Configuración de puerto dinámica para Render
# Render inyecta la variable de entorno PORT automáticamente
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MateCode.API.dll"]
