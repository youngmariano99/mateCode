# MÓDULO: fase_3_kanban (La Trinchera y Desarrollo)

## 1. Objetivo del Módulo
Proveer un entorno de ejecución ágil de extrema fluidez. Gestionar Sprints o flujos continuos (Kanban), priorizar tareas, registrar bugs y conectar directamente con el **Motor de Prompts** para acelerar el desarrollo del código. Todo bajo la interfaz del "Modo Enfoque" (cero distracciones del CRM o la configuración global).

## 2. Procesos y Flujo de Trabajo
* **Tablero Ágil:** Movimiento de tickets (Historias, Tareas, Bugs) a través de columnas personalizables. Uso estricto de filtros de priorización (MoSCoW: Must have, Should have, etc.) y etiquetas de "Deuda Técnica".
* **Colaboración en Contexto:** Un panel lateral integrado donde se pueden dejar ideas, enlaces a repositorios (GitHub), URLs de despliegue (Netlify/Render) y donde caen los comentarios del "Link Mágico" del cliente. Todo se vincula a un Ticket.
* **El Motor de Prompts:** Botón dentro de cada ticket que lee la tarea actual, junta el ADN (Fase 0), el BDD (Fase 1) y el Stack (Fase 2), y escupe el prompt de desarrollo profesional.

## 3. Eficiencia de Base de Datos (OBLIGATORIO)
* **Prohibido el Reordenamiento Masivo:** Cuando se arrastra una tarjeta a la posición 1 de una columna, NUNCA se debe hacer un `UPDATE` a todos los demás tickets para sumarles +1 a su orden.
* **Solución (Lexicographical Rank):** Usar ordenación lexicográfica basada en texto. Si un ticket se mueve entre la posición `A` y `C`, su nuevo valor de orden pasa a ser `B` (o la media matemática flotante). Esto convierte el Drag & Drop en una transacción O(1) ultra ligera en PostgreSQL.

## 4. Retroalimentación y Métricas (El Beneficio Activo)
* **Cálculo de Velocidad (Velocity) / Cycle Time:** El sistema mide silenciosamente cuánto tiempo pasa un ticket en progreso. Si a futuro estimás una tarea parecida, te avisa de tus tiempos reales.
* **Reciclaje de Deuda Técnica:** Las etiquetas de "Deuda Técnica" no mueren. Si el Sprint termina, el sistema te sugiere devolverlas al Backlog para el próximo ciclo.
* **Micro-Copy Educativo (Tono Mentor Argentino):** * *Botón de Prompt:* "Generar Prompt Mágico".
  * *Alerta de Velocidad:* "Che, venís a un ritmo bárbaro, pero no te satures. Según tus sprints anteriores, meter esta historia pesada ahora te va a dejar sin margen. ¿La pasamos para el próximo?"
  * *Tooltip Deuda Técnica:* "Marcalo así si hoy lo ataste con alambre para zafar, pero sabés que mañana hay que refactorizarlo bien."

## 5. Reglas Estrictas para la IA (Generación de Código)
* **Librería D&D:** Usar EXCLUSIVAMENTE **Pragmatic Drag and Drop** de Atlassian (arquitectura Headless). **PROHIBIDO** usar `react-beautiful-dnd` o librerías que generen re-renders globales en React. La interacción táctil y visual debe sentirse inmediata.
* **Límite de Componentes:** Dividir el tablero minuciosamente: `<KanbanBoard />`, `<BoardColumn />`, `<TicketCard />`, `<PromptGeneratorModal />` y `<HubEnlaces />`. Mantener los archivos bajo las 250 líneas usando Custom Hooks (`useKanbanBoard.ts` para la lógica de arrastre).
* **Gestión de Estado:** El movimiento de la tarjeta (drag) se debe reflejar optimísticamente en la UI de React al instante, mientras la petición asíncrona a .NET ocurre en segundo plano (Optimistic UI).