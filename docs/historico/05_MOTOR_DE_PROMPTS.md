# 05_MOTOR_DE_PROMPTS: El Cerebro Generativo del "Anti-Jira"

## 1. Propósito del Motor
El Motor de Prompts es el sistema encargado de ensamblar el contexto del proyecto (Fases 0, 1 y 2) con la tarea actual del usuario (Fase 3), para generar instrucciones hiper-profesionales listas para ser ejecutadas por una IA (ya sea copiando al portapapeles o enviándolo a un modelo local).

## 2. Arquitectura Backend (.NET)
[cite_start]Para orquestar este motor sin depender exclusivamente de llamadas HTTP costosas, se DEBE utilizar el siguiente stack en el backend[cite: 132, 141, 147]:
* [cite_start]**Microsoft Semantic Kernel (SK):** Como orquestador principal en C#[cite: 141]. [cite_start]Permite crear "Plugins" con funciones nativas de .NET que la IA puede invocar[cite: 141].
* [cite_start]**Motor de Plantillas (Scriban):** Para compilar los prompts a velocidad extrema y baja asignación de memoria (zero-allocation)[cite: 143, 144]. [cite_start]Su sintaxis tipo Liquid/Handlebars es ideal para inyectar variables del estado del proyecto[cite: 143, 144].
* [cite_start]**Integración Local:** Preparado para derivar peticiones a Ollama (ej. Llama 3 o Phi-3 locales) garantizando privacidad y cero costo de API[cite: 146, 147].

## 3. Estructura de Inyección (La Receta del Prompt)
Cuando el usuario presiona "Generar Prompt de Desarrollo" en un ticket del Kanban, el backend en .NET debe hacer un JOIN lógico y armar un objeto `PromptContext` que contenga:

1. **Contexto Base (Fase 2):** Lee el `JSONB` de `vault.saved_stacks`. Extrae: Tecnologías (React, C#, Postgres), Arquitectura (Clean Architecture) y Principios (SOLID).
2. **Contexto de Negocio (Fase 0):** Lee `projects.project_context`. Extrae: Objetivo del software y Restricciones (para que la IA no proponga locuras comerciales).
3. **Contexto de Tarea (Fase 1 y 3):** Lee la historia de usuario específica y sus Criterios de Aceptación (BDD).
4. **Intención del Usuario:** El mini-input manual (Ej: "Armar el controlador y el test unitario").

## 4. Ejemplo de Plantilla en Scriban
El sistema debe tener plantillas guardadas en la base de datos (o en archivos `.scriban`). Ejemplo de plantilla maestra para desarrollo:

```text
Actúa como un Tech Lead Full-Stack Senior. Hablame en español argentino profesional y amigable.

Estamos trabajando en el proyecto "{{ project.name }}" bajo las siguientes reglas técnicas:
- Stack: {{ stack.frontend }}, {{ stack.backend }}, {{ stack.database }}
- Arquitectura: {{ stack.architecture }}
- Restricciones de negocio: {{ context.restrictions }}

Tu tarea es implementar la siguiente Historia de Usuario:
TÍTULO: {{ ticket.title }}
CRITERIOS DE ACEPTACIÓN (BDD):
{{ ticket.bdd_criteria }}

El usuario te solicita específicamente: "{{ user_intent }}"

Generá el código necesario respetando principios SOLID y limitando los archivos a no más de 250 líneas.

5. UI/UX del Motor en React (Fricción Cero)
Punto de Acceso: Dentro del modal de cada Ticket en el tablero Kanban, debe haber un botón destacado (ej. con un ícono de chispa/magia) que diga: "Generar Prompt Mágico".

Feedback: Al tocarlo, se muestra un esqueleto de carga rápida (Loading Skeleton) mientras el backend en C# compila la plantilla con Scriban.

Resultado: Un modal emergente (o panel lateral) con el prompt final armado. Debe incluir un botón de "Copiar al Portapapeles" gigante y claro.

Tono Educativo: Debajo del prompt, un texto motivacional: "¡Listo! Copiá este texto y pegalo en tu IA favorita. Como ya le pasamos tu stack y los criterios BDD, el código va a salir un lujo a la primera."

