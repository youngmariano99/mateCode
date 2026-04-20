# 01_MODELO_DE_DATOS: Sistema Operativo "Anti-Jira"

## 1. Estrategia Global de Base de Datos (PostgreSQL)
* **Multitenancy Estricto (RLS):** TODAS las tablas principales deben tener la columna `tenant_id` (que representa el `Workspace`). Se debe implementar **Row-Level Security (RLS)** a nivel base de datos para garantizar que ningún dato se filtre entre espacios de trabajo.
* **Schema-per-Module:** Prohibido usar un único esquema `public`. La base de datos se divide en esquemas lógicos para evitar el acoplamiento: `core`, `crm`, `projects`, `agile`, `vault`.
* **Flexibilidad sin EAV:** Los campos dinámicos (formularios de clientes, matrices de permisos) SE GUARDAN COMO `JSONB` con índices GIN. Prohibido usar el antipatrón Entidad-Atributo-Valor.

---

## 2. Esquemas y Estructuras Principales

### Esquema: `core` (Seguridad y Accesos)
Maneja la identidad, los espacios de trabajo y la matriz de permisos.
* **Tabla `users`:** `id`, `email`, `full_name`, `created_at`.
* **Tabla `workspaces`:** `id`, `name`, `owner_id`.
* **Tabla `workspace_members`:** * Columnas: `workspace_id`, `user_id`, `role_label` (Ej: "Full-Stack"), `permissions_matrix` (JSONB).
  * *Ejemplo JSONB `permissions_matrix`:*
    ```json
    {
      "fase_0": {"view": true, "edit": false},
      "fase_3": {"view": true, "edit": true},
      "crm": {"view": false, "edit": false}
    }
    ```

### Esquema: `crm` (Negocio y Clientes)
* **Tabla `leads`:** Registros crudos que entran por formularios inyectados (iframes/scripts).
  * Columnas: `id`, `tenant_id`, `source_url`, `raw_data` (JSONB con las respuestas), `status` (Pending, Approved, Rejected).
* **Tabla `clients`:** Se generan automáticamente al aprobar un Lead.
  * Columnas: `id`, `tenant_id`, `name`, `contact_email`, `magic_link_token` (Token único para acceso de solo lectura/feedback).

### Esquema: `projects` (El Núcleo)
* **Tabla `projects`:** * Columnas: `id`, `tenant_id`, `client_id` (Nulable), `name` (Ej: "ERP Comidas", "Animal Connect"), `status`.
* **Tabla `project_context` (Fase 0):** El "ADN" del proyecto.
  * Columnas: `project_id`, `feasibility_data` (JSONB: problema, impacto, KPIs, visión).
* **Tabla `portfolios`:** Para la exportación/importación Express.
  * Columnas: `id`, `project_id` (Nulable si es importado de afuera), `cover_image_url`, `exported_stack` (JSONB), `public_slug`.

### Esquema: `agile` (Fases 1, 3 y 4)
* **Tabla `epics` & `stories` (Fase 1):** * Columnas: `id`, `project_id`, `title`, `bdd_criteria` (JSONB con Given/When/Then).
* **Tabla `tickets` (Fase 3):**
  * Columnas: `id`, `project_id`, `story_id`, `type` (Task, Bug, TechDebt), `status`, `assignee_id` (Ej: ID de "Kevin" o "Mariano"), `lexicographical_rank` (Texto para ordenamiento Drag&Drop O(1) sin reordenar toda la tabla).
* **Tabla `client_feedback`:** Comentarios que deja el cliente desde su Link Mágico.
  * Columnas: `id`, `project_id`, `client_id`, `comment`, `attachment_url`, `linked_ticket_id` (Convierte un comentario en un ticket).

### Esquema: `vault` (Bóveda de Plantillas y Retroalimentación)
Alimenta a futuros proyectos.
* **Tabla `saved_stacks` (Fase 2):** * Columnas: `id`, `tenant_id`, `name` (Ej: "SaaS React + .NET"), `tech_payload` (JSONB).
* **Tabla `form_templates`:**
  * Columnas: `id`, `tenant_id`, `schema_json` (El JSON que lee SurveyJS para renderizar el formulario público).

---

## 3. Relaciones y Flujos de Datos (Data Flow)

1. **Flujo de Adquisición (CRM -> Project):**
   Un visitante llena un formulario público (SurveyJS embebido) -> Se inserta en `crm.leads`. -> El usuario lo aprueba -> Trigger SQL lo mueve a `crm.clients` y crea un registro inicial en `projects.projects`.
2. **Flujo de Renderizado de Prompts:**
   Cuando la IA pide contexto, el backend debe hacer un JOIN rápido leyendo `projects.project_context` (Fase 0) + `vault.saved_stacks` (Fase 2) + `agile.stories` (Fase 1).
3. **Flujo del Link Mágico:**
   Un cliente accede vía `misistema.com/client/{magic_link_token}`. El middleware valida el token, busca el `client_id`, y aplica un filtro estricto: solo devuelve data de `projects` y `agile.tickets` marcados como "visibles para el cliente". Permite hacer `INSERT` en `agile.client_feedback`.

## 4. Reglas de Inserción y Consultas para la IA
* **NO usar JOINs masivos para configuraciones:** Leer directamente los campos JSONB.
* **Ordenamiento de Tableros:** NUNCA hacer `UPDATE` a múltiples filas para reordenar un Kanban. Actualizar solo la fila movida usando el `lexicographical_rank`.
* **Seguridad:** Todas las consultas `SELECT`, `UPDATE` y `DELETE` desde la capa de aplicación DEBEN incluir el filtrado por el contexto del usuario actual (apoyando el RLS nativo de la base de datos).