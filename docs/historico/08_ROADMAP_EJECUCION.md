# 08_ROADMAP_EJECUCION: Guía de Sprints y Contexto

## Objetivo
Este documento define el orden cronológico de desarrollo. Para evitar la degradación de contexto y las alucinaciones de la IA, CADA SPRINT debe ejecutarse en una sesión de chat/contexto limpia, inyectando ÚNICAMENTE los archivos especificados para esa tarea.

---

## 🛑 ARCHIVOS BASE (OBLIGATORIOS EN TODOS LOS SPRINTS)
Sin importar qué se esté programando, la IA SIEMPRE debe tener cargados estos 3 archivos para no romper las reglas globales y mantener el lenguaje en español:
1. `00_CONTEXTO_GLOBAL.md`
2. `01_MODELO_DE_DATOS.md`
3. `04_FLUJO_DE_TRABAJO_IA.md`

---

## SPRINT 0: Cimientos y Setup Inicial
**Objetivo:** Configurar la estructura de carpetas, dependencias base de React y .NET, y crear los scripts SQL de creación de tablas con RLS.
* **Archivos a inyectar:** [Archivos Base] + `03_DISENO_Y_UX.md`
* **Entregable:** Repositorio limpio con Tailwind configurado, estructura de Clean Architecture en .NET y base de datos inicializada en PostgreSQL.

## SPRINT 1: Núcleo de Seguridad y Multitenancy
**Objetivo:** Implementar registro, login, creación de Espacios de Trabajo (Workspaces) y el motor de validación de la Matriz de Permisos JSONB.
* **Archivos a inyectar:** [Archivos Base] + `auth_y_usuarios.md` + `02_SITEMAP_Y_RUTAS.md`
* **Entregable:** El usuario puede crear cuenta, armar un Workspace e invitar a miembros simulados con diferentes permisos.

## SPRINT 2: Capa CRM y Factibilidad (Fase 0)
**Objetivo:** Crear el generador de formularios inyectables (SurveyJS), la bandeja de entrada de Leads, y el panel de Factibilidad (ADN del proyecto).
* **Archivos a inyectar:** [Archivos Base] + `fase_0_factibilidad.md` + `crm_y_portal_cliente.md` + `03_DISENO_Y_UX.md`
* **Entregable:** Formularios públicos funcionales. Los Leads caen a la BD y al aprobarse generan un `proyecto` con su `feasibility_data`.

## SPRINT 3: Requisitos visuales (Fase 1)
**Objetivo:** Implementar el parser de JSON externo a Tablero 2D y el panel de refinamiento BDD.
* **Archivos a inyectar:** [Archivos Base] + `fase_1_requisitos.md` + `03_DISENO_Y_UX.md`
* **Entregable:** Lienzo de User Story Mapping interactivo. Historias y Criterios BDD guardados correctamente en la BD.

## SPRINT 4: Cotizador y Diseño (Fase 2)
**Objetivo:** Armar el generador de Presupuestos (con soporte multi-perfil) y la vista dividida de diagramación DBML/PlantUML a React Flow.
* **Archivos a inyectar:** [Archivos Base] + `cotizacion_y_presupuestos.md` + `fase_2_diseno.md`
* **Entregable:** El usuario puede generar un PDF de presupuesto y armar su base de datos visualmente.

## SPRINT 5: La Trinchera (Fase 3) y Motor de Prompts
**Objetivo:** Desarrollar el Kanban ultrarrápido con Pragmatic Drag and Drop y conectar el motor de plantillas Scriban en el backend.
* **Archivos a inyectar:** [Archivos Base] + `fase_3_kanban.md` + `05_MOTOR_DE_PROMPTS.md`
* **Entregable:** Tablero ágil funcional con ordenamiento lexicográfico. El botón "Prompt Mágico" devuelve texto compilado con el contexto de las fases anteriores.

## SPRINT 6: Testing, Portal Cliente y Cosecha (Fase 4 y 5)
**Objetivo:** Checklist de pruebas que genere bugs en la Fase 3, acceso mediante el Link Mágico y exportación a la Bóveda/Portfolio.
* **Archivos a inyectar:** [Archivos Base] + `fase_4_y_5_testing_y_despliegue.md` + `crecimiento_y_boveda.md` + `crm_y_portal_cliente.md`
* **Entregable:** El ecosistema se cierra. Se pueden importar proyectos pasados y guardar módulos como plantillas reutilizables.