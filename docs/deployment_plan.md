# 🚀 Plan de Despliegue MateCode: Migración a la Nube

Este documento detalla los pasos necesarios para desplegar el ecosistema **MateCode** (Frontend en Netlify y Backend en Railway/Render) garantizando la seguridad y el funcionamiento del sistema en tiempo real.

---

## 🛠️ Requisitos Previos
1. Cuentas activas en: **Netlify**, **Railway** (o Render), y **Supabase**.
2. Un repositorio de GitHub con el código actualizado.
3. Docker instalado localmente (para pruebas de contenedor opcionales).

---

## 1. 🏗️ Preparación del Backend (.NET API)

### A. Dockerización (Archivo `Dockerfile`)
Para desplegar en Railway o Render, es indispensable un archivo `Dockerfile` en la raíz de `/backend`.

```dockerfile
# Estructura recomendada para .NET 8
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copiar archivos de proyecto y restaurar
COPY *.sln .
COPY MateCode.API/*.csproj ./MateCode.API/
COPY MateCode.Application/*.csproj ./MateCode.Application/
COPY MateCode.Domain/*.csproj ./MateCode.Domain/
COPY MateCode.Infrastructure/*.csproj ./MateCode.Infrastructure/
RUN dotnet restore

# Copiar todo y compilar
COPY . .
WORKDIR /app/MateCode.API
RUN dotnet publish -c Release -o /out

# Imagen de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out .

# Configuración de puerto dinámica (Railway/Render inyectan PORT)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MateCode.API.dll"]
```

### B. Cambios en el Código (`Program.cs`)
Debemos permitir el tráfico desde la URL de producción de Netlify.

```csharp
// En Program.cs, actualizar la política CORS
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins(
            "http://localhost:5173", 
            "https://tu-app-en-netlify.netlify.app" // 👈 Agregar URL de producción
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials(); // Obligatorio para SignalR
    });
});
```

---

## 2. 🔐 Gestión de Variables de Entorno

### Backend (Railway / Render)
Configurar estas variables en el panel de control de la plataforma:

| Variable | Valor |
| :--- | :--- |
| `ConnectionStrings__DefaultConnection` | `PostgreSQL Connection String` (de Supabase) |
| `Supabase__Url` | URL de tu proyecto Supabase |
| `Supabase__SignatureKey` | JWT Secret de Supabase (Settings -> API) |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

> [!IMPORTANT]
> Railway usa `__` (doble guion bajo) para jerarquías en variables de entorno de .NET (ej: `ConnectionStrings:DefaultConnection` -> `ConnectionStrings__DefaultConnection`).

### Frontend (Netlify)
Configurar en **Site Settings > Environment Variables**:

| Variable | Valor |
| :--- | :--- |
| `VITE_API_URL` | URL de tu backend en Railway (ej: `https://api-matecode.railway.app`) |
| `VITE_SUPABASE_URL` | Tu Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Tu Supabase Anon Key |

---

## 3. ☁️ Despliegue Paso a Paso

### Paso 1: Backend en Railway
1. **New Project** -> **Deploy from GitHub repo**.
2. Seleccionar la carpeta `/backend`.
3. Railway detectará el `Dockerfile` y comenzará el build.
4. Una vez terminado, Railway te dará una URL pública. **Cópiala**.

### Paso 2: Frontend en Netlify
1. **Import an existing project** -> GitHub.
2. **Base directory**: `frontend`.
3. **Build command**: `npm run build`.
4. **Publish directory**: `dist`.
5. Configurar las variables de entorno con la URL del backend obtenida en el paso anterior.

---

## 4. 🛰️ Sincronización de SignalR en Producción
Para que los avatares funcionen en la nube:
1. Asegúrate de que el frontend use la URL de producción (`https://...`) para la conexión del Hub.
2. Si usas **Render Free Tier**, el primer inicio tardará ~30s por el *Cold Start*. El `BackendGuard` que implementamos gestionará esto visualmente con el Mate cebándose.

---

## 5. 🛡️ Mejores Prácticas de Seguridad
*   **HSTS y HTTPS**: Asegúrate de que `app.UseHsts()` esté habilitado en producción en el backend.
*   **Secret Management**: Nunca subas el archivo `appsettings.json` con contraseñas al repositorio. Usa las variables de entorno de la plataforma.
*   **Supabase Policies**: Configura RLS (Row Level Security) en Supabase para que solo usuarios autenticados puedan escribir en la base de datos, incluso si tienen la API Key.

---

## 🔄 Flujo de Trabajo Dual (Local vs Nube)

El sistema está diseñado para que puedas trabajar 100% en local sin afectar la nube ni gastar minutos de despliegue.

### A. Desarrollo Local (Zero-Push Testing)
Para trabajar en tu máquina como lo haces ahora:
1. **Frontend**: Asegúrate de tener un archivo `frontend/.env.local` (este archivo está en `.gitignore`).
   ```env
   VITE_API_URL=http://localhost:5241
   VITE_SUPABASE_URL=tu_url_de_desarrollo
   VITE_SUPABASE_ANON_KEY=tu_key_de_desarrollo
   ```
2. **Backend**: Usa `dotnet run`. El sistema detectará automáticamente que está en `Development` y usará el `appsettings.Development.json`.
3. **Validación**: Gracias a la lógica de `BackendGuard`, el front intentará conectar primero a tu local. Si no inicias el backend local, verás la pantalla de carga del mate.

### B. Paso a Producción
Cuando estés seguro de tus cambios localmente:
1. **Git Push**: Sube tus cambios a la rama `main`.
2. **Netlify**: Detectará el push y compilará usando las variables de entorno que configuraste en su panel (las cuales apuntan a la URL de Railway).
3. **Railway**: Hará lo mismo con el backend.

### C. Tip Pro: Probar "Producción" en Local
Si quieres probar cómo se comporta la app compilada antes de subirla:
```bash
cd frontend
npm run build
npx serve -s dist
```
Esto levantará la versión optimizada de producción en tu máquina pero seguirá apuntando a tu backend local si no cambias las variables.

---

## 🛠️ Configuración Final de Producción (Checklist)

He dejado el sistema preparado para un despliegue **Híbrido**. Sigue estos pasos finales antes de hacer el push:

### 1. Backend (MateCode.API)
- [ ] **appsettings.json**: He reemplazado tus claves por `[ ACA VA TU API ]`. Debes poner tus claves reales ahí para testear en local, o mejor aún, configurarlas como variables de entorno en Render.
- [ ] **Dockerfile**: Ya está creado en la raíz de `/backend`. Render lo usará automáticamente para compilar.
- [ ] **CORS**: En Render, añade la variable `AllowedOrigins` con el valor `https://tu-app.netlify.app`.

### 2. Frontend
- [ ] **.env.example**: He creado este archivo como guía. Copia su contenido a un nuevo archivo `.env.local` y pon tus claves de Supabase ahí para trabajar en local.
- [ ] **Netlify**: En el panel de Netlify, añade `VITE_API_URL` apuntando a tu URL de Render (ej: `https://matecode-back.onrender.com`).

---

## 📝 Archivos Modificados y Acciones Pendientes

| Archivo | Cambio Realizado | Acción Necesaria |
| :--- | :--- | :--- |
| `backend/Dockerfile` | **Nuevo**: Configuración para despliegue en nube. | Ninguna. |
| `backend/.../appsettings.json` | **Sanitización**: Se quitaron las claves reales. | **Agregar tus credenciales** para uso local. |
| `backend/.../Program.cs` | **CORS Dinámico**: Soporte para múltiples URLs. | Configurar `AllowedOrigins` en Render. |
| `frontend/.env.example` | **Nuevo**: Plantilla de variables de entorno. | Crear `.env.local` basado en este. |
| `frontend/src/App.tsx` | **BackendGuard**: Manejo de Cold Start de Render. | Ninguna. |

---

## 🏁 Check-list Final de Despliegue
- [ ] Backend responde en `/health` (verificar en logs de Render).
- [ ] URL de Netlify agregada a `AllowedOrigins` en Render.
- [ ] `VITE_API_URL` configurada en Netlify.
- [ ] Base de datos de Supabase con RLS activo.

**¡Todo listo para el primer push a producción!** 🧉🚀
