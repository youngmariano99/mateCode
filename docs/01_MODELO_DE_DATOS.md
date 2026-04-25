# 01_MODELO_DE_DATOS: Sistema Operativo "Anti-Jira"

## 1. Estrategia Global de Base de Datos (PostgreSQL)
* **Multitenancy Estricto (RLS):** TODAS las tablas principales deben tener la columna `tenant_id` o derivar de un esquema que la contenga (como `espacio_trabajo_id` u obteniéndolo de `proyecto_id`). Se implementa **Row-Level Security (RLS)** a nivel base de datos para garantizar que ningún dato se filtre entre espacios de trabajo.
* **Schema-per-Module:** Prohibido usar un único esquema `public`. La base de datos se divide en esquemas lógicos para evitar el acoplamiento: `nucleo`, `crm`, `proyectos`, `agil`, `boveda`.
* **Flexibilidad sin EAV:** Los campos dinámicos (configuraciones de formularios de clientes, matrices de permisos) SE GUARDAN COMO `JSONB` con índices GIN. Prohibido usar el antipatrón Entidad-Atributo-Valor.
* **Soft Deletes:** Se utiliza el patrón Soft Delete mediante columnas como `activo` (BOOLEAN) o `eliminado_en` (TIMESTAMP) en catálogos compartidos, para no romper las Foreign Keys en proyectos existentes.

---

## 2. Esquemas y Estructuras Principales

### Esquema: `nucleo` (Seguridad y Accesos)
Maneja la identidad, los espacios de trabajo y la matriz de permisos.
* **Tabla `usuarios`:** `id`, `email`, `nombre_completo`, `fecha_creacion`.
* **Tabla `espacios_trabajo`:** `id`, `nombre`, `propietario_id`, `fecha_creacion`.
* **Tabla `miembros_espacio`:** 
  * Columnas: `espacio_trabajo_id`, `usuario_id`, `rol_label` (Ej: "Full-Stack"), `matriz_permisos` (JSONB).

### Esquema: `crm` (Negocio y Clientes)
* **Tabla `clientes`:**
  * Columnas: `id`, `espacio_trabajo_id`, `nombre`, `email`, `estado`, `token_enlace_magico`, `contexto_json`.
* **Tabla `formularios_plantilla`:** Semánticos para inyección pública.
  * Columnas: `id`, `tenant_id`, `nombre`, `tipo`, `configuracion_json` (JSONB array), `fecha_creacion`.

### Esquema: `proyectos` (El Núcleo)
* **Tabla `proyectos`:**
  * Columnas: `id`, `tenant_id`, `cliente_id` (Nulable), `nombre`, `fase_actual`, `fecha_creacion`, `contexto_json` (Fase 0 - ADN del proyecto).
* **Tabla `proyecto_stack`:** Intersección del stack tecnológico del proyecto.
  * Columnas: `id`, `proyecto_id`, `tecnologia_id`, `descripcion_uso`.
* **Tabla `proyecto_estandar`:** Intersección de estándares de arquitectura.
  * Columnas: `proyecto_id`, `estandar_id`.

### Esquema: `agil` (Sprints, Historias y Backlog)
* **Tabla `epicas` & `historias` (Fase 1):** 
  * Columnas: `id`, `proyecto_id`, `titulo`, `criterios_bdd` (JSONB), etc.
* **Tabla `sprints` (Fase 3):**
  * Columnas: `id`, `proyecto_id`, `nombre`, `objetivo`, `fecha_inicio`, `fecha_fin`, `estado`.
* **Tabla `tickets` (Fase 3 - Trinchera):**
  * Columnas: `id`, `proyecto_id`, `historia_id`, `sprint_id`, `origen_historia_id`, `tipo` (Tarea/Bug/etc.), `estado`, `responsable_id`, `rango_lexicografico` (Texto para ordenamiento Drag&Drop O(1)), `titulo`, `epic_tag`, `prioridad`, `criterios_json`, `tareas_json`, `fecha_inicio_real`, `fecha_fin_real`.
* **Tabla `metricas_sprint`:**
  * Columnas: `id`, `sprint_id`, `tickets_completados`, `tickets_incompletos`, `promedio_cycle_time_horas`, `notas_retrospectiva`, `fecha_cierre`.

### Esquema: `boveda` (Plantillas, Stacks y Estándares de IA)
Alimenta a futuros proyectos y estandariza la arquitectura.
* **Tabla `plantillas_prompt`:** Motor generativo de instrucciones para el LLM.
  * Columnas: `id`, `tenant_id`, `titulo`, `descripcion`, `contenido_plantilla`, `fase_objetivo`, `etiquetas` (JSONB), banderas `inyecta_adn`, `inyecta_stack`, `inyecta_bdd`, etc.
* **Tabla `tecnologias_catalogo`:** Diccionario taxonómico seguro.
  * Columnas: `id`, `tenant_id`, `nombre`, `categoria_principal`, `categoria_secundaria`, `url_documentacion`, `color_hex`, `activo`.
* **Tabla `plantillas_stack`:** Agrupaciones reusables (Ej: "SaaS React + .NET").
  * Columnas: `id`, `tenant_id`, `nombre`, `descripcion`, `tecnologias_ids_json` (JSONB).
* **Tabla `estandares_catalogo`:** Reglas arquitectónicas o de seguridad.
  * Columnas: `id`, `espacio_trabajo_id`, `categoria`, `nombre`, `descripcion_didactica`, `color_hex`, `eliminado_en`, `activo`.

---

## 3. Relaciones y Flujos de Datos (Data Flow)

1. **Catálogos y Taxonomías Bóveda:**
   La bóveda funciona como un catálogo compartido global si el `tenant_id/espacio_trabajo_id` es `NULL` (o una constante como UUID vacía). Si el usuario customiza una tecnología/estándar, se inyecta su `tenant_id`. Se utiliza `activo` (Soft Delete) para no romper proyectos existentes.
2. **Flujo de Renderizado de Prompts de Arquitectura/Backlog:**
   Cuando la IA pide contexto para generar el Backlog (Sprint Grooming), el backend junta `proyectos.contexto_json` (Fase 0) + `agil.historias` (Fase 1) + diagramas/stacks. Utilizando `boveda.plantillas_prompt`, inyecta dinámicamente estos campos.
3. **Manejo del Cycle Time y Sprints:**
   Un `ticket` puede pasar de "Backlog" a un `sprint_id` en particular. Al iniciar y terminar tareas se actualizan `fecha_inicio_real` y `fecha_fin_real`. Al cerrar el sprint, la data consolidada alimenta `agil.metricas_sprint` para dashboards retrospectivos.

## 4. Reglas de Inserción y Consultas para la IA
* **NO usar JOINs masivos para configuraciones dinámicas:** Leer directamente los campos JSONB (`tareas_json`, `criterios_json`).
* **Ordenamiento de Tableros:** NUNCA hacer `UPDATE` a múltiples filas para reordenar un Kanban. Actualizar solo la fila movida usando el `rango_lexicografico`.
* **Seguridad RLS:** Todas las consultas `SELECT`, `UPDATE`, `INSERT` y `DELETE` en la capa de aplicación (vía EF Core / Dapper) interactúan transparentemente con el filtrado por contexto de Tenant gracias a las políticas configuradas (Ej. `aislamiento_tenant_sprints`).