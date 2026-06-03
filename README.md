# MateCode (Anti-Jira) - Guía de Desarrollo Local

Este repositorio contiene la base de código del proyecto **MateCode**, un sistema operativo de gestión de proyectos tecnológicos minimalista y de fricción cercana a cero. Está estructurado como un monorepo con un cliente frontend en React y un servidor backend en .NET 8/9.

---

## 1. Estructura del Proyecto

*   `/frontend`: Aplicación cliente (Vite, React 18, TypeScript, Tailwind CSS, Zustand, React Flow).
*   `/backend`: API del servidor (.NET 8/9 C# aplicando Clean Architecture).
    *   `MateCode.Core`: Entidades de dominio y contratos básicos.
    *   `MateCode.Application`: Casos de uso, orquestación y lógica del sistema.
    *   `MateCode.Infrastructure`: Persistencia EF Core, PostgreSQL y adaptadores de servicios.
    *   `MateCode.API`: Controladores HTTP, enrutamiento, middlewares y configuración.
*   `/docs`: Directorio de especificaciones técnicas y documentación de arquitectura.

---

## 2. Requisitos Previos

Asegurate de tener instalados los siguientes componentes en tu máquina de desarrollo:
1.  **Node.js v20+** (LTS recomendado).
2.  **SDK de .NET 8 o 9**.
3.  **PostgreSQL 15+** o contenedor Docker activo.
4.  **CLI de Supabase** (para emulación local de autenticación y RLS) o un proyecto Supabase en la nube configurado.

---

## 3. Configuración Inicial (Paso a Paso)

### Paso A: Levantar la Base de Datos y Supabase
1.  Si usás Docker, podés inicializar PostgreSQL con el archivo de migración ubicado en `backend/db/init.sql`.
2.  Configurá tu base de datos y obtené las variables de conexión.
3.  Si usás Supabase CLI localmente:
    ```bash
    supabase start
    ```

### Paso B: Configuración del Backend (.NET)
1.  Dirigite a la carpeta de API:
    ```bash
    cd backend/MateCode.API
    ```
2.  Creá tu archivo `appsettings.json` o `appsettings.Development.json` y configurá las cadenas de conexión y parámetros JWT:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Database=matecode_db;Username=postgres;Password=tu_password"
      },
      "Supabase": {
        "Authority": "https://tu-proyecto-supabase.supabase.co/auth/v1",
        "Audience": "authenticated"
      }
    }
    ```
3.  Restaurá y ejecutá el backend:
    ```bash
    dotnet restore
    dotnet run
    ```
    *La API se levantará por defecto en `http://localhost:5241` (o la ruta configurada en `launchSettings.json`).*

### Paso C: Configuración del Frontend (React)
1.  Dirigite a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Creá un archivo `.env` en la raíz de `frontend/` y definí las siguientes variables:
    ```env
    VITE_API_URL=http://localhost:5241
    VITE_SUPABASE_URL=https://tu-proyecto-supabase.supabase.co
    VITE_SUPABASE_ANON_KEY=tu_anon_key_supabase
    ```
3.  Instalá las dependencias y ejecutá el servidor de desarrollo:
    ```bash
    npm install
    npm run dev
    ```
    *El cliente estará disponible en `http://localhost:5173`.*

---

## 4. Comandos Útiles

*   **Levantar base de datos local (Docker):** `docker-compose up -d` (si aplica).
*   **Correr tests backend:** `dotnet test` desde la carpeta `/backend`.
*   **Compilar producción frontend:** `npm run build` desde la carpeta `/frontend`.

Para detalles de la arquitectura e instrucciones sobre el motor de prompts y reglas del IDE, consultá [/llms.txt](file:///c:/Users/mari_/OneDrive/Escritorio/t/PROYECTS/ACTIVOS/PERSONALES/MateCode/llms.txt).
