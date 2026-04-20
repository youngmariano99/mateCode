# Estado Actual del Proyecto: MateCode

## 1. Resumen Ejecutivo
**MateCode** (conocido internamente como "Anti-Jira") es un sistema de gestión de proyectos tecnológicos diseñado con una filosofía de fricción cero y revelación progresiva. El stack técnico estricto está compuesto por un Frontend en **React 18+ (TypeScript)**, un Backend de alto rendimiento en **.NET 8/9 (C#)** aplicando Clean Architecture, y una base de datos **PostgreSQL** con políticas de seguridad Multi-Tenant a nivel de fila (RLS) gestionadas mediante Supabase para la autenticación asíncrona.

## 2. Progreso del Roadmap
Basado en el historial de cambios y el progreso registrado hasta el **14 de Abril de 2026**, el roadmap original ha sido completamente abarcado en sus cimientos fundacionales:
* **[TERMINADO] Sprints 0 al 1:** Pipeline de seguridad (JWT Supabase), Multitenancy (RLS en BD), Clean Architecture base en .NET, y vistas de autenticación/espacios de trabajo.
* **[TERMINADO] Sprint 2 (Fase 0 - Factibilidad):** Middleware `MagicLinkMiddleware`, Portal Cliente, inyección de SurveyJS y gestor de Leads (CrmService).
* **[TERMINADO] Sprint 3 (Fase 1 - Requisitos):** Parsing a tablero 2D y editores de criterios BDD (AgileService).
* **[TERMINADO] Sprint 4 (Fase 2 - Diseño):** Editor de diagramación (DBML a React Flow) interactivo y Wizard de Presupuestos (FinanceService).
* **[TERMINADO] Sprint 5 (Fase 3 - Implementación):** Kanban ultrarrápido (Pragmatic Drag and Drop) con algoritmo lexicográfico e inyección inteligente vía Semantic Kernel (PromptEngineService).
* **[TERMINADO] Sprint 6 (Fase 4/5 - Testing y Cosecha):** Autoreporte, pipeline visual y módulos de recolección de proyectos/bóveda (HarvestService).

*(Nota: Aunque figuran como Terminados a nivel orquestación e infraestructura, la profundización y refinamiento de cada módulo entra ahora en etapa de pulido interactivo).*

## 3. Inventario de lo Construido

* **Backend (.NET 8/9):**
  * **Middleware Vitales:** `TenantResolverMiddleware` (Multitenancy) y `MagicLinkMiddleware` (Acceso Externo Blindado de Clientes).
  * **Motor de Datos:** EntityFrameworkCore conectado internamente con PostgreSQL validando JWTs nativos.
  * **Capa de Servicios de Dominio Registrada:** `CrmService`, `AgileService`, `FinanceService`, `KanbanService`, `PromptEngineService` (IA) y `HarvestService`.
* **Frontend (React):**
  * **Enrutamiento y Layouts (`App.tsx`):** Revelación progresiva funcional: Public, Client, Global, y Focus.
  * **Directorio Modulado (`src/pages/`):** Infraestructura completa levantada (`auth`, `crm`, `dashboard`, `team`, `portfolio`, `vault`).
  * **Modo Enfoque (Las "Fases"):** Taller estructurado con endpoints visuales listos (`Phase0Feasibility` hasta `Phase5Deployment`).

## 4. Deuda Técnica o Cosas a Medias
* **Refinamiento de Componentes Ágiles:** Tienes abierto el archivo `src/components/agile/BddEditorPanel.tsx`. Esto indica que la UI y la conexión interna del parseo y edición BDD de la Fase 1 probablemente necesite acoplarse firmemente a los servicios del backend o depurar su estado en React.
* **Manejo Dinámico de Fricciones D&D:** Pragmatic Drag & Drop está implementado teóricamente, pero requiere validación en el Kanban ante volumen alto para evitar "reconciliación visual masiva" (Regla 3 de la arquitectura).
* **Supabase / Local Auth Sync:** El Auth y RLS se pasaron a producción local en la última sesión, habría que re-testear la inserción transaccional sin romper las restricciones de nivel de fila (Row Level Security).

## 5. Próximos Pasos (Por dónde arrancar hoy)
Dado el último contexto, concéntrate en la **Fase 1 y validación de Flujo**:

1. **Reanudar la edición del BDD:** Retomar el controlador visual `BddEditorPanel.tsx` (tu documento activo). Terminar de conectar el componente reactivo validando que el formato emitido cruce correctamente mediante la interfaz del `AgileController` en el backend sin sobreingeniería.
2. **Prueba End-to-End Mínima (La Trinchera Local):** Levantar PostgreSQL local o Supabase emulator, correr la API en .NET y el cliente de Vite. Validar iniciar sesión exitosamente para inyectar un Tenant ID real y probar si Entity Framework reacciona usando el RLS configurado.
3. **Auditoría Express del Kanban (Opcional si hay urgencia):** Revisar cómo interactúa la ordenación lexicográfica insertada en `KanbanService.cs` contra la recarga de datos en tu frontend para asegurarte de que cumples la "fricción cercana a cero".
