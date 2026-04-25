# Especificación Técnica: Módulo "Backlog Inteligente y Gestión de Sprints" (Fase 3)

## 1. Visión General
La Fase 3 centraliza la ejecución del proyecto combinando Grooming Automatizado, Sprint Planning y Auditoría. 
El flujo rechaza la creación manual tediosa: el sistema compila la Fase 0 (Stack/Blueprint), Fase 1 (User Story Mapping) y Fase 2 (ERD/Arquitectura) para generar un Mega-Prompt. Una IA externa procesa esto y devuelve un JSON con tickets técnicos listos para importar. Luego, el usuario planifica Sprints, ejecuta en un Kanban y audita el rendimiento (Cycle Time) al finalizar.

## 2. Contrato de Datos (Importación de Grooming JSON)
Cuando se solicita el prompt de Grooming, la IA externa DEBE devolver un array de tickets con esta estructura estricta cruzando el negocio (Fase 1) con la técnica (Fases 0 y 2):

```json
{
  "sprint_recomendado_dias": 14,
  "tickets": [
    {
      "origen_historia_id": "UUID-de-la-historia-Fase-1",
      "titulo_tecnico": "Frontend: UI de Carrito Offline-First",
      "prioridad_release": "MVP",
      "epic_tag": "Operaciones POS",
      "criterios_aceptacion": [
        "Debe funcionar sin conexión usando IndexedDB"
      ],
      "tareas_tecnicas": [
        { "capa": "Frontend", "detalle": "Crear componente PosCart.tsx en React" },
        { "capa": "BD", "detalle": "Sincronizar tabla 'ventas' (Ver ERD)" }
      ]
    }
  ]
}

3. Modelo de Datos (PostgreSQL)
Se requieren tablas para soportar el ciclo de vida y la auditoría:

agil.tickets: id, sprint_id (nullable), origen_historia_id, titulo, epic_tag, prioridad, criterios_json, tareas_json, estado ('Backlog', 'To Do', 'In Progress', 'Done'), fecha_inicio_real (timestamp), fecha_fin_real (timestamp).

agil.sprints: id, proyecto_id, nombre, objetivo, fecha_inicio, fecha_fin, estado ('Planificado', 'Activo', 'Cerrado').

agil.metricas_sprint: id, sprint_id, tickets_completados, tickets_incompletos, promedio_cycle_time_horas, notas_retrospectiva.

4. Lógica de UI/UX y Procedimientos (Frontend en React)
4.1. El Backlog Hub (Importación)
Botón "Generar Prompt de Refinamiento": El backend (PromptEngineService) concatena los JSONs de las Fases 0, 1 y 2 y arma la instrucción estricta.

Importación: Modal para pegar el JSON de la IA. Al procesar, hace un bulk insert en agil.tickets con estado 'Backlog'.

Vista: Lista ordenada por prioridad_release (MVP arriba).

4.2. Sprint Planning
Checkboxes en los tickets del Backlog para seleccionarlos.

Botón "Iniciar Sprint": Abre un modal pidiendo Nombre, Duración (Días) y Objetivo.

Acción: Asigna el sprint_id a los tickets seleccionados y cambia su estado a 'To Do'.

4.3. Tablero Activo (Kanban)
Vista de columnas estándar.

Auditoría de Tiempo Inclusiva (Cycle Time): - Cuando un ticket pasa a 'In Progress', el backend setea fecha_inicio_real = NOW().

Cuando pasa a 'Done', setea fecha_fin_real = NOW().

4.4. Cierre de Sprint y Retrospectiva (Triage)
Botón "Finalizar Sprint" (Disponible si el Sprint está Activo).

Modal de Retrospectiva:

Métricas: Muestra el cálculo de fecha_fin_real - fecha_inicio_real (Cycle Time promedio).

Triage de Incompletos: Lista de tickets que no están en 'Done'. Por cada uno, un Select obligatorio:

Mover al Backlog (limpia el sprint_id y vuelve estado a 'Backlog').

Mover a Próximo Sprint (crea el sprint secuencial y los asigna).

Descartar (soft delete con input de motivo).

Al confirmar, guarda los datos en agil.metricas_sprint para trazabilidad futura y cierra el sprint.


---

### 🎯 PASO 2: El Prompt Sniper

Ahora, abrí un chat nuevo en tu IDE. Adjuntá tus archivos base y **obligatoriamente el nuevo `@14_MODULO_BACKLOG_Y_SPRINTS.md`**. 

Tirale este prompt a la IA para que ejecute toda la especificación:

```text
Actúa como Tech Lead y Arquitecto Full-Stack Senior de MateCode. Estamos iniciando una sesión limpia para construir la Fase 3 completa.

FASE DE INICIALIZACIÓN (LECTURA OBLIGATORIA):
Por favor, lee y asimila estrictamente el documento @14_MODULO_BACKLOG_Y_SPRINTS.md que acabo de adjuntar. Contiene el contrato de importación JSON, la estructura relacional para auditoría de Cycle Time, y el flujo exacto de Sprint Planning y Retrospectiva.

OBJETIVO DEL SPRINT:
Implementar el Motor de Backlog, el Kanban Activo y el sistema de Cierre de Sprint con métricas.

TAREAS DE EJECUCIÓN (CÓDIGO COMPLETO):
1. Base de Datos: Script SQL para las tablas `agil.tickets`, `agil.sprints` y `agil.metricas_sprint` incluyendo las columnas de timestamp (`fecha_inicio_real`, `fecha_fin_real`).
2. Backend (C#): 
   - `BacklogService.cs`: Método de inyección múltiple (Fase 0, 1 y 2) para el prompt maestro, y el método `BulkImportTickets`.
   - `SprintController.cs`: Endpoints para Iniciar Sprint (asignación masiva) y Finalizar Sprint (cálculo de cycle time y Triage de no terminados).
3. Frontend (React):
   - `BacklogHub.tsx`: Vista de lista con checkboxes, botón de importación JSON y Modal de "Iniciar Sprint".
   - `ActiveSprintBoard.tsx`: El Kanban. Al mover una tarjeta, debe llamar al backend para actualizar estados y timestamps invisibles.
   - `SprintRetrospectiveModal.tsx`: Modal complejo que aparece al finalizar el sprint, mostrando métricas y forzando al usuario a decidir qué hacer (Triage) con los tickets no terminados antes de cerrar.

Entrega el código listo para producción, asegurando la Clean Architecture y las interfa