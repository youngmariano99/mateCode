# Especificación Técnica: Módulo "DevHub" (Colaboración Síncrona y Trazabilidad)

## 1. Visión General
El DevHub es el espacio de trabajo "Multiplayer" para la Fase 3 (Desarrollo). Su objetivo es eliminar los silos de información mediante comunicación en tiempo real (WebSockets), registrar Decisiones Arquitectónicas (ADRs), gestionar Bugs de forma estructurada y proveer Pizarras en vivo. Todo esto está respaldado por el "Oráculo": un motor de búsqueda Full-Text que sugiere soluciones pasadas basadas en la similitud de palabras clave.

## 2. Arquitectura de Tiempo Real (SignalR)
Está ESTRICTAMENTE PROHIBIDO usar *Short/Long Polling* en el frontend. Se debe implementar `Microsoft.AspNetCore.SignalR`.

**Eventos requeridos en el `DevHubHub` (C#):**
- `JoinProjectGroup(proyectoId)`: Añade la conexión de SignalR al grupo del proyecto. Hace broadcast de `UserJoined(userId)`.
- `LeaveProjectGroup(proyectoId)`: Broadcast de `UserLeft(userId)`.
- `SetFocusMode(proyectoId, ticketId)`: El usuario notifica en qué ticket está trabajando. Broadcast de `UserFocused(userId, ticketId)`.
- `ClearFocusMode(proyectoId)`: Broadcast de `UserUnfocused(userId)`.

## 3. Modelo de Datos Estricto (PostgreSQL)
El esquema `colab` manejará estas entidades. Todas requieren `tenant_id` para RLS y `eliminado_en` para Soft Delete.

### 3.1. Tablero de Decisiones (ADR)
- **Tabla `colab.decisiones`**: 
  - `id` (UUID, PK), `proyecto_id` (UUID, FK), `tenant_id` (UUID).
  - `titulo` (VARCHAR), `contexto_json` (JSONB con: problema, alternativas, por_que_se_eligio).
  - `estado` (VARCHAR: 'Propuesta', 'En Debate', 'Aprobada', 'Rechazada').
  - `tags` (TEXT[] - Ej: ['mongodb', 'arquitectura']).
  - `creado_por` (UUID), `creado_en` (TIMESTAMPTZ).
  - `vector_busqueda` (TSVECTOR - Mantenido vía Trigger de PostgreSQL que concatene titulo y tags).
- **Tabla `colab.votos_decision`**: `id`, `decision_id`, `usuario_id`, `tipo` (SMALLINT: 1 = Upvote, -1 = Downvote). Un usuario solo puede tener un voto por decisión (Restricción UNIQUE).

### 3.2. Bug Tracker
- **Tabla `colab.bugs`**:
  - `id` (UUID, PK), `proyecto_id` (UUID), `tenant_id` (UUID).
  - `titulo` (VARCHAR).
  - `detalles_json` (JSONB con: pasos_reproducir, resultado_esperado, resultado_actual, stack_trace_opcional).
  - `tags_entorno` (TEXT[] - Ej: ['produccion', 'frontend', 'cors']).
  - `ticket_agil_id` (UUID, Nullable - Se llena cuando el bug se convierte en ticket de Kanban).
  - `estado` (VARCHAR: 'Reportado', 'Convertido a Ticket', 'Descartado').
  - `vector_busqueda` (TSVECTOR - Mantenido vía Trigger).

### 3.3. Pizarras (Whiteboards)
- **Tabla `colab.pizarras`**:
  - `id`, `proyecto_id`, `nombre`, `estado_json` (JSONB - Para guardar el payload de TLDraw/Excalidraw), `updated_at`.

## 4. El "Oráculo" (Motor de Similitud en Backend)
El `OracleController.cs` expondrá el endpoint `GET /api/Oracle/suggest?query={texto}`.
- **Regla Estricta:** NO usar `.Contains()` de Entity Framework en memoria. 
- **Lógica:** Debe ejecutar una consulta contra las columnas `vector_busqueda` de `colab.decisiones` y `colab.bugs` usando la función nativa `to_tsquery` de PostgreSQL para encontrar similitudes históricas dentro del mismo `tenant_id`.
- **Respuesta:** Devuelve un DTO con un máximo de 5 coincidencias, indicando el tipo (Bug/Decisión pasada) y un extracto del título/solución.

## 5. UI/UX: Componentes React (Frontend)

### 5.1. Barra de Presencia y Focus Mode
- En el layout del proyecto (Fase 3), renderizar un grupo de avatares superpuestos en el Header para cada usuario online.
- **En el Kanban (`ActiveSprintBoard.tsx`):** Si SignalR emite que el usuario "A" está en el ticket "X", renderizar un anillo (ring de Tailwind) o el mini-avatar de "A" en la tarjeta del ticket "X".

### 5.2. Tablero de Decisiones (ADR Board)
- Lista de tarjetas con el título y contadores de votos (👍 / 👎).
- Modal de Creación/Edición: Al tipear el "Título", disparar el Oráculo con `debounce(500ms)`. Si hay coincidencias, mostrar un banner flotante amarillo: *"💡 El Oráculo dice: Ya tomaste una decisión similar en el pasado..."*.

### 5.3. Bug Tracker (Conversión a Kanban)
- Vista de grilla/tabla con los bugs reportados.
- Modal de Detalles: Muestra el JSON de pasos y resultados.
- **Acción Estricta:** Botón "Convertir en Ticket". Al hacer clic, abre un modal pidiendo seleccionar el Sprint (Activo o Backlog). Hace un POST a `SprintController` que: 
  1. Crea un registro en `agil.tickets`.
  2. Le asigna la etiqueta visual de "BUG".
  3. Actualiza el `colab.bugs.ticket_agil_id` para enlazar ambas entidades.

### 5.4. Pizarra Colaborativa
- Integrar la librería `tldraw` (o similar compatible con React).
- El estado del documento (`estado_json`) debe guardarse automáticamente en la base de datos (debounced autosave) y/o sincronizarse en tiempo real vía SignalR si hay múltiples usuarios en la misma vista.