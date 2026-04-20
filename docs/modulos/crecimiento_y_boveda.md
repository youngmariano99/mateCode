# 08_ROADMAP_EJECUCION: Guía Estricta de Sprints y Contexto

## OBJETIVO Y REGLA DE ORO
Este documento es el **cronograma maestro**. Para evitar la degradación de contexto, CADA SPRINT debe ejecutarse en una sesión de chat/contexto limpia, inyectando ÚNICAMENTE los archivos especificados para esa tarea. 

**Prohibido avanzar al siguiente Sprint sin la aprobación del usuario sobre el actual.**

---

## 🛑 ARCHIVOS BASE (OBLIGATORIOS EN TODOS LOS SPRINTS)
Sin importar qué Sprint se esté ejecutando, la IA SIEMPRE debe tener cargados y obedecer estos 4 archivos:
1. `00_CONTEXTO_GLOBAL.md`: Para respetar la Arquitectura Limpia (Clean Architecture), los principios SOLID, el límite de ~250 líneas por archivo y las Convenciones de Nomenclatura en **Español Latinoamericano**.
2. `01_MODELO_DE_DATOS.md`: Para respetar los esquemas lógicos, el uso de JSONB y nunca romper el Multitenancy (RLS).
3. `04_FLUJO_DE_TRABAJO_IA.md`: Para aplicar el algoritmo de validación antes de codificar (Prohibido inventar).
4. `07_ECOSISTEMA_Y_RETROALIMENTACION.md`: Para entender cómo la data de este sprint afectará al siguiente.

---

## SPRINT 0: Cimientos, Arquitectura y Setup Inicial
**Objetivo:** Levantar el esqueleto del proyecto respetando la separación de dominios.
* **Archivos a inyectar:** [Archivos Base] + `03_DISENO_Y_UX.md` + `02_SITEMAP_Y_RUTAS.md`
* **Instrucciones Estrictas para la IA:**
  * **BD:** Crear el script SQL inicial con los esquemas (`nucleo`, `crm`, `proyectos`, `agil`, `finanzas`, `boveda`) y activar RLS.
  * **Backend (.NET):** Crear la solución estructurada en capas (Domain, Application, Infrastructure, Presentation). Configurar inyección de dependencias.
  * **Frontend (React):** Inicializar Vite/Next.js. Configurar Tailwind CSS. Armar los Layouts base (`PublicLayout`, `GlobalLayout`, `FocusLayout`) vacíos pero enrutados.

## SPRINT 1: Núcleo de Seguridad y Multitenancy
**Objetivo:** Implementar la identidad y aislar los espacios de trabajo.
* **Archivos a inyectar:** [Archivos Base] + `auth_y_usuarios.md` + `02_SITEMAP_Y_RUTAS.md`
* **Instrucciones Estrictas para la IA:**
  * **BD & Backend:** Conectar el ORM (ej. Entity Framework) respetando el esquema `nucleo`. Crear el middleware que intercepta el JWT y setea el `tenant_id` actual.
  * **Frontend:** Crear pantallas de Login/Registro. Crear la vista de "Gestión de Equipo" y el componente interactivo para editar la **Matriz JSONB de Permisos**.

## SPRINT 2: Capa CRM y Factibilidad (Fase 0)
**Objetivo:** Construir el embudo de entrada (Leads) y el ADN del proyecto.
* **Archivos a inyectar:** [Archivos Base] + `fase_0_factibilidad.md` + `crm_y_portal_cliente.md`
* **Instrucciones Estrictas para la IA:**
  * **Frontend:** Integrar `SurveyJS` vía Lazy-Loading para crear iframes embebibles. Crear el dashboard del CRM para aprobar Leads. Crear el formulario de Factibilidad (Problema, KPIs, etc.) guardando en `feasibility_data`.
  * **Backend:** Endpoints públicos para recibir envíos de iframes. Lógica de transición de Lead a Proyecto.

## SPRINT 3: Requisitos Visuales (Fase 1)
**Objetivo:** Construir el User Story Mapping 2D y el refinamiento BDD.
* **Archivos a inyectar:** [Archivos Base] + `fase_1_requisitos.md`
* **Instrucciones Estrictas para la IA:**
  * **Frontend:** Crear el lienzo 2D (usando Drag & Drop ligero). Implementar el parser que lee un JSON externo y lo dibuja. Panel lateral para editar Criterios BDD con placeholders educativos ("Dado que... Cuando...").
  * **Backend:** Endpoints para realizar CRUD masivo (pero eficiente) sobre las tablas `agil.epicas` y `agil.historias`.

## SPRINT 4: Cotizador y Diseño Visual (Fase 2)
**Objetivo:** Presupuestador Multi-Marca y Pizarras híbridas.
* **Archivos a inyectar:** [Archivos Base] + `cotizacion_y_presupuestos.md` + `fase_2_diseno.md`
* **Instrucciones Estrictas para la IA:**
  * **Frontend:** Integrar `React Flow` (`xyflow`). Crear la vista dividida (Código DBML/PlantUML a la izquierda, nodos visuales a la derecha). Usar `@react-pdf/renderer` para exportar presupuestos usando los perfiles de la tabla `finanzas.perfiles_empresa`.
  * **Backend:** Endpoints para guardar el Stack técnico y el presupuesto. 

## SPRINT 5: La Trinchera (Fase 3) y Motor de Prompts
**Objetivo:** El Kanban ultra-rápido y la integración de IA generativa.
* **Archivos a inyectar:** [Archivos Base] + `fase_3_kanban.md` + `05_MOTOR_DE_PROMPTS.md`
* **Instrucciones Estrictas para la IA:**
  * **Frontend:** Usar **Pragmatic Drag and Drop** obligatoriamente. Implementar UI Optimista. Crear el modal del "Prompt Mágico".
  * **Backend:** Lógica crítica: Implementar ordenamiento lexicográfico O(1) para reordenar tickets. Integrar **Microsoft Semantic Kernel** y **Scriban** para compilar la plantilla del prompt uniendo Fase 0, 1 y 2.

## SPRINT 6: Testing, Portal Cliente y Cosecha (Fase 4 y 5)
**Objetivo:** Checklist de calidad, vista externa y exportación al portfolio.
* **Archivos a inyectar:** [Archivos Base] + `fase_4_y_5_testing_y_despliegue.md` + `crecimiento_y_boveda.md` + `crm_y_portal_cliente.md`
* **Instrucciones Estrictas para la IA:**
  * **Frontend:** Crear el `ClientLayout` (Link Mágico) de solo lectura. Crear el Wizard de exportación para guardar plantillas en la Bóveda.
  * **Backend:** Middleware para validar el `token_enlace_magico`. Generador de JSON empaquetado para el Portfolio (sanitizando datos sensibles).