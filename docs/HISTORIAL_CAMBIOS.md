# HISTORIAL DE CAMBIOS (Registro Operativo)

> **INSTRUCCIÓN ESTRICTA PARA LA IA:** > Todo cambio en el código DEBE registrarse acá usando ÚNICAMENTE el formato de 4 líneas detallado abajo. Las entradas nuevas van arriba. Prohibido escribir explicaciones largas o tutoriales. Sé directo y técnico.

---

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Limpieza de Frontend, Integración de SurveyJS y Supabase SDK
* **Archivos Tocados:** `frontend/src/App.tsx`, `frontend/src/pages/dashboard/Dashboard.tsx`, `frontend/src/pages/vault/Vault.tsx`, `frontend/src/pages/portfolio/Portfolio.tsx`, `frontend/src/components/design/DiagramWorkspace.tsx`, `frontend/src/components/design/CodeEditorPane.tsx`, `frontend/src/pages/public/FormInjectableView.tsx`, `frontend/src/lib/supabase.ts`, `frontend/src/pages/auth/Login.tsx`
* **Qué y Por Qué:** Finalización de la auditoría técnica. (1) Extracción de dummys de `App.tsx` a páginas reales. (2) Refactorización modular de `DiagramWorkspace` extrayendo el editor a `CodeEditorPane`. (3) Implementación real de `SurveyJS` en formularios públicos. (4) Configuración del cliente `Supabase` e integración de login real para asegurar el flujo de autenticación JWT exigido por arquitectura.

---

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Correcciones de Seguridad RLS, Clean Architecture y DbContext
* **Archivos Tocados:** `backend/db/init.sql`, `backend/MateCode.Infrastructure/Persistence/AppDbContext.cs`, `backend/MateCode.API/Program.cs`, `backend/MateCode.API/Middlewares/MagicLinkMiddleware.cs`, Múltiples Servicios e Interfaces.
* **Qué y Por Qué:** Ejecución estricta del Plan de Acción Puntos 1, 3 y 4. (1) Se instaló `Npgsql.EntityFrameworkCore.PostgreSQL` y `Microsoft.EntityFrameworkCore.Design`. (2) Se agregaron las políticas `Row Level Security` (RLS) en todo `init.sql` validando con `current_setting`. (3) Se implementó Clean Architecture haciendo que todos los servicios obedezcan a inyecciones de dependencias por interfaces (`IKanbanService`, etc). (4) El middleware `MagicLinkMiddleware` ahora intercepta peticiones cotejando el `token_enlace_magico` de manera nativa y directa contra la tabla `clientes` de PostgreSQL usando Entity Framework.

---

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Cierre y Orquestación (Sprints Completados)
* **Archivos Tocados:** `backend/MateCode.API/Program.cs`, `frontend/src/App.tsx`
* **Qué y Por Qué:** Configuración final de los puntos de entrada (Entrypoints). El backend integra de forma estricta los servicios DI del dominio, AppDbContext por EF Core, CORS para el frontend y el pipeline con TenantResolver + MagicLink middleware. El frontend unificó todo el proyecto mediante `react-router-dom` respetando a rajatabla la revelación progresiva de Layouts del roadmap. Ecosistema MateCode preparado para uso.

---

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Sprint 6 / Testing, Portal Cliente y Cosecha (Fase 4 y 5)
* **Archivos Tocados:** `backend/.../MagicLinkMiddleware.cs`, `backend/.../HarvestService.cs`, `frontend/.../Phase4Testing.tsx`, `frontend/.../ClientPortal.tsx`, `frontend/.../Phase5Deployment.tsx`
* **Qué y Por Qué:** Cierre de ciclo. Pipeline visual de testing con auto-reporte interactivo de Deuda Técnica (bugs a tablero). Middlewares seguros asilando el Link Mágico. Mecanismos de sanitización y exportación de JSONB productivos hacia la Bóveda finalizando con un botón de despliegue optimista y cosechador de experiencia.

---

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Sprint 5 / La Trinchera y Motor de Prompts (Fase 3)
* **Archivos Tocados:** `backend/.../KanbanService.cs`, `backend/.../PromptEngineService.cs`, `frontend/src/pages/projects/Phase3Implementation.tsx`, `frontend/src/components/kanban/*`
* **Qué y Por Qué:** Desarrollo de tablero Kanban UI Optimista ultra rápido usando Pragmatic Drag & Drop con algoritmo O(1) Lexicográfico. Inyección del Core Inteligente de MateCode usando Microsoft Semantic Kernel y plantillas Scriban Zero-Allocation para armar prompts ultra específicos combinando la arquitectura del proyecto y los requerimientos BDD.

---

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Sprint 4 / Cotizador y Diseño Visual (Fase 2)
* **Archivos Tocados:** `backend/.../FinanceService.cs`, `frontend/src/pages/projects/Phase2Design.tsx`, `frontend/src/components/design/*`, `frontend/.../QuoteWizardModal.tsx`, `frontend/src/services/ParserService.ts`
* **Qué y Por Qué:** Implementación del Split View Bidireccional (Editor DBML a nodos React Flow) y en paralelo el Wizard Presupuestador dinámico integrado a `@react-pdf/renderer` respaldado por guardado transaccional en DB de bóveda y perfilado Multi-Brand (finanzas).

---

* **Fecha:** 2026-04-13
* **Módulo/Tarea:** Sprint 3 / Requisitos Visuales (Fase 1)
* **Archivos Tocados:** `backend/MateCode.Application/Services/AgileService.cs`, `backend/MateCode.API/Controllers/AgileController.cs`, `frontend/src/pages/projects/Phase1Requirements.tsx`, `frontend/src/components/agile/*`
* **Qué y Por Qué:** Generador/parser que procesa el JSON externo mapeando Épicas e Historias en base de datos `agile`. Se creó el tablero Story Mapping 2D en UI pura dividida atómicamente y el panel de edición BDD acoplándose eficientemente sin saturar la aplicación.

---

* **Fecha:** 2026-04-13
* **Módulo/Tarea:** Sprint 2 / Capa CRM y Factibilidad (Fase 0)
* **Archivos Tocados:** `backend/MateCode.Application/Services/CrmService.cs`, `backend/MateCode.API/Controllers/CrmController.cs`, `frontend/src/pages/crm/CrmDashboard.tsx`, `frontend/src/pages/projects/*`, `frontend/src/pages/public/FormInjectableView.tsx`
* **Qué y Por Qué:** Se desarrolló la interfaz para la incrustación de formularios y se implementó el CRM con bandeja de leads. El backend ahora orquesta la lógica transaccional asíncrona para mover un Lead a Cliente y generar simultáneamente el proyecto y su ADN en "Modo Enfoque", preparado para inyección de JSONB interactivo.

---

* **Fecha:** 2026-04-13
* **Módulo/Tarea:** Sprint 1 / Núcleo de Seguridad y Auth
* **Archivos Tocados:** `backend/MateCode.Core/Entities/*`, `backend/MateCode.Infrastructure/Persistence/AppDbContext.cs`, `backend/MateCode.API/Middlewares/TenantResolverMiddleware.cs`, `frontend/src/pages/auth/*`, `frontend/src/pages/team/*`, `frontend/src/layouts/*`
* **Qué y Por Qué:** Se implementó EF Core con RLS dinámico (Global Query Filters) para asegurar multitenancy, y un middleware que inyecta en contexto el JWT token. En el frontend se desarrolló la UI de login y de matriz de permisos basada en dictados JSONB para configuración atómica de perfiles.

---

* **Fecha:** 2026-04-13
* **Módulo/Tarea:** Setup Sprint 0 (Fix Supabase)
* **Archivos Tocados:** `backend/db/init.sql`
* **Qué y Por Qué:** Reemplazo del esquema `vault` por `blueprints`. `vault` es una palabra protegida usada por Supabase internamente (Supabase Vault), lo cual causaba el error 42501 (Permission Denied).

---

* **Fecha:** 2026-04-13
* **Módulo/Tarea:** Setup Sprint 0 (Cimientos Anti-Jira)
* **Archivos Tocados:** `frontend/*` (Vite), `backend/*` (.NET), `backend/db/init.sql`
* **Qué y Por Qué:** Se inicializó el monorepo aplicando Clean Architecture en .NET y arquitectura modular en React. Se redactó el esquema DB base aplicando 3FN sobre roles y permisos con soporte multitenancy vía RLS.

---

**Fecha:** 2026-04-13
**Módulo/Tarea:** Setup Inicial / Documentación
**Archivos Tocados:** `/docs/00_CONTEXTO_GLOBAL.md`, `/docs/01_MODELO_DE_DATOS.md`, `/docs/02_SITEMAP_Y_RUTAS.md`, `/docs/03_DISENO_Y_UX.md`, `/docs/04_FLUJO_DE_TRABAJO_IA.md`
**Qué y Por Qué:** Se estableció la arquitectura base, el modelo RLS en PostgreSQL, el enrutamiento con Modo Enfoque y las reglas de diseño para evitar que futuras generaciones de código rompan el proyecto.

---
---
* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 1: Consolidación Fase 0 (ADN del Proyecto) + Inyección Técnica
* **Archivos Tocados:** `backend/MateCode.Application/Services/IProjectService.cs`, `backend/MateCode.Infrastructure/Services/ProjectService.cs`, `backend/MateCode.API/Controllers/ProjectController.cs`, `backend/MateCode.API/Program.cs`, `frontend/src/components/projects/FeasibilityForm.tsx`
* **Qué y Por Qué:** Implementación de la lógica de negocio para la Fase 0. Se creó `IProjectService` para gestionar el "ADN del Proyecto". El backend ahora inyecta automáticamente Estándares de Ingeniería (Clean Arch, SOLID, Patrones) en el JSONB del proyecto. Se refactorizó la UI con `React Hook Form`, incluyendo placeholders educativos y feedback gamificado tipo "Mentor Argentino" para asegurar la calidad de los requerimientos iniciales.

---
---
* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 2: Requisitos Visuales y User Story Mapping (Fase 1)
* **Archivos Tocados:** `backend/.../IAgileService.cs`, `backend/.../AgileService.cs`, `backend/.../AgileController.cs`, `backend/.../AppDbContext.cs`, `frontend/.../Phase1Requirements.tsx`, `frontend/src/components/agile/*`
* **Qué y Por Qué:** Implementación del mapeo visual 2D. (1) Backend refactorizado para soportar Epicas e Historias con RLS y transaccionalidad. (2) Frontend actualizado con `Pragmatic Drag and Drop` para fluidez extrema. (3) Creación del editor BDD con placeholders educativos para asegurar la trazabilidad hacia la Fase de Testing. Se aplicó estética premium Zinc + Emerald.

---
---
* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 3: Diseño Visual (Fase 2) y Cotizador
* **Archivos Tocados:** `backend/.../IFinanceService.cs`, `backend/.../FinanceService.cs`, `backend/.../AppDbContext.cs`, `frontend/.../DiagramWorkspace.tsx`, `frontend/.../QuoteWizardModal.tsx`, `frontend/.../ParserService.ts`
* **Qué y Por Qué:** Implementación de la arquitectura visual y financiera. (1) Backend actualizado con entidades `PerfilEmpresa` y `Presupuesto` en español. (2) Workspace de diseño híbrido con React Flow y parser DBML. (3) Cotizador Multi-Marca con lógica de mentor argentino y cálculos financieros aislados en Custom Hook. Se mantiene estética Zinc + Emerald.

---
---
* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 4: La Trinchera (Fase 3 Kanban) y Motor de Prompts
* **Archivos Tocados:** `backend/.../IKanbanService.cs`, `backend/.../KanbanService.cs`, `backend/.../KanbanController.cs`, `frontend/.../KanbanBoard.tsx`, `frontend/.../TicketCard.tsx`, `frontend/.../PromptGeneratorModal.tsx`, `frontend/.../types.ts`
* **Qué y Por Qué:** Implementación del centro de ejecución ágil. (1) Backend con lógica de reordenamiento lexicográfico O(1) para alta performance. (2) Frontend con `@atlaskit/pragmatic-drag-and-drop`, Optimistic UI y estados visuales para tickets (Bugs/Deuda Técnica). (3) Motor de Prompts que unifica ADN, BDD y Stack para asistir a la IA de desarrollo. Se migró toda la nomenclatura a Español (Historia, Epica).

---
---
* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 5: Testing, Bóveda y Portal del Cliente (Cierre de Ciclo)
* **Archivos Tocados:** `backend/.../ClientPortalController.cs`, `backend/.../VaultService.cs`, `frontend/.../TestingChecklist.tsx`, `frontend/.../ClientMagicLink.tsx`, `frontend/.../VaultExtractorWizard.tsx`
* **Qué y Por Qué:** Finalización del ciclo de vida del software. (1) Portal del Cliente vía Magic LinkUUID para feedback asíncrono y visualización segura de solo lectura. (2) Módulo de Testing interactivo con teclado que inserta Bugs automáticamente en el Kanban ante fallos. (3) Wizard de Cosecha Exponencial para guardar Stacks y configuraciones en la Bóveda para reutilización futura. Se completó el mapeo total de entidades en español en el AppDbContext.

---
*(Las futuras entradas de la IA deben insertarse acá arriba)*