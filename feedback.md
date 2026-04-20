# Auditoría Técnica: MateCode

## 1. Violaciones Críticas (Rojo)
* **Inexistencia de Políticas RLS (Row Level Security) Efectivas:** El script `backend/db/init.sql` fue corregido al español y usa JSONB, pero **omitió por completo la habilitación de RLS**. El documento `01_MODELO_DE_DATOS.md` exige seguridad a nivel de base de datos (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` y creación de `POLICIES` validando el tenant). Actualmente la base de datos es vulnerable y depende 100% de la capa de aplicación.
* **Error Estructural en Entity Framework Core:** El archivo `Program.cs` invoca `options.UseNpgsql(...)`, y `AppDbContext.cs` hereda de `DbContext`. Sin embargo, el paquete oficial para conectar PostgreSQL no está referenciado. Esto significa que el backend **no puede compilar ni arrancar de forma real**.
* **Ausencia de Interfaces en Clean Architecture:** Los **Servicios** en la capa Application (`AgileService`, `CrmService`, etc.) dependen de inyecciones directas referenciando a `AppDbContext` e invocan comandos Raw SQL. Si bien abstraen lógica, violan estrictamente el principio Inversion of Dependency (D de SOLID) al no usar Interfaces (ej. `IKanbanRepository`). Esto mata la testeabilidad unitaria.

## 2. Dependencias y Librerías Faltantes (Naranja)
* **Backend (.NET):** Falta inyectar el motor de PostgreSQL para Entity Framework.
  * **Comandos faltantes:**
    ```bash
    dotnet add backend/MateCode.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.0
    dotnet add backend/MateCode.API package Microsoft.EntityFrameworkCore.Design --version 9.0.0
    ```
* **Frontend (React - package.json):** El Roadmap en el Sprint 2 exige expresamente integrar `SurveyJS` para la vista pública de iframes de CRM y Factibilidad. Ninguno de estos paquetes fue instalado en `package.json`.
  * **Comandos faltantes:**
    ```bash
    npm install survey-react-ui survey-core
    ```

## 3. Módulos y Entregables Incompletos (Amarillo)
* **Vistas Fantasma ("Dummys") en el Enrutador:** El archivo `App.tsx` tiene funciones lambda en línea que actúan como vistas (`DashboardDummy`, `VaultDummy`, `PortfolioDummy`). La arquitectura dicta separación de responsabilidades; estas deben extraerse a `src/pages/dashboard/Dashboard.tsx`, `src/pages/vault/Vault.tsx`, etc.
* **Flujos de Auth Incompletos:** Las rutas públicas de `/login` y `/register` existen, pero no se ha evidenciado el uso del SDK nativo de Supabase (`@supabase/supabase-js`) de modo persistente para el manejo de sesiones y el puente del JWT hacia el Backend.
* **Falta el Servicio de Autenticación Mágico (Middleware):** El `MagicLinkMiddleware.cs` hace checkeo de los tokens mágicos, pero no cruza los datos con la base de datos (tabla de clientes) de forma fehaciente. Se dejó con el estatus de `"En producción: Validar..."`, quedando a la mitad.

## 4. Código Excedido / Monolitos (Gris)
* **Raw SQL Hardcodeado en Servicios (Applicaton Layer):** En archivos como `CrmService.cs` y `AgileService.cs`, la mezcla entre consultas SQL en crudo masivas y la lógica de negocio comienza a escalar peligrosamente hacia el antipatrón de **Large Class**. Mover los Strings de las consultas SQL a variables de recurso separadas o repositorios dedicados es inminente para evitar romper la barrera de las ~250 líneas.
* **DiagramWorkspace.tsx:** El componente aglomera lógica de análisis de texto en crudo, layout de Split View y renderizado de WebGL/Canvas (`xyflow`). Debería refactorizarse extrayendo el panel izquierdo a un `<CodeEditorPane />` tal como se sugirió en la documentación de la Fase 2.

## 5. Plan de Acción de Corrección (Verde)
Para llevar al proyecto a una sanidad técnica del 100%, recomiendo instruirme para ejecutar los siguientes pasos en orden:

1. **Parchear Backend / DB:** Ejecutar los comandos de instalación de `Npgsql`. Reescribir `init.sql` para forzar las sentencias `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` y anclarlas al claim temporal/UID de la request.
2. **Setup Frontend:** Instalar `survey-react-ui` y `@supabase/supabase-js`. Extraer todos los Dummys de `App.tsx` a su propio directorio `/pages` correspondiente (Vault, Dashboard, Portfolio).
3. **Refactor Inyección de Dependencias:** Modificar los Servicios del backend para heredar de abstracciones (ej. `public class KanbanService : IKanbanService`).
4. **Completar Magic Link:** Dotar al `MagicTokenMiddleware.cs` con lógica de verificación consultada en base de datos.
5. **Componentización Frontend:** Refactorizar y aislar `<CodeEditorPane />` del lienzo principal en la Fase 2.
