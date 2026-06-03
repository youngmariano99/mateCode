# Tutorial: Onboarding de Desarrolladores y Puesta en Marcha Local

Este tutorial te guiará paso a paso para levantar de forma local el entorno completo de desarrollo de **MateCode** por primera vez.

---

## 1. Clonar y Configurar el Repositorio
1.  Asegurate de estar en el directorio de trabajo del proyecto MateCode.
2.  Inspeccioná la estructura de directorios:
    *   `/backend`: Contiene la API en .NET C# estructurada bajo Clean Architecture.
    *   `/frontend`: Contiene el cliente Vite/React en TypeScript.
    *   `/docs`: Guías técnicas y registros arquitectónicos.

---

## 2. Setup de la Base de Datos (PostgreSQL local)
1.  Levantá tu motor de base de datos local de PostgreSQL (v15 o superior).
2.  Ejecutá el script de inicialización SQL ubicado en `backend/db/init.sql` utilizando tu gestor de base de datos favorito (ej: pgAdmin, DBeaver) o mediante terminal:
    ```bash
    psql -U postgres -d matecode_db -f backend/db/init.sql
    ```
    *Este script creará las tablas base de los esquemas `nucleo`, `crm`, `proyectos`, `agil` y `boveda` y aplicará las políticas de Row-Level Security (RLS).*

---

## 3. Configuración y Ejecución del Servidor (.NET API)
1.  Dirigite a la carpeta de la API:
    ```bash
    cd backend/MateCode.API
    ```
2.  Editá tu archivo `appsettings.Development.json` y configurá la cadena de conexión de PostgreSQL con tus credenciales locales:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Port=5432;Database=matecode_db;Username=postgres;Password=tu_password"
      }
    }
    ```
3.  Ejecutá el comando de restauración de paquetes y levantamiento:
    ```bash
    dotnet restore
    dotnet run
    ```
    *Verificá en la consola que la API esté escuchando peticiones en `http://localhost:5241`.*

---

## 4. Configuración y Ejecución del Cliente (React + Vite)
1.  En una nueva pestaña de la consola, dirigite a la carpeta de frontend:
    ```bash
    cd frontend
    ```
2.  Instalá las dependencias del monorepo mediante npm:
    ```bash
    npm install
    ```
3.  Creá tu archivo de configuración de entorno `.env` en la raíz de la carpeta `frontend/`:
    ```env
    VITE_API_URL=http://localhost:5241
    VITE_SUPABASE_URL=https://tu-proyecto-supabase.supabase.co
    VITE_SUPABASE_ANON_KEY=tu_anon_key_supabase
    ```
4.  Corré el servidor web de desarrollo:
    ```bash
    npm run dev
    ```
5.  Abrí tu navegador en `http://localhost:5173`. Deberías visualizar el mapa espacial interactivo de MateCode listo para operar.
