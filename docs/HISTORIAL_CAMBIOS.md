# REPORTE DE MIGRACIÓN: SPATIAL OS (Spatial Mapping & Immersive UI)

## 🌌 Visión General
Hemos iniciado la migración radical hacia **Spatial OS**, transformando la interfaz tradicional de MateCode en un entorno inmersivo basado en un **Mapa Arquitectónico 2D interactivo**. Esta arquitectura permite que todos los módulos de negocio (CRM, Agile, Vault, Team) convivan en un solo lienzo infinito, eliminando la navegación por URLs y recargas de página.

## 🏗️ Arquitectura del Mapa 2D
*   **Motor Visual:** Implementado en `WorkspaceMap.tsx` usando un sistema de coordenadas espaciales y regiones poligonales.
*   **Capa de Interacción (Region System):** El mapa detecta la posición del cursor sobre habitaciones específicas (Recepción, Biblioteca, Sala de Equipo, etc.) disparando un sistema de estados reactivos.
*   **Capa UI (UILayer):** Un sistema de modales inmersivos con diseño *Glassmorphism* que inyecta el módulo correspondiente directamente sobre el mapa, manteniendo el contexto espacial del usuario.
*   **Control de Estado:** Centralizado en `useWorkspaceStore` (Zustand), gestionando el `activeRoom` y la visibilidad de la capa de interfaz.

---

*   **Fecha:** 2026-04-27
*   **Módulo/Tarea:** Centro de Mando 2.0: Sala de Guerra & Auditoría Síncrona
*   **Archivos Tocados:** `SpatialLayout.tsx`, `DevHubLayout.tsx`, `SynchronousMeetingRoom.tsx`, `PresenceContext.tsx`, `ColabService.cs`, `DevHubHub.cs`
*   **Qué y Por Qué:** (1) **Encuestas Dinámicas:** Implementación de motor de votación real-time (SÍ/NO, Única, Múltiple) con transmisión de resultados y popups de ganador sincronizados. (2) **Auditoría Persistente:** Las actas de reunión ahora se guardan en formato JSONB incluyendo el resultado de cada encuesta y participantes para cumplimiento normativo. (3) **Unificación de Presencia:** Refactorización total de `DevHubLayout.tsx` para usar el `PresenceContext` compartido, eliminando conexiones SignalR duplicadas y sincronizando el mapa 2D con el nuevo Centro de Mando. (4) **UX de Decisión:** Se añadió un historial de decisiones tomadas en vivo dentro de la sala síncrona para evitar pérdida de contexto.

---

*   **Fecha:** 2026-04-26
*   **Módulo/Tarea:** Migración del Módulo de Equipo (Team Identity 2.0)
*   **Archivos Tocados:** `TeamWorkspace.tsx`, `WorkspaceMap.tsx`, `TeamController.cs`, `TeamService.cs`
*   **Qué y Por Qué:** Reingeniería total de la gestión de personas. (1) **Doble Etiquetado:** Implementación de etiquetas de *Proceso* (PO, SM, Dev) y *Técnicas* (Frontend, Backend, etc.) para una clasificación multidimensional. (2) **Acceso Granular:** Selector de proyectos por miembro, permitiendo "encender" o "apagar" la visibilidad de salas para usuarios específicos. (3) **Buscador LoL-Style:** Reemplazo de invitación por email por un buscador global de usuarios registrados en la plataforma.

---

*   **Fecha:** 2026-04-26
*   **Módulo/Tarea:** Unificación de Bóveda IA (IA Vault Hub)
*   **Archivos Tocados:** `LibraryWorkspace.tsx`, `PromptLibrary.tsx`, `FormLibrary.tsx`, `StandardLibrary.tsx`, `WorkspaceMap.tsx`
*   **Qué y Por Qué:** Integración de la biblioteca de conocimiento en la sala `library`. Se creó un Hub unificado con navegación interna por pestañas para gestionar el Oráculo (Prompts), Formularios Estructurados y Estándares de Ingeniería sin salir del entorno inmersivo.

---

*   **Fecha:** 2026-04-26
*   **Módulo/Tarea:** Migración CRM & Growth Hub a Recepción
*   **Archivos Tocados:** `CrmWorkspace.tsx`, `LeadInbox.tsx`, `WorkspaceMap.tsx`
*   **Qué y Por Qué:** El CRM ahora vive en la sala de Recepción. Se eliminaron los contenedores de página fija para adaptar la UI al `UILayer` inmersivo. Se configuró como un módulo de acceso global (Tenant-level) que no requiere proyecto activo para ser visualizado.

---

*   **Fecha:** 2026-04-26
*   **Módulo/Tarea:** Implementación de Spatial Layout & Autenticación TopBar
*   **Archivos Tocados:** `SpatialLayout.tsx`, `WorkspaceTopBar.tsx`, `WorkspaceMap.tsx`, `App.tsx`
*   **Qué y Por Qué:** (1) Creación de la cáscara visual del SO Espacial. (2) Conexión de la TopBar con Supabase para mostrar el nombre del usuario real y selector de proyectos global. (3) Fix de importaciones duplicadas y errores de compilación en el renderizado del mapa.

---

* **Fecha:** 2026-04-24
* **Módulo/Tarea:** Fase 3 Completa - Backlog Inteligente y Gestión de Sprints
* **Archivos Tocados:** `20260424_ModuloSprints.sql`, `AgilEntities.cs`, `AppDbContext.cs`, `BacklogService.cs`, `SprintController.cs`, `BacklogHub.tsx`, `ActiveSprintBoard.tsx`, `SprintRetrospectiveModal.tsx`
* **Qué y Por Qué:** Se implementó el motor de importación de tickets y generación de mega-prompt con la Bóveda y Fase 0/1, tableros Kanban activos con timestamps invisibles, y el proceso de cierre de sprints con cálculo de Cycle Time y Triage obligatorio de tareas sueltas.

---

* **Fecha:** 2026-04-24
* **Módulo/Tarea:** Unificación de Diseño IA-Ready y Matriz de Roles Plana
* **Archivos Tocados:** `frontend/.../RolesMatrixView.tsx`, `frontend/.../DiagramWorkspace.tsx`, `frontend/.../UniversalSitemapBrandingWorkspace.tsx`, `frontend/.../MapaHistoriasBoard.tsx`, `frontend/.../CodeEditorPane.tsx`, `frontend/.../GeneradorPromptDesignModal.tsx`
* **Qué y Por Qué:** (1) Evolución de la Matriz de Roles a un modelo de "Tabla Plana" con detección dinámica de roles e indicadores visuales de alta fidelidad. (2) Implementación de Sincronización Bidireccional (Live Sync) en tiempo real entre editores JSON y vistas visuales para Sitemap (Wiremap) y Story Map 2D (Requisitos). (3) Desarrollo de UX inmersiva mediante paneles laterales colapsables ("Modo Foco"), navegación "Drag-to-Pan" para tablas extensas y gestión inteligente de altura del editor. (4) Creación de motor de exportación multi-formato con soporte para captura de PNG de alta resolución y PDF de presentación. (5) Optimización de Ingeniería de Prompts en el Oráculo para forzar esquemas JSON estrictos compatibles con el nuevo motor visual.

---

* **Fecha:** 2026-04-22
* **Módulo/Tarea:** Reingeniería Story Mapping Multidimensional (Jeff Patton Style)
* **Archivos Tocados:** `backend/.../AgileService.cs`, `backend/.../AgilEntities.cs`, `backend/.../AppDbContext.cs`, `backend/.../PromptEngineService.cs`, `frontend/.../MapaHistoriasBoard.tsx`, `frontend/.../Phase1Requirements.tsx`, `backend/db/update_storymap_schema.sql`
* **Qué y Por Qué:** (1) Transformación del Story Map a un modelo bidimensional estricto con Epics (Backbone), Features (Narrativa) y Releases (Swimlanes/Versiones). (2) Evolución del esquema DB con tablas para Releases, Personas y Features, asegurando integridad referencial mediante transacciones y guardado parcial. (3) Implementación de UX avanzada con "Panning" (arrastrar para desplazar) y pantallas de carga para hidratación de datos. (4) Mejora del Motor de Prompts para exigir la asignación de Personas (roles) a cada historia. (5) Sincronización de backlog con modos "Incremental" y "Total" (Sobrescribir) para gestión flexible de tickets.

---

* **Fecha:** 2026-04-22
* **Módulo/Tarea:** Estandarización de Infraestructura API (Migration a Centralized Client) y Fix CRM
* **Archivos Tocados:** `frontend/src/lib/apiClient.ts`, `frontend/src/pages/vault/*.tsx`, `frontend/src/components/crm/*.tsx`, `frontend/src/components/projects/StackBuilder.tsx`, `backend/.../CrmService.cs`, `backend/.../ProjectEntities.cs`
* **Qué y Por Qué:** (1) Creación de `apiClient.ts` para centralizar la comunicación HTTP, eliminando el uso disperso de `fetch` y URLs hardcodeadas (`localhost:5241`). **Objetivo:** Facilitar el despliegue multi-entorno mediante `VITE_API_URL`. (2) Automatización de headers de seguridad (JWT + Tenant ID) en todas las peticiones, simplificando los componentes de UI. (3) Resolución de error `PostgresException` en el CRM mediante la implementación de la columna `contexto_json` en la entidad `Cliente` y su persistencia en el `CrmService`. (4) Mejora del tipado en el cliente API para soportar parámetros de consulta dinámicos (`params`), resolviendo errores de compilación en la Bóveda de Prompts.

---

* **Fecha:** 2026-04-22
* **Módulo/Tarea:** Refinamiento #6: Hub de Contexto y Salud del ADN (Sincronización Total)
* **Archivos Tocados:** `backend/.../ProjectController.cs`, `backend/.../ProjectService.cs`, `backend/.../PromptEngineService.cs`, `backend/.../AgileController.cs`, `frontend/.../ProjectDashboard.tsx`, `frontend/.../FocusLayout.tsx`, `frontend/.../TestingChecklist.tsx`, `frontend/.../App.tsx`
* **Qué y Por Qué:** (1) Implementación del **Context Hub** (`ProjectDashboard.tsx`) como vista raíz de proyectos, ofreciendo un resumen visual de completitud técnica (ADN, Stack, Requisitos). (2) Desarrollo del **Motor de Prompt Maestro** que genera un mega-contexto Markdown agregando todo el estado del proyecto para inicializar chats de IA. (3) Unificación del estado `activo` (Soft Delete) en catálogos de Bóveda, sincronizando el "DNA Health Monitor" con la realidad de la DB. (4) Resolución de errores 404 y estados de carga infinitos en el módulo de Testing mediante la exposición de endpoints en `AgileController` y el uso de `useParams` como fallback de ID. (5) Integración del Dashboard como pestaña central ("HUB") en el `FocusLayout` para navegación fluida.

---

* **Fecha:** 2026-04-21
* **Módulo/Tarea:** Reestructuración de Requirement Hub (Fase 0) y CRM 2.0
* **Archivos Tocados:** `frontend/.../FeasibilityForm.tsx`, `frontend/.../CrmDashboard.tsx`, `frontend/.../LeadInbox.tsx`, `frontend/.../LeadCaptureModule.tsx`, `frontend/.../ProjectsList.tsx`, `backend/.../PublicController.cs`, `backend/.../ProjectEntities.cs`, `backend/.../AppDbContext.cs`
* **Qué y Por Qué:** Transformación del flujo de captura. (1) Se desacopló el flujo BANT de la Fase 0, moviéndolo al CRM bajo un nuevo modelo de "Link Mágico Global" para calificar leads antes de crear proyectos. (2) Refactorización radical de `FeasibilityForm.tsx` modularizando en componentes (`TemplatePickerModal`, `ProjectStandardsAside`) logrando bajar de 400 a ~130 líneas. (3) Ampliación de la entidad `Cliente` con `ContextoJson` para persistir datos BANT de forma independiente. (4) Rediseño visual "MateCode Dark Premium" de las tarjetas de proyecto solucionando problemas de legibilidad en Dark Mode.

---

* **Fecha:** 2026-04-20
* **Módulo/Tarea:** Estándares Kanban y Consistencia de Datos (Trinchera)
* **Archivos Tocados:** `backend/.../KanbanService.cs`, `backend/.../ProjectService.cs`, `backend/.../KanbanController.cs`, `backend/database/scripts/20260420_FixTicketsTable.sql`
* **Qué y Por Qué:** Automatización del flujo ágil. (1) Sincronización de base de datos para resolver error de columna `titulo` faltante mediante script de reparación. (2) Implementación de flujo de inicialización: ahora cada proyecto nuevo crea automáticamente columnas base ("Por hacer", "En progreso", "En espera", "Completado"). (3) Se habilitó el soporte para reordenación dinámica de columnas desde el backend para personalización total del tablero.

---

* **Fecha:** 2026-04-20
* **Módulo/Tarea:** Biblioteca de Prompts Dinámica (Bóveda) + Mejoras Fase 2
* **Archivos Tocados:** `backend/.../PromptLibraryService.cs`, `backend/.../PromptLibraryController.cs`, `backend/.../PromptEngineService.cs`, `frontend/.../GeneradorPromptDesignModal.tsx`, `frontend/.../DiagramWorkspace.tsx`
* **Qué y Por Qué:** Centralización de prompts en la Bóveda. (1) Se creó el registro dinámico de plantillas en DB eliminando prompts hardcodeados. (2) Se implementó inyección contextual (ADN, BDD, Stack) con "switches" en tiempo real desde la UI. (3) Se optimizó la performance del modal de diseño eliminando latencia mediante carga asíncrona y feedback visual inmediato. (4) Se enriquecieron las plantillas base con ejemplos de formato Few-Shot (DBML/PlantUML).

---

* **Fecha:** 2026-04-20
* **Módulo/Tarea:** Seguridad y Autenticación (Resolución Error 401 / Migración a JWT ECC P-256)
* **Archivos Tocados:** `backend/MateCode.API/Program.cs`, `frontend/src/components/layout/WorkspaceSelector.tsx`, `backend/MateCode.API/appsettings.json`
* **Qué y Por Qué:** Resolución definitiva del error 401 Unauthorized. **El Problema:** Supabase migró de HS256 a ECC P-256 (claves asimétricas), invalidando el secreto estático en texto plano. **Solución Backend:** Se migró a validación dinámica vía `Authority`, permitiendo que .NET descargue las llaves públicas de Supabase automáticamente. **Sincronización JIT:** Se implementó `SyncUserAsync` en el `WorkspaceService` para realizar un *Upsert* del usuario local antes de crear espacios, evitando errores de clave foránea. **Solución Frontend:** Se implementó una guarda de seguridad para evitar peticiones con `undefined` durante la carga inicial de la sesión.

---

* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 5: Testing, Bóveda y Portal del Cliente (Cierre de Ciclo)
* **Archivos Tocados:** `backend/.../ClientPortalController.cs`, `backend/.../VaultService.cs`, `frontend/.../TestingChecklist.tsx`, `frontend/.../ClientMagicLink.tsx`, `frontend/.../VaultExtractorWizard.tsx`
* **Qué y Por Qué:** Finalización del ciclo de vida del software. (1) Portal del Cliente vía Magic LinkUUID para feedback asíncrono y visualización segura de solo lectura. (2) Módulo de Testing interactivo con teclado que inserta Bugs automáticamente en el Kanban ante fallos. (3) Wizard de Cosecha Exponencial para guardar Stacks y configuraciones en la Bóveda para reutilización futura. Se completó el mapeo total de entidades en español en el AppDbContext.

---

* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 4: La Trinchera (Fase 3 Kanban) y Motor de Prompts
* **Archivos Tocados:** `backend/.../IKanbanService.cs`, `backend/.../KanbanService.cs`, `backend/.../KanbanController.cs`, `frontend/.../KanbanBoard.tsx`, `frontend/.../TicketCard.tsx`, `frontend/.../PromptGeneratorModal.tsx`, `frontend/.../types.ts`
* **Qué y Por Qué:** Implementación del centro de ejecución ágil. (1) Backend con lógica de reordenamiento lexicográfico O(1) para alta performance. (2) Frontend con `@atlaskit/pragmatic-drag-and-drop`, Optimistic UI y estados visuales para tickets (Bugs/Deuda Técnica). (3) Motor de Prompts que unifica ADN, BDD y Stack para asistir a la IA de desarrollo. Se migró toda la nomenclatura a Español (Historia, Epica).

---

* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 3: Diseño Visual (Fase 2) y Cotizador
* **Archivos Tocados:** `backend/.../IFinanceService.cs`, `backend/.../FinanceService.cs`, `backend/.../AppDbContext.cs`, `frontend/.../DiagramWorkspace.tsx`, `frontend/.../QuoteWizardModal.tsx`, `frontend/.../ParserService.ts`
* **Qué y Por Qué:** Implementación de la arquitectura visual y financiera. (1) Backend actualizado con entidades `PerfilEmpresa` y `Presupuesto` en español. (2) Workspace de diseño híbrido con React Flow y parser DBML. (3) Cotizador Multi-Marca con lógica de mentor argentino y cálculos financieros aislados en Custom Hook. Se mantiene estética Zinc + Emerald.

---

* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 2: Requisitos Visuales y User Story Mapping (Fase 1)
* **Archivos Tocados:** `backend/.../IAgileService.cs`, `backend/.../AgileService.cs`, `backend/.../AgileController.cs`, `backend/.../AppDbContext.cs`, `frontend/.../Phase1Requirements.tsx`, `frontend/src/components/agile/*`
* **Qué y Por Qué:** Implementación del mapeo visual 2D. (1) Backend refactorizado para soportar Epicas e Historias con RLS y transaccionalidad. (2) Frontend actualizado con `Pragmatic Drag and Drop` para fluidez extrema. (3) Creación del editor BDD con placeholders educativos para asegurar la trazabilidad hacia la Fase de Testing. Se aplicó estética premium Zinc + Emerald.

---

* **Fecha:** 2026-04-18
* **Módulo/Tarea:** Módulo 1: Consolidación Fase 0 (ADN del Proyecto) + Inyección Técnica
* **Archivos Tocados:** `backend/MateCode.Application/Services/IProjectService.cs`, `backend/MateCode.Infrastructure/Services/ProjectService.cs`, `backend/MateCode.API/Controllers/ProjectController.cs`, `backend/MateCode.API/Program.cs`, `frontend/src/components/projects/FeasibilityForm.tsx`
* **Qué y Por Qué:** Implementación de la lógica de negocio para la Fase 0. Se creó `IProjectService` para gestionar el "ADN del Proyecto". El backend ahora inyecta automáticamente Estándares de Ingeniería (Clean Arch, SOLID, Patrones) en el JSONB del proyecto. Se refactorizó la UI con `React Hook Form`, incluyendo placeholders educativos y feedback gamificado tipo "Mentor Argentino" para asegurar la calidad de los requerimientos iniciales.

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

*(Las futuras entradas de la IA deben insertarse acá arriba)*